import * as cheerio from 'cheerio';

async function searchGoogleImages(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    }
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const images = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && src.startsWith('http') && !src.includes('googlelogo')) {
      images.push(src);
    }
  });
  
  return images;
}

searchGoogleImages('레노버 노트북 노이즈 캔슬링').then(imgs => console.log('Google images found:', imgs.slice(0, 3))).catch(console.error);
