import * as cheerio from 'cheerio';

async function searchDuckDuckGoHTML(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const images = [];
  $('.zcm__link').each((i, el) => {
    // console.log($(el).attr('href'));
  });
  
  $('img.result__icon__img').each((i, el) => {
    let src = $(el).attr('src');
    if (src && src.startsWith('//')) src = 'https:' + src;
    if (src) {
      images.push(src);
    }
  });

  return images;
}

searchDuckDuckGoHTML('레노버 노트북').then(imgs => console.log('DDG HTML images found:', imgs.slice(0, 3))).catch(console.error);
