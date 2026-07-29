// Mock 발송 provider. 실제 통신사/API 없이 콘솔 로그로 발송을 시뮬레이션한다.
// 실제 서비스 전환 시 aligoProvider.js / twilioProvider.js 처럼 동일한 인터페이스로 교체하면 된다.

async function sendSms({ to, message }) {
  console.log(`[MOCK-SMS] -> ${to}\n${message}\n`);
  return { ok: true, providerMessageId: `mock-sms-${Date.now()}` };
}

async function makeVoiceCall({ to, script }) {
  console.log(`[MOCK-VOICE] 발신 -> ${to}\nARS 스크립트:\n${script}\n`);
  return { ok: true, providerMessageId: `mock-voice-${Date.now()}` };
}

module.exports = { name: 'mock', sendSms, makeVoiceCall };
