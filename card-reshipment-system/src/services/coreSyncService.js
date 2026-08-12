const db = require('../db');
const { getAdapter } = require('./coreSystem');
const reshipmentService = require('./reshipmentService');

function getState(key) {
  const row = db.prepare('SELECT value FROM sync_state WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setState(key, value) {
  db.prepare(`
    INSERT INTO sync_state (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function getLastSyncedAt() {
  return getState('last_synced_at');
}

function recentRuns(limit = 20) {
  return db.prepare('SELECT * FROM sync_runs ORDER BY id DESC LIMIT ?').all(limit);
}

// 기간계에서 반송 확정 건을 가져와 반송 접수 + 자동 안내발송까지 한 번에 처리한다.
// trigger: 'schedule'(정기 폴링) | 'manual'(관리자 수동 동기화)
async function runSync(trigger = 'schedule') {
  const adapter = getAdapter();
  const since = getLastSyncedAt();
  const startedAt = new Date().toISOString();
  const runInfo = db
    .prepare(`INSERT INTO sync_runs (adapter, trigger, status, started_at) VALUES (?, ?, 'running', ?)`)
    .run(adapter.name, trigger, startedAt);
  const runId = runInfo.lastInsertRowid;

  let fetched = [];
  try {
    fetched = await adapter.fetchReturnedShipments(since);
  } catch (err) {
    db.prepare(`
      UPDATE sync_runs SET status = 'failed', error = ?, finished_at = datetime('now') WHERE id = ?
    `).run(err.message, runId);
    return { ok: false, error: err.message, fetched: 0, created: 0, skipped: 0 };
  }

  let created = 0;
  let skipped = 0;
  let latestReturnedAt = since;

  for (const record of fetched) {
    if (!record.trackingNo || !record.customerName || !record.phone) {
      skipped += 1;
      continue;
    }
    const shipment = reshipmentService.importReturnedShipment(record);
    if (!shipment) {
      skipped += 1; // 이미 동기화된 건 (중복)
      continue;
    }
    created += 1;
    if (!latestReturnedAt || record.returnedAt > latestReturnedAt) latestReturnedAt = record.returnedAt;
    try {
      await reshipmentService.notifyShipment(shipment.id); // 접수 즉시 1차 안내 자동 발송
    } catch (err) {
      // 발송 실패는 notification_logs에 이미 기록되므로 동기화 자체는 계속 진행
    }
  }

  if (latestReturnedAt) setState('last_synced_at', latestReturnedAt);
  setState('last_sync_run_at', new Date().toISOString());

  db.prepare(`
    UPDATE sync_runs
    SET status = 'success', fetched_count = ?, created_count = ?, skipped_count = ?, finished_at = datetime('now')
    WHERE id = ?
  `).run(fetched.length, created, skipped, runId);

  return { ok: true, fetched: fetched.length, created, skipped };
}

function getStatus() {
  const adapter = getAdapter();
  const last = recentRuns(1)[0] || null;
  return {
    adapter: adapter.name,
    configured: adapter.name === 'rest',
    lastSyncedAt: getLastSyncedAt(),
    lastRun: last,
  };
}

module.exports = { runSync, getStatus, recentRuns };
