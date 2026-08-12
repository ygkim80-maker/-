// 실제 기간계(사내 코어 시스템) REST API 연동 어댑터.
// 기간계마다 인증 방식/응답 필드명이 다르므로, .env 설정만으로 대부분 맞출 수 있도록
// 인증 3종(Bearer / API-Key 헤더 / Basic)과 필드 매핑을 환경변수로 뺐다.
// 엔드포인트가 REST/JSON이 아니거나(SOAP, 고정폭 배치파일 등) 인증 방식이 특수하면
// 이 파일의 fetchReturnedShipments 본문만 교체하면 된다 — 인터페이스(반환 형식)는 유지할 것.
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 기간계 응답 필드명 -> 내부 필드명 매핑.
// 예) CORE_API_FIELD_MAP='{"trackingNo":"invoiceNo","customerName":"custNm","phone":"custTel","cardType":"prdtNm","branch":"brchNm","address":"addr","returnedAt":"rtnDt","externalId":"rtnSeq"}'
function getFieldMap() {
  const raw = process.env.CORE_API_FIELD_MAP;
  if (!raw) {
    // 기본값: 기간계가 이미 내부와 동일한 필드명으로 내려준다고 가정
    return {
      externalId: 'externalId',
      trackingNo: 'trackingNo',
      customerName: 'customerName',
      phone: 'phone',
      cardType: 'cardType',
      branch: 'branch',
      address: 'address',
      returnReason: 'returnReason',
      returnedAt: 'returnedAt',
    };
  }
  return JSON.parse(raw);
}

function buildAuthHeaders() {
  const type = (process.env.CORE_API_AUTH_TYPE || 'bearer').toLowerCase();
  if (type === 'bearer') {
    return { Authorization: `Bearer ${process.env.CORE_API_TOKEN}` };
  }
  if (type === 'apikey') {
    const header = process.env.CORE_API_KEY_HEADER || 'x-api-key';
    return { [header]: process.env.CORE_API_TOKEN };
  }
  if (type === 'basic') {
    const cred = Buffer.from(
      `${process.env.CORE_API_USERNAME || ''}:${process.env.CORE_API_PASSWORD || ''}`
    ).toString('base64');
    return { Authorization: `Basic ${cred}` };
  }
  return {};
}

function request(url) {
  const lib = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      { method: 'GET', headers: { Accept: 'application/json', ...buildAuthHeaders() } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 300) {
            return reject(new Error(`기간계 API 응답 오류 (${res.statusCode}): ${data.slice(0, 300)}`));
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`기간계 API 응답 파싱 실패: ${data.slice(0, 300)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function mapRecord(raw, fieldMap) {
  const mapped = {};
  Object.entries(fieldMap).forEach(([internalKey, externalKey]) => {
    mapped[internalKey] = raw[externalKey];
  });
  return mapped;
}

// sinceISO: 마지막 동기화 이후 데이터만 요청 (기간계 API가 지원하는 쿼리 파라미터명은
// CORE_API_SINCE_PARAM으로 지정, 기본값 'since')
async function fetchReturnedShipments(sinceISO) {
  const baseUrl = process.env.CORE_API_BASE_URL;
  const endpoint = process.env.CORE_API_RETURNED_ENDPOINT || '/api/returns';
  if (!baseUrl) throw new Error('CORE_API_BASE_URL이 설정되지 않았습니다.');

  const url = new URL(endpoint, baseUrl);
  const sinceParam = process.env.CORE_API_SINCE_PARAM || 'since';
  if (sinceISO) url.searchParams.set(sinceParam, sinceISO);

  const body = await request(url);
  const list = Array.isArray(body) ? body : body.items || body.data || [];
  const fieldMap = getFieldMap();
  return list.map((raw) => mapRecord(raw, fieldMap));
}

module.exports = { name: 'rest', fetchReturnedShipments };
