const cron = require('node-cron');
const { runSync } = require('./coreSyncService');

// 기간계 폴링 주기. 대부분의 기간계는 실시간 웹훅을 지원하지 않으므로 정기 폴링이 기본값.
const CRON_EXPR = process.env.CORE_SYNC_CRON || '*/10 * * * *';

function start() {
  cron.schedule(CRON_EXPR, async () => {
    try {
      const result = await runSync('schedule');
      if (result.ok && result.created > 0) {
        console.log(`[core-sync] 신규 반송 ${result.created}건 접수 (조회 ${result.fetched}건, 중복 ${result.skipped}건)`);
      }
    } catch (err) {
      console.error('[core-sync] 동기화 실패:', err.message);
    }
  });
  console.log(`[core-sync] 기간계 자동 동기화 스케줄러 시작 (cron="${CRON_EXPR}")`);
}

module.exports = { start };
