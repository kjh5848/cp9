import { searchImages, SafeSearchType } from 'duck-duck-scrape';

async function test() {
  try {
    const sr = await searchImages('레노버 노트북', { safeSearch: SafeSearchType.STRICT });
    console.log(sr.results[0].image);
  } catch (e) {
    console.error(e);
  }
}

test();
