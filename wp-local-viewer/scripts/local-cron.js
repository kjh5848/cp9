const http = require('http');

console.log('🚀 [Local Cron] Starting local development cron scheduler...');
console.log('   This script simulates Vercel Cron jobs by periodically calling API endpoints.');
console.log('   Ensure your Next.js dev server is running on http://localhost:3000\n');

// 설정 시간 (밀리초)
const CAMPAIGN_INTERVAL = 60 * 60 * 1000; // 1시간 (캠페인 -> 큐 생성)
const AUTOPILOT_INTERVAL = 5 * 60 * 1000; // 5분 (큐 -> 실제 발행 처리)

function callApi(path, name) {
  console.log(`[Local Cron] Triggering ${name} (${path}) at ${new Date().toLocaleTimeString()}...`);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    headers: {
      // 로컬 개발 환경용 가짜 인증 헤더 (필요시)
      'Authorization': `Bearer local-dev`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.success) {
          console.log(`✅ [${name}] Success:`, parsed);
        } else {
          console.log(`⚠️  [${name}] Warning/Info:`, parsed);
        }
      } catch (e) {
        console.log(`❓ [${name}] Response:`, data.substring(0, 100) + '...');
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ [${name}] 연결 실패 (서버가 켜져 있는지 확인하세요):`, error.message);
  });

  req.end();
}

// 1. 스크립트 실행 후 즉시 한 번씩 테스트 호출 (Optional)
// callApi('/api/cron/campaigns', 'Campaign Generator Timer');
// callApi('/api/cron/autopilot', 'Autopilot Queue Publisher Timer');

// 2. 주기적 실행 등록
setInterval(() => {
  callApi('/api/cron/autopilot', 'Autopilot Queue Publisher Timer');
}, AUTOPILOT_INTERVAL);

setInterval(() => {
  callApi('/api/cron/campaigns', 'Campaign Generator Timer');
}, CAMPAIGN_INTERVAL);

console.log(`⏰ Scheduled:`);
console.log(`   - Queue Publisher (/api/cron/autopilot) runs every ${AUTOPILOT_INTERVAL / 60000} minutes`);
console.log(`   - Campaign Generator (/api/cron/campaigns) runs every ${CAMPAIGN_INTERVAL / 3600000} hour(s)`);
console.log(`\nPress Ctrl+C to stop.\n`);
