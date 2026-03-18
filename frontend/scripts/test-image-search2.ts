import { searchImages, SafeSearchType } from 'duck-duck-scrape';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testDuckDuckGoImageSearch() {
  console.log('🔍 DuckDuckGo 이미지 검색 우회 방법 테스트...');
  const query = '고급스러운 포장 상자에 담긴 선물용 목걸이';

  try {
     console.log('1. Scraper 라이브러리 (duck-duck-scrape) 시도:');
     const sr = await searchImages(query, { safeSearch: SafeSearchType.STRICT });
     console.log('성공:', sr.results.length);
  } catch (e: any) {
     console.log('-> 실패:', e.message);
  }
  
  try {
     console.log('2. 네이* 이미지 검색 크롤링 시도:');
     const url = `https://search.naver.com/search.naver?where=image&sm=tab_jum&query=${encodeURIComponent(query)}`;
     const response = await axios.get(url, {
       headers: {
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
       }
     });
     
     const $ = cheerio.load(response.data);
     const images: string[] = [];
     
     $('img._image').each((i, el) => {
       const src = $(el).attr('data-lazy-src') || $(el).attr('src');
       if (src && src.startsWith('http')) {
         images.push(src);
       }
     });
     console.log('-> 검색 성공:', images.length, '개 (첫번째: ' + images[0] + ')');
  } catch (e: any) {
     console.log('-> 검색 실패:', e.message);
  }
}

testDuckDuckGoImageSearch();
