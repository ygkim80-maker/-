// 실제 알리고(Aligo) SMS API 연동 예시. ALIGO_API_KEY / ALIGO_USER_ID / ALIGO_SENDER 환경변수가
// 설정된 경우에만 index.js 팩토리에서 선택된다. 문서: https://smartsms.aligo.in/admin/api/spec.html
const https = require('https');
const querystring = require('querystring');

function post(hostname, pathName, params) {
  const body = querystring.stringify(params);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path: pathName,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Aligo 응답 파싱 실패: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendSms({ to, message }) {
  const { ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER } = process.env;
  const result = await post('apis.aligo.in', '/send/', {
    key: ALIGO_API_KEY,
    user_id: ALIGO_USER_ID,
    sender: ALIGO_SENDER,
    receiver: to,
    msg: message,
    msg_type: message.length > 45 ? 'LMS' : 'SMS',
  });
  if (String(result.result_code) !== '1') {
    throw new Error(`Aligo 발송 실패: ${result.message || JSON.stringify(result)}`);
  }
  return { ok: true, providerMessageId: result.msg_id };
}

module.exports = { name: 'aligo', sendSms };
