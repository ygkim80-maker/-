const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function smsMessage(shipment) {
  const link = `${BASE_URL}/r/${shipment.response_token}`;
  return (
    `[카드 재배송 안내]\n` +
    `${shipment.customer_name}님, 수취인 부재로 카드(${shipment.card_type})가 반송되었습니다.\n` +
    `아래 링크에서 재배송을 신청해 주세요.\n${link}`
  );
}

function voiceScript(shipment) {
  return (
    `안녕하세요, ${shipment.customer_name}님. 카드 배송 안내 드립니다. ` +
    `고객님 부재로 인해 ${shipment.card_type} 카드가 반송되어 ${shipment.branch}(으)로 보관 중입니다. ` +
    `재배송을 원하시면 1번, 지점 방문 수령을 원하시면 2번, 상담원 연결을 원하시면 3번을 눌러주세요.`
  );
}

module.exports = { smsMessage, voiceScript };
