// 기간계 연동 전 개발/데모용 어댑터. 실제 API 없이, 폴링할 때마다 반송 접수 건을
// 무작위로 1~2건씩 새로 "생성"해서 돌려준다 (기간계가 실시간으로 반송 데이터를
// 쌓아가는 상황을 흉내낸다). CORE_API_BASE_URL이 설정되지 않은 경우 기본값으로 사용된다.

const NAMES = ['박민수', '정수진', '오지훈', '한소영', '배재현'];
const CARDS = ['체크카드', '신용카드', '법인카드'];
const BRANCHES = ['강남지점', '부산지점', '본사', '대구지점', '광주지점'];

let counter = 0;

function randOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// sinceISO 이후에 기간계 쪽에서 새로 반송 확정된 건만 조회한다고 가정.
// 데모 목적상 폴링될 때마다 30% 확률로 0~2건을 새로 발생시킨다.
async function fetchReturnedShipments(sinceISO) {
  const emit = Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 2) : 0;
  const records = [];
  for (let i = 0; i < emit; i++) {
    counter += 1;
    records.push({
      externalId: `CORE-${Date.now()}-${counter}`,
      trackingNo: `9${String(Date.now()).slice(-9)}${counter}`,
      customerName: randOne(NAMES),
      phone: `010${String(1000 + Math.floor(Math.random() * 8999)).padStart(4, '0')}${String(
        1000 + Math.floor(Math.random() * 8999)
      ).padStart(4, '0')}`,
      cardType: randOne(CARDS),
      branch: randOne(BRANCHES),
      address: '서울시 종로구 세종대로 1',
      returnReason: '수취인부재',
      returnedAt: new Date().toISOString(),
    });
  }
  return records;
}

module.exports = { name: 'mock', fetchReturnedShipments };
