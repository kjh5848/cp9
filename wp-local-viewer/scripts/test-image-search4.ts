import { google } from 'googleapis';
import 'dotenv/config';

const customsearch = google.customsearch('v1');

async function searchGoogleImages() {
  const query = '고급스러운 포장 상자에 담긴 선물용 목걸이';
  
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
      console.log('-> API Key 또는 CX 값이 .env에 없습니다.');
      return;
  }
  
  try {
    const res = await customsearch.cse.list({
      cx,
      q: query,
      auth: apiKey,
      searchType: 'image',
      num: 3
    });
    
    console.log(`-> 검색 성공: ${res.data.items?.length || 0}개`);
    if (res.data.items && res.data.items.length > 0) {
      console.log('  [1순위 이미지]:', res.data.items[0].link);
    }
  } catch(e: any) {
    console.log('-> 검색 실패:', e.message);
  }
}
searchGoogleImages();
