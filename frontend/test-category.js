require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
const crypto = require('crypto');

async function testCategory() {
  const method = 'GET';
  const url = '/v2/providers/affiliate_open_api/apis/openapi/v1/products/bestcategories/1001?limit=2';
  const datetime = new Date().toISOString().replace(/[:-]|\\.\\d{3}/g, '').slice(0,15) + 'Z';
  const message = datetime + method + url;
  const hmac = crypto.createHmac('sha256', process.env.COUPANG_SECRET_KEY).update(message).digest('hex');
  const auth = `CEA algorithm=HmacSHA256, access-key=${process.env.COUPANG_ACCESS_KEY}, signed-date=${datetime}, signature=${hmac}`;

  const res = await fetch(`https://api-gateway.coupang.com${url}`, {
    headers: { Authorization: auth }
  });
  const data = await res.json();
  console.log(JSON.stringify(data.data[0], null, 2));
}

testCategory();
