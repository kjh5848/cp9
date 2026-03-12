require('dotenv').config({ path: '.env.local' });
const { searchCoupangProductsTool } = require('./src/features/autopilot/lib/agent/coupang-search-tool.js');

async function run() {
  const ts = require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });
  const { searchCoupangProductsTool } = require('./src/features/autopilot/lib/agent/coupang-search-tool.ts');
  const res = await searchCoupangProductsTool('사무실 의자', 10, { minPrice: null, maxPrice: null, isRocketOnly: false });
  console.log(res.length);
}
run();
