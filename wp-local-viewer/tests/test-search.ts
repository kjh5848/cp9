import { search, SafeSearchType } from "duck-duck-scrape";

async function main() {
  const query = "로보락 S8 Pro Ultra 측면";
  console.log(`Searching images for: ${query}`);
  const sr = await search(query, { safeSearch: SafeSearchType.STRICT });
  console.log("Found images:");
  console.log(sr.images?.slice(0, 3).map(img => img.url));
}

main().catch(console.error);
