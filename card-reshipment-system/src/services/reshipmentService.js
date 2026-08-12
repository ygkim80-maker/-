const { nanoid } = require('nanoid');
const db = require('../db');
const { pickSmsProvider, pickVoiceProvider } = require('./notify');
const { smsMessage, voiceScript } = require('./templates');

const MAX_ATTEMPTS = Number(process.env.MAX_NOTIFY_ATTEMPTS || 3);
// 3번째 시도부터는 문자 대신 ARS 음성 발신으로 전환(기존에 담당자가 전화하던 것을 자동화)
const VOICE_FROM_ATTEMPT = Number(process.env.VOICE_FROM_ATTEMPT || 3);

function touch(id) {
  db.prepare(`UPDATE shipments SET updated_at = datetime('now') WHERE id = ?`).run(id);
}

function getShipment(id) {
  return db.prepare('SELECT * FROM shipments WHERE id = ?').get(id);
}

function getShipmentByToken(token) {
  return db.prepare('SELECT * FROM shipments WHERE response_token = ?').get(token);
}

function listShipments({ status, branch } = {}) {
  let sql = 'SELECT * FROM shipments WHERE 1=1';
  const params = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (branch) {
    sql += ' AND branch = ?';
    params.push(branch);
  }
  sql += ' ORDER BY created_at DESC';
  return db.prepare(sql).all(...params);
}

function createShipment(data) {
  const stmt = db.prepare(`
    INSERT INTO shipments (tracking_no, customer_name, phone, card_type, branch, original_address, status)
    VALUES (@tracking_no, @customer_name, @phone, @card_type, @branch, @original_address, 'in_transit')
  `);
  const info = stmt.run(data);
  return getShipment(info.lastInsertRowid);
}

function findByTrackingNo(trackingNo) {
  return db.prepare('SELECT * FROM shipments WHERE tracking_no = ?').get(trackingNo);
}

// 기간계가 이미 "반송 확정"으로 내려준 건을 그대로 접수한다 — 담당자의 수기 "반송등록"
// 단계 없이 바로 returned 상태로 생성하고, 뒤이어 자동 안내 발송까지 트리거된다.
function importReturnedShipment(record) {
  if (findByTrackingNo(record.trackingNo)) return null; // 이미 동기화된 건 (중복 방지)
  const token = nanoid(12);
  const stmt = db.prepare(`
    INSERT INTO shipments
      (tracking_no, customer_name, phone, card_type, branch, original_address, status,
       return_reason, returned_at, response_token)
    VALUES (@tracking_no, @customer_name, @phone, @card_type, @branch, @original_address, 'returned',
       @return_reason, @returned_at, @response_token)
  `);
  const info = stmt.run({
    tracking_no: record.trackingNo,
    customer_name: record.customerName,
    phone: record.phone,
    card_type: record.cardType,
    branch: record.branch,
    original_address: record.address,
    return_reason: record.returnReason || '수취인부재',
    returned_at: record.returnedAt || new Date().toISOString(),
    response_token: token,
  });
  return getShipment(info.lastInsertRowid);
}

// 지점/본사 담당자가 반송된 실물을 확인하고 "반송 등록"하는 시점 = 자동화 트리거 지점
function markReturned(id) {
  const shipment = getShipment(id);
  if (!shipment) throw new Error('배송 건을 찾을 수 없습니다.');
  const token = nanoid(12);
  db.prepare(`
    UPDATE shipments
    SET status = 'returned', returned_at = datetime('now'), response_token = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(token, id);
  return notifyShipment(id);
}

function logNotification({ shipmentId, channel, provider, message, status, error }) {
  db.prepare(`
    INSERT INTO notification_logs (shipment_id, channel, provider, message, status, error)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(shipmentId, channel, provider, message, status, error || null);
}

// 반송 건에 대해 안내를 발송한다. 시도 횟수가 쌓이면 문자 -> ARS 음성으로 자동 에스컬레이션.
async function notifyShipment(id) {
  const shipment = getShipment(id);
  if (!shipment) throw new Error('배송 건을 찾을 수 없습니다.');
  if (!shipment.response_token) throw new Error('반송 등록이 되지 않은 건입니다.');

  const nextAttempt = shipment.notify_attempts + 1;
  const useVoice = nextAttempt >= VOICE_FROM_ATTEMPT;
  const channel = useVoice ? 'voice' : 'sms';

  let result;
  let errorMessage = null;
  let content;

  try {
    if (useVoice) {
      const provider = pickVoiceProvider();
      content = voiceScript(shipment);
      result = await provider.makeVoiceCall({ to: shipment.phone, script: content });
      logNotification({ shipmentId: id, channel, provider: provider.name, message: content, status: 'sent' });
    } else {
      const provider = pickSmsProvider();
      content = smsMessage(shipment);
      result = await provider.sendSms({ to: shipment.phone, message: content });
      logNotification({ shipmentId: id, channel, provider: provider.name, message: content, status: 'sent' });
    }
  } catch (err) {
    errorMessage = err.message;
    logNotification({
      shipmentId: id,
      channel,
      provider: useVoice ? pickVoiceProvider().name : pickSmsProvider().name,
      message: content || '',
      status: 'failed',
      error: errorMessage,
    });
  }

  const newStatus = shipment.status === 'customer_responded' ? shipment.status : 'notified';
  db.prepare(`
    UPDATE shipments
    SET notify_attempts = ?, last_notified_at = datetime('now'), status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(nextAttempt, newStatus, id);

  return { ok: !errorMessage, channel, attempt: nextAttempt, error: errorMessage };
}

// 담당자 수동 개입이 필요한 건: 자동 발송을 최대 횟수까지 시도했지만 고객 응답이 없는 경우
function needsManualCall() {
  return db
    .prepare(
      `SELECT * FROM shipments
       WHERE status = 'notified' AND notify_attempts >= ?
       ORDER BY last_notified_at ASC`
    )
    .all(MAX_ATTEMPTS);
}

// 자동 재시도 대상: 알림을 보냈지만 일정 시간이 지나도 응답이 없고, 최대 횟수에 도달하지 않은 건
function dueForRetry(retryAfterMinutes) {
  return db
    .prepare(
      `SELECT * FROM shipments
       WHERE status = 'notified'
         AND notify_attempts < ?
         AND datetime(last_notified_at) <= datetime('now', ?)`
    )
    .all(MAX_ATTEMPTS, `-${retryAfterMinutes} minutes`);
}

function recordCustomerResponse(token, { choice, newAddress, preferredDate }) {
  const shipment = getShipmentByToken(token);
  if (!shipment) throw new Error('유효하지 않은 링크입니다.');
  db.prepare(`
    UPDATE shipments
    SET status = 'customer_responded', response_choice = ?, new_address = ?, preferred_date = ?,
        responded_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).run(choice, newAddress || null, preferredDate || null, shipment.id);
  return getShipment(shipment.id);
}

function updateStatus(id, status) {
  const allowed = ['in_transit', 'returned', 'notified', 'customer_responded', 'rescheduled', 'redelivered', 'closed'];
  if (!allowed.includes(status)) throw new Error(`허용되지 않은 상태: ${status}`);
  db.prepare(`UPDATE shipments SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
  return getShipment(id);
}

function getLogs(shipmentId) {
  return db
    .prepare('SELECT * FROM notification_logs WHERE shipment_id = ? ORDER BY sent_at DESC')
    .all(shipmentId);
}

function getStats() {
  const rows = db.prepare('SELECT status, COUNT(*) as count FROM shipments GROUP BY status').all();
  const byStatus = {};
  rows.forEach((r) => (byStatus[r.status] = r.count));
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const manualCallNeeded = needsManualCall().length;
  return { total, byStatus, manualCallNeeded };
}

module.exports = {
  createShipment,
  findByTrackingNo,
  importReturnedShipment,
  markReturned,
  notifyShipment,
  recordCustomerResponse,
  listShipments,
  getShipment,
  getShipmentByToken,
  updateStatus,
  getLogs,
  getStats,
  needsManualCall,
  dueForRetry,
  MAX_ATTEMPTS,
};
