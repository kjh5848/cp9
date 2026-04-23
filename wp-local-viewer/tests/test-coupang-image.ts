import * as cheerio from 'cheerio';

async function fetchCoupangImage(productUrl: string) {
  try {
    console.log('Fetching:', productUrl);
    
    // Using a mobile user-agent or Googlebot
    const response = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow'
    });

    console.log('Status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.log('Body starts with:', text.substring(0, 200));
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const images: string[] = [];
    $('.prod-image__item').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src');
      if (src) images.push(src);
    });
    
    console.log('Found images:', images);

  } catch (error) {
    console.error('Error:', error);
  }
}

fetchCoupangImage('https://link.coupang.com/re/AFFSDP?lptag=AF1234567&pageKey=319834306&itemId=1023216541&vendorItemId=70064597513&traceid=V0-163-5fddb21eaffbb2ef');
