require('dotenv').config({ path: '.env.local' });
const { generateCoupangSignature } = require('./src/infrastructure/utils/coupang-hmac.ts');
// since it's ts, let's just make a small node script
