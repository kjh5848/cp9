import fs from 'node:fs'

const MARKER_START = '<!-- cp9-mobile-compare:start -->'
const MARKER_END = '<!-- cp9-mobile-compare:end -->'

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function extractAttribute(html, name) {
  const match = html.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))
  return match ? match[1] : ''
}

function extractRows(tableHtml) {
  const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
  const source = tbodyMatch ? tbodyMatch[1] : tableHtml
  const rows = [...source.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((match) => match[0])

  return rows
    .map((row) => {
      const cells = [...row.matchAll(/<(td|th)\b[\s\S]*?<\/\1>/gi)].map((match) => match[0])
      if (cells.length < 4) return null

      const imageHtml = cells[0]
      const nameHtml = cells[1]
      const priceHtml = cells[2]
      const linkHtml = cells[3]
      const imgMatch = imageHtml.match(/<img\b[^>]*>/i)
      const linkMatches = [...row.matchAll(/<a\b[^>]*href=["']([^"']+)["'][\s\S]*?<\/a>/gi)]
      const href = linkMatches.length ? linkMatches[linkMatches.length - 1][1] : ''

      return {
        href,
        image: imgMatch ? extractAttribute(imgMatch[0], 'src') : '',
        alt: imgMatch ? extractAttribute(imgMatch[0], 'alt') : '',
        name: stripTags(nameHtml),
        price: stripTags(priceHtml),
      }
    })
    .filter((row) => row && row.href && row.name && row.price)
}

function buildMobileCards(rows, caption) {
  const cards = rows
    .map((row) => {
      const safeName = escapeHtml(row.name)
      const safePrice = escapeHtml(row.price)
      const safeImage = escapeHtml(row.image)
      const safeAlt = escapeHtml(row.alt || row.name)
      const safeHref = escapeHtml(row.href)

      return `<div class="cp9-compare-card"><div class="cp9-compare-image"><a class="cp9-compare-image-link" href="${safeHref}" target="_blank" rel="noopener sponsored"><img src="${safeImage}" alt="${safeAlt}" loading="lazy" decoding="async" /></a></div><div class="cp9-compare-body"><div class="cp9-compare-name">${safeName}</div><div class="cp9-compare-price">${safePrice}</div><a class="cp9-compare-button" href="${safeHref}" target="_blank" rel="noopener sponsored">바로가기</a></div></div>`
    })
    .join('\n')

  return `<style>
  .cp9-compare-wrap{margin:0 0 30px}
  .cp9-compare-mobile{display:none}
  @media (max-width:900px){
    .cp9-compare-desktop{display:none!important}
    .cp9-compare-mobile{display:grid!important;gap:12px;margin:0 0 28px}
    .cp9-compare-caption{margin:0 0 10px;color:#6b7280;font-size:12px;line-height:1.55}
    .cp9-compare-card{display:grid;grid-template-columns:86px 1fr;gap:12px;align-items:center;padding:14px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;box-shadow:0 8px 22px rgba(15,23,42,.06)}
    .cp9-compare-image{display:block}
    .cp9-compare-image p{margin:0!important}
    .cp9-compare-image-link{display:block}
    .cp9-compare-card img{display:block;box-sizing:border-box;width:86px!important;height:86px!important;max-width:86px!important;object-fit:contain;background:#fff;border:1px solid #edf0f5;border-radius:14px;padding:6px}
    .cp9-compare-name{margin:0 0 7px!important;color:#111;font-size:15px!important;line-height:1.35!important;font-weight:850!important;letter-spacing:-.02em}
    .cp9-compare-price{margin:0 0 10px!important;color:#ff5a00!important;font-size:14px!important;line-height:1.2!important;font-weight:900!important}
    .cp9-compare-button{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 15px;border-radius:999px;background:#ff5a00;color:#fff!important;text-decoration:none!important;font-size:14px!important;font-weight:900!important;box-shadow:0 6px 16px rgba(255,90,0,.22)}
  }
</style>
<div class="cp9-compare-mobile" aria-label="모바일 상품 비교">
  <p class="cp9-compare-caption">${escapeHtml(caption)}</p>
${cards}
</div>`
}

export function enhanceFirstComparisonTable(html, options = {}) {
  if (!options.force && html.includes(MARKER_START) && html.includes(MARKER_END)) {
    return { html, changed: false, reason: 'already_enhanced' }
  }

  let source = html
  if (options.force) {
    source = source.replace(new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`, 'g'), (block) => {
      return block.match(/<table\b[\s\S]*?<\/table>/i)?.[0] || ''
    })
  }
  const tableMatch = source.match(/<table\b[\s\S]*?<\/table>/i)
  if (!tableMatch) {
    return { html: source, changed: false, reason: 'table_not_found' }
  }

  const tableHtml = tableMatch[0]
  const rows = extractRows(tableHtml)
  if (!rows.length) {
    return { html: source, changed: false, reason: 'rows_not_found' }
  }

  const caption = stripTags(tableHtml.match(/<caption\b[\s\S]*?<\/caption>/i)?.[0] || '가격은 작성 시점 기준이며, 구매 전 최신 가격과 배송 조건을 확인하세요.')
  const replacement = `${MARKER_START}
<div class="cp9-compare-wrap">
  <div class="cp9-compare-desktop">
${tableHtml}
  </div>
${buildMobileCards(rows, caption)}
</div>
${MARKER_END}`

  source = source.slice(0, tableMatch.index) + replacement + source.slice(tableMatch.index + tableHtml.length)

  return { html: source, changed: true, rowCount: rows.length }
}

if ((process.argv[1] || '').endsWith('mobile-compare-table.mjs')) {
  const input = process.argv[2]
  const output = process.argv[3]
  if (!input || !output) {
    console.error('Usage: node tools/codex-publisher/mobile-compare-table.mjs <input.html> <output.html>')
    process.exit(1)
  }
  const result = enhanceFirstComparisonTable(fs.readFileSync(input, 'utf8'))
  fs.writeFileSync(output, result.html)
  console.log(JSON.stringify({ changed: result.changed, rowCount: result.rowCount || 0, reason: result.reason || null }))
}
