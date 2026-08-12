const mockAdapter = require('./mockAdapter');
const restAdapter = require('./restAdapter');

// CORE_API_BASE_URL이 설정되면 실제 기간계 REST 어댑터를, 없으면 데모용 mock을 사용한다.
function getAdapter() {
  if (process.env.CORE_API_BASE_URL) return restAdapter;
  return mockAdapter;
}

module.exports = { getAdapter };
