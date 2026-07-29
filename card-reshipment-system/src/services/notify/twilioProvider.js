// 실제 Twilio SMS/Voice(ARS) 연동 예시. TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER
// 환경변수가 설정된 경우에만 index.js 팩토리에서 선택된다.
// TwiML 문서: https://www.twilio.com/docs/voice/twiml
const https = require('https');
const querystring = require('querystring');

function post(pathName, params) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  const body = querystring.stringify(params);
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}${pathName}`,
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            reject(new Error(`Twilio 응답 파싱 실패: ${data}`));
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
  const { body, status } = await post('/Messages.json', {
    To: to,
    From: process.env.TWILIO_FROM_NUMBER,
    Body: message,
  });
  if (status >= 300) throw new Error(`Twilio SMS 발송 실패: ${JSON.stringify(body)}`);
  return { ok: true, providerMessageId: body.sid };
}

// script를 그대로 읽어주는 최소 TwiML을 인라인으로 넘긴다(Twilio는 실제로는 공개 URL의
// TwiML 문서를 요구하므로, 운영 전환 시 script를 렌더링하는 엔드포인트 URL을 Url 파라미터로 넘길 것).
async function makeVoiceCall({ to, script }) {
  const twiml = `<Response><Say language="ko-KR">${script}</Say></Response>`;
  const { body, status } = await post('/Calls.json', {
    To: to,
    From: process.env.TWILIO_FROM_NUMBER,
    Twiml: twiml,
  });
  if (status >= 300) throw new Error(`Twilio Voice 발신 실패: ${JSON.stringify(body)}`);
  return { ok: true, providerMessageId: body.sid };
}

module.exports = { name: 'twilio', sendSms, makeVoiceCall };
