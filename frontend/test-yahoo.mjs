import * as cheerio from 'cheerio';

async function searchYahooImages(query) {
  const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const images = [];
  $('#sres li.ld a img').each((i, el) => {
    // Yahoo lazy loads images, data-src usually has the actual URL or a thumbnail URL
    const src = $(el).attr('data-src') || $(el).attr('src');
    if (src && src.startsWith('http')) {
      images.push(src);
    }
  });

  // some times they are in a JSON hidden in the page
  if (images.length === 0) {
     const match = html.match(/"ou":"([^"]+)"/g);
     if (match) {
         match.forEach(m => {
             const url = m.replace('"ou":"', '').replace('"', '');
             if (!url.includes('yimg.com')) images.push(url);
         });
     }
  }

  return images;
}

searchYahooImages('레노버 노트북').then(imgs => console.log('Yahoo images found:', imgs.slice(0, 3))).catch(console.error);
