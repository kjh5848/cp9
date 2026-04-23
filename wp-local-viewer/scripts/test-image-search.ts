import { searchImages, SafeSearchType } from 'duck-duck-scrape';

async function testDuckDuckGoImageSearch() {
  console.log('🔍 DuckDuckGo 이미지 검색 테스트 시작...');
  const testQueries = [
    '고급스러운 포장 상자에 담긴 선물용 목걸이',
    '마이디어 전기건조기 8kg 방문설치',
    '탐사 물만 부어쓰는 가정용 시멘트 몰탈 25kg'
  ];

  for (const query of testQueries) {
    console.log(`\n▶ 검색어: "${query}"`);
    try {
      const sr = await searchImages(query, { safeSearch: SafeSearchType.STRICT });
      if (sr.results && sr.results.length > 0) {
        console.log(`✅ 검색 성공! (${sr.results.length}개의 결과)`);
        console.log(`   [1순위 이미지 URL]: ${sr.results[0].image}`);
        console.log(`   [1순위 이미지 제목]: ${sr.results[0].title}`);
      } else {
        console.log(`⚠️ 검색 결과가 없습니다.`);
      }
    } catch (err) {
      console.error(`❌ 검색 실패:`, err);
    }
  }
}

testDuckDuckGoImageSearch();
