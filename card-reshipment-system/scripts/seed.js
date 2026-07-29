// 데모용 샘플 데이터 생성 스크립트: npm run seed
const svc = require('../src/services/reshipmentService');

const samples = [
  { tracking_no: '5001234567', customer_name: '홍길동', phone: '01011112222', card_type: '체크카드', branch: '강남지점', original_address: '서울시 강남구 테헤란로 123' },
  { tracking_no: '5001234568', customer_name: '김영희', phone: '01022223333', card_type: '신용카드', branch: '부산지점', original_address: '부산시 해운대구 센텀로 45' },
  { tracking_no: '5001234569', customer_name: '이철수', phone: '01033334444', card_type: '법인카드', branch: '본사', original_address: '서울시 중구 을지로 10' },
];

(async () => {
  for (const s of samples) {
    const shipment = svc.createShipment(s);
    console.log(`생성됨: #${shipment.id} ${shipment.customer_name}`);
  }
  console.log('시드 완료. npm start 로 서버 실행 후 /admin 에서 "반송등록+안내발송"을 눌러 흐름을 확인하세요.');
  process.exit(0);
})();
