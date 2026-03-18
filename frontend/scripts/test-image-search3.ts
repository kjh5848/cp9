import axios from 'axios';
import 'dotenv/config';

async function testGoogleCustomSearch() {
  console.log('🔍 Google Custom Search API (CSE) 테스트...');
  const query = '고급스러운 포장 상자에 담긴 선물용 목걸이';
  
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  
  if (!apiKey || !cx) {
      console.log('-> API Key 또는 CX 값이 .env에 없습니다.');
      return;
  }

  try {
     const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=3`;
     const response = await axios.get(url);
     
     const items = response.data.items || [];
     console.log(`-> 검색 성공: ${items.length}개`);
     if (items.length > 0) {
         console.log('   [1순위 이미지]:', items[0].link);
     }
  } catch (e: any) {
     console.log('-> 검색 실패:', e.response?.data?.error?.message || e.message);
  }
}

testGoogleCustomSearch();
