import { search, searchImages, SafeSearchType } from 'duck-duck-scrape';

async function run() {
  try {
    const res = await search('로보락 S8 Pro Ultra', { safeSearch: SafeSearchType.STRICT });
    console.log("Web Search Images Array length:", res.images?.length || 0);
    if (res.images && res.images.length > 0) {
      console.log('First URL from Web Search images:', res.images[0].url);
    }
  } catch(e) {
    console.error("Web Search Error:", e);
  }
}
run();
