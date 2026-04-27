function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function matchMeta(html, selector) {
  const patterns = selector === 'title'
    ? [/<title[^>]*>([\s\S]*?)<\/title>/i]
    : [
      new RegExp(`<meta[^>]+(?:name|property)=["']${selector}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${selector}["'][^>]*>`, 'i'),
    ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtmlEntities(stripHtml(match[1]))
  }
  return ''
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
}

function detectBrand(text) {
  const brandPatterns = [
    ['LG', /LG|엘지|디오스|오브제/i],
    ['삼성', /삼성|비스포크|BESPOKE/i],
    ['밀레', /밀레|Miele/i],
    ['SK매직', /SK\s?매직|SKMagic|매직/i],
    ['위닉스', /위닉스|Winix/i],
    ['쿠쿠', /쿠쿠|CUCKOO/i],
    ['필립스', /필립스|Philips/i],
    ['드롱기', /드롱기|DeLonghi/i],
    ['네스프레소', /네스프레소|Nespresso/i],
    ['브레빌', /브레빌|Breville/i],
    ['카처', /카처|Karcher|Kärcher/i],
    ['샤오미', /샤오미|Xiaomi/i],
  ]
  return brandPatterns.find(([, pattern]) => pattern.test(text))?.[0] || ''
}

function extractSpecTokens(text) {
  const tokens = []
  const patterns = [
    /\d+(?:\.\d+)?\s?(?:L|리터|인용|kg|W|Pa|mAh|분|단계|단|평|㎡|cm|mm)/gi,
    /(?:빌트인|프리스탠딩|무설치|자동문\s?열림|열풍\s?건조|응축\s?건조|살균|스팀|자동세척|셀프클리닝|저소음|대용량|미니|무선|유선)/g,
    /[A-Z]{1,5}[-\s]?\d{2,}[A-Z0-9-]*/g,
  ]
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) tokens.push(match[0].replace(/\s+/g, ' ').trim())
  }
  return unique(tokens).slice(0, 8)
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function buildResearchSummary(product) {
  const text = `${product.research?.title || ''} ${product.research?.description || ''} ${product.name || ''}`
  const brand = detectBrand(text)
  const specs = extractSpecTokens(text)
  const facts = []

  if (brand) facts.push({ label: '브랜드', value: brand, source: '상품명·상세 정보' })
  if (product.categoryName) facts.push({ label: '카테고리', value: product.categoryName, source: '상품 정보' })
  if (specs.length) facts.push({ label: '확인 스펙', value: specs.slice(0, 4).join(', '), source: '상품명·상세 정보' })
  if (product.price) facts.push({ label: '작성 시점 가격', value: formatPrice(product.price), source: '가격 정보' })
  facts.push({ label: '구매 확인', value: '옵션, 구성품, 도착 예정일 확인', source: '상품 정보' })

  const questions = [
    specs.some((item) => /인용|L|리터|kg|평|㎡/.test(item)) ? '내 공간과 사용량에 용량이 맞는가' : '내 사용 공간과 크기가 맞는가',
    specs.some((item) => /빌트인|프리스탠딩|무설치/.test(item)) ? '설치 방식과 배치 조건이 맞는가' : '보관 위치와 전원 동선이 자연스러운가',
    '소모품, 세척, AS 조건을 상세 페이지에서 확인했는가',
  ]

  return {
    facts: facts.slice(0, 5),
    questions,
    interpretation: buildInterpretation({ product, brand, specs }),
    sourceCount: product.research?.source === 'product_page' ? 2 : 1,
  }
}

function buildInterpretation({ product, brand, specs }) {
  const priceLabel = product.price ? formatPrice(product.price) : '가격 확인 필요'
  const purchaseLabel = '결제 전에는 옵션, 구성품, 도착 예정일을 함께 확인하는 편이 안전합니다'
  const brandLabel = brand ? `${brand} 계열이라` : '브랜드보다 실제 스펙 확인이 더 중요한 상품이라'
  const specLabel = specs.length
    ? `${specs.slice(0, 3).join(', ')} 같은 조건을 중심으로 비교하면 좋습니다`
    : '상세 페이지에서 용량, 크기, 구성품을 한 번 더 확인하는 편이 안전합니다'

  return `${brandLabel} 오늘 확인한 가격은 ${priceLabel}입니다. ${specLabel}. ${purchaseLabel}.`
}

export async function enrichProductsWithResearch(products, options = {}) {
  const timeoutMs = options.timeoutMs || 2500
  const enriched = []

  for (const product of products) {
    let research = { source: 'product_name', title: product.name, description: '' }
    if (product.url) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      try {
        const response = await fetch(product.url, {
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 CP9-Publisher/1.0',
            Accept: 'text/html,application/xhtml+xml',
          },
        })
        const html = await response.text()
        const title = matchMeta(html, 'og:title') || matchMeta(html, 'title')
        const description = matchMeta(html, 'og:description') || matchMeta(html, 'description')
        if (title || description) {
          research = {
            source: 'product_page',
            title: title || product.name,
            description,
            sourceUrl: response.url,
          }
        }
      } catch {
        research = { source: 'product_name', title: product.name, description: '' }
      } finally {
        clearTimeout(timeout)
      }
    }

    const nextProduct = { ...product, research }
    nextProduct.researchFacts = buildResearchSummary(nextProduct)
    enriched.push(nextProduct)
  }

  return enriched
}

export function renderProductFactPanel(product, options = {}) {
  const compact = Boolean(options.compact)
  const summary = product.researchFacts || buildResearchSummary(product)
  const facts = summary.facts
  const questions = summary.questions
  const factItems = facts.map((fact) => `<li><strong>${escapeHtml(fact.label)}:</strong> ${escapeHtml(fact.value)}</li>`).join('')
  const questionItems = questions.slice(0, compact ? 2 : 3).map((question) => `<li>${escapeHtml(question)}</li>`).join('')

  return `<div class="cp9-product-facts" style="border:1px solid #dbe3ef;border-radius:16px;background:#f8fafc;padding:${compact ? '12px' : '14px'};margin:${compact ? '10px 0' : '14px 0'};">
<strong style="display:block;margin:0 0 8px;color:#111;font-size:${compact ? '14px' : '15px'};">우리 집 조건으로 보는 확인 포인트</strong>
<p style="margin:0 0 10px;color:#374151;font-size:${compact ? '13px' : '14px'};line-height:1.65;">${escapeHtml(summary.interpretation)}</p>
<ul style="margin:0 0 10px;padding-left:20px;color:#374151;font-size:${compact ? '13px' : '14px'};line-height:1.65;">${factItems}</ul>
<strong style="display:block;margin:0 0 6px;color:#111;font-size:${compact ? '13px' : '14px'};">결제 전 가족 기준 질문</strong>
<ul style="margin:0;padding-left:20px;color:#475467;font-size:${compact ? '13px' : '14px'};line-height:1.65;">${questionItems}</ul>
</div>`
}

export function renderItemListJsonLd(products, title) {
  const itemListElement = products.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: product.name,
      image: product.image ? [product.image] : undefined,
      description: product.researchFacts?.interpretation || product.name,
      brand: detectBrand(`${product.research?.title || ''} ${product.name || ''}`) ? {
        '@type': 'Brand',
        name: detectBrand(`${product.research?.title || ''} ${product.name || ''}`),
      } : undefined,
      category: product.categoryName || undefined,
      offers: product.price ? {
        '@type': 'Offer',
        url: product.url,
        priceCurrency: 'KRW',
        price: Number(product.price),
      } : undefined,
    },
  }))
  const json = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement,
  }).replace(/</g, '\\u003c')

  return `<script type="application/ld+json">${json}</script>`
}
