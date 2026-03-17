import { search, searchImages, SafeSearchType } from 'duck-duck-scrape';

async function run() {
  for (let i = 0; i < 3; i++) {
    try {
      console.log(`Request ${i+1}`);
      const res = await searchImages('로봇청소기 추천 이미지 2024년', { safeSearch: SafeSearchType.STRICT });
      if (res.results && res.results.length > 0) {
        console.log(`Success ${i+1}:`, res.results[0].image);
      } else {
        console.log(`No results ${i+1}`);
      }
    } catch(e) {
      console.error(`Error ${i+1}:`, e);
    }
    // Sleep to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
}
run();
