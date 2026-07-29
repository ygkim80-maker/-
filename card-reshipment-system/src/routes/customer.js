const express = require('express');
const svc = require('../services/reshipmentService');

const router = express.Router();

// 문자/ARS 안내에 포함된 링크로 접속했을 때 조회되는 배송 정보
router.get('/:token', (req, res) => {
  const shipment = svc.getShipmentByToken(req.params.token);
  if (!shipment) return res.status(404).json({ error: '유효하지 않거나 만료된 링크입니다.' });
  const { id, phone, response_token, ...safe } = shipment;
  res.json(safe);
});

// 고객이 재배송 방식을 선택/신청
router.post('/:token/respond', (req, res) => {
  const { choice, newAddress, preferredDate } = req.body;
  const allowed = ['redeliver_same', 'redeliver_new', 'pickup_branch', 'cancel'];
  if (!allowed.includes(choice)) {
    return res.status(400).json({ error: '허용되지 않은 선택입니다.' });
  }
  if (choice === 'redeliver_new' && !newAddress) {
    return res.status(400).json({ error: '새 배송지 주소를 입력해 주세요.' });
  }
  try {
    const shipment = svc.recordCustomerResponse(req.params.token, { choice, newAddress, preferredDate });
    res.json(shipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
