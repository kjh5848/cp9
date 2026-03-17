const rawText1 = `Here are your keywords:\n\n\`\`\`json
[
  {"keyword": "TV 추천", "articleType": "single"}
]
\`\`\``;

const rawText2 = `[{"keyword": "세탁기 비교", "articleType": "compare"}]`;

const rawText3 = `
Some intro text
[
  {"keyword": "노트북 가이드", "articleType": "curation"},
  {"keyword": "invalid", "articleType": "unknown"}
]
And some outro text
`;

function parseKeywords(rawText) {
  try {
    const text = rawText.trim();
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonStr = text.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);
      return parsed.filter((i) => i && typeof i.keyword === 'string')
        .map((i) => ({
          keyword: i.keyword,
          articleType: ['single', 'compare', 'curation'].includes(i.articleType) ? i.articleType : 'single'
        }));
    }
  } catch (e) {
    console.warn('[cron/campaigns] JSON 파싱 실패', e);
  }
  return [];
}

console.log("Test 1:", parseKeywords(rawText1));
console.log("Test 2:", parseKeywords(rawText2));
console.log("Test 3:", parseKeywords(rawText3));
