const express = require('express');
const svc = require('../services/reshipmentService');

const router = express.Router();

router.get('/shipments', (req, res) => {
  const { status, branch } = req.query;
  res.json(svc.listShipments({ status, branch }));
});

router.get('/shipments/:id', (req, res) => {
  const shipment = svc.getShipment(req.params.id);
  if (!shipment) return res.status(404).json({ error: '배송 건을 찾을 수 없습니다.' });
  res.json({ ...shipment, logs: svc.getLogs(shipment.id) });
});

// 지점/본사에서 반송 실물을 접수 등록 (실제로는 창고 스캔/입고 시스템과 연동 가능)
router.post('/shipments', (req, res) => {
  const { tracking_no, customer_name, phone, card_type, branch, original_address } = req.body;
  if (!tracking_no || !customer_name || !phone || !card_type || !branch || !original_address) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
  }
  const shipment = svc.createShipment({ tracking_no, customer_name, phone, card_type, branch, original_address });
  res.status(201).json(shipment);
});

// 반송 등록 + 자동 1차 안내 발송 트리거 (기존 수기 프로세스를 대체하는 핵심 동작)
router.post('/shipments/:id/mark-returned', async (req, res) => {
  try {
    const result = await svc.markReturned(req.params.id);
    res.json({ shipment: svc.getShipment(req.params.id), notify: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 담당자가 수동으로 재발송 트리거 (자동 스케줄러 외 즉시 재발송이 필요한 경우)
router.post('/shipments/:id/notify', async (req, res) => {
  try {
    const result = await svc.notifyShipment(req.params.id);
    res.json({ shipment: svc.getShipment(req.params.id), notify: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/shipments/:id/status', (req, res) => {
  try {
    const shipment = svc.updateStatus(req.params.id, req.body.status);
    res.json(shipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/manual-call-needed', (req, res) => {
  res.json(svc.needsManualCall());
});

router.get('/stats', (req, res) => {
  res.json(svc.getStats());
});

module.exports = router;
