const cron = require('node-cron');
const { dueForRetry, notifyShipment } = require('./reshipmentService');

// 데모 편의를 위해 기본 재시도 간격을 짧게 둔다(실서비스는 분 단위 대신 시간/일 단위 권장).
const RETRY_AFTER_MINUTES = Number(process.env.RETRY_AFTER_MINUTES || 60);
const CRON_EXPR = process.env.RETRY_CRON || '*/5 * * * *';

function start() {
  cron.schedule(CRON_EXPR, async () => {
    const targets = dueForRetry(RETRY_AFTER_MINUTES);
    for (const shipment of targets) {
      try {
        const result = await notifyShipment(shipment.id);
        console.log(
          `[scheduler] 재시도 발송 shipment=${shipment.id} attempt=${result.attempt} channel=${result.channel}`
        );
      } catch (err) {
        console.error(`[scheduler] shipment=${shipment.id} 재시도 실패:`, err.message);
      }
    }
  });
  console.log(`[scheduler] 자동 재시도 스케줄러 시작 (cron="${CRON_EXPR}", retryAfter=${RETRY_AFTER_MINUTES}분)`);
}

module.exports = { start };
