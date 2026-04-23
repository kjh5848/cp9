import * as cheerio from 'cheerio';

async function searchDuckDuckGoHTML(query) {
  // First get the token
  const vqdRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
  const vqdHtml = await vqdRes.text();
  const vqdMatch = vqdHtml.match(/vqd=([a-zA-Z0-9_\-]+)/);
  if (!vqdMatch) throw new Error("Could not find vqd token");
  const vqd = vqdMatch[1];
  
  // Now hit the actual image API
  const url = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
    }
  });
  
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.results.map(r => r.image);
  } catch(e) {
    console.log("Response text:", text.slice(0, 100));
    return [];
  }
}

searchDuckDuckGoHTML('레노버 노트북').then(imgs => console.log('DDG images found:', imgs.slice(0, 3))).catch(console.error);
