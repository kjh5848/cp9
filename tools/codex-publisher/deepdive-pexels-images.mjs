function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function imageQueries({ title = '', keyword = '', html = '' }) {
  const text = `${title} ${keyword} ${stripHtml(html)}`.slice(0, 5000)
  if (/식기세척|설거지|주방|밀레|LG|삼성|SK매직/.test(text)) {
    return [
      { query: 'modern kitchen dishwasher', caption: '설치형 식기세척기는 제품보다 주방 동선과 더 강하게 연결됩니다.' },
      { query: 'modern kitchen sink interior', caption: '급수와 배수, 싱크대 주변 공간은 구매 만족도를 좌우하는 현실 조건입니다.' },
      { query: 'minimal modern kitchen cabinets', caption: '프리미엄 식기세척기는 주방 분위기와 수납 흐름까지 함께 바꿉니다.' },
      { query: 'dining dishes kitchen', caption: '가족 식기 패턴과 조리 습관을 알아야 용량 선택의 실패를 줄일 수 있습니다.' },
    ]
  }
  if (/커피|에스프레소|캡슐|원두|브레빌|드롱기|네스프레소/.test(text)) {
    return [
      { query: 'espresso machine kitchen', caption: '커피머신은 추출 방식보다 먼저 매일 반복할 수 있는 루틴을 결정합니다.' },
      { query: 'coffee beans espresso', caption: '캡슐, 원두, 분쇄 방식은 맛보다 관리 난이도와 유지비를 바꿉니다.' },
      { query: 'home coffee bar', caption: '홈카페 장비는 주방의 분위기와 사용자의 취향 이미지를 함께 만듭니다.' },
      { query: 'latte art machine', caption: '우유 음료를 자주 만든다면 스팀, 세척, 부품 관리까지 같이 봐야 합니다.' },
    ]
  }
  if (/청소|오염|먼지|물걸레|흡입|바닥/.test(text)) {
    return [
      { query: 'clean modern living room', caption: '청소 가전은 흡입력보다 오염이 생기는 생활 장면과 맞아야 합니다.' },
      { query: 'cleaning floor home', caption: '물청소 제품은 바닥재, 물통, 건조 루틴이 실제 만족도를 좌우합니다.' },
      { query: 'minimal laundry room storage', caption: '충전, 세척, 건조, 보관 위치가 정해져야 매일 쓰는 도구가 됩니다.' },
      { query: 'pet friendly home floor', caption: '반려동물이나 아이가 있는 집은 오염 패턴이 제품 선택 기준이 됩니다.' },
    ]
  }
  return [
    { query: 'modern home interior appliance', caption: '생활가전은 스펙보다 공간과 루틴에 맞을 때 만족도가 높습니다.' },
    { query: 'minimal kitchen interior', caption: '매일 보이는 제품일수록 디자인과 배치의 영향이 커집니다.' },
    { query: 'organized home storage', caption: '구매 전에는 사용할 자리와 보관 방식을 먼저 정해야 합니다.' },
  ]
}

export function getDeepdiveImageQueries(context = {}) {
  return imageQueries(context)
}

async function fetchPexelsPhoto(apiKey, query) {
  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', query)
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('per_page', '6')
  url.searchParams.set('locale', 'en-US')

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Pexels image search failed: ${response.status}`)
  }

  const data = await response.json()
  const photos = Array.isArray(data.photos) ? data.photos : []
  const photo = photos.find((item) => item?.src?.large || item?.src?.large2x || item?.src?.original)
  if (!photo) return null

  return {
    id: photo.id,
    query,
    source: 'Pexels',
    sourceUrl: photo.url,
    imageUrl: photo.src.large2x || photo.src.large || photo.src.original,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    alt: photo.alt || query,
    license: 'Pexels License',
  }
}

export async function fetchDeepdivePexelsImages(options = {}) {
  const apiKey = options.apiKey || ''
  if (!apiKey) return { images: [], reason: 'missing_pexels_api_key' }

  const queries = imageQueries({ title: options.title, keyword: options.keyword, html: options.html }).slice(0, options.limit || 4)
  const images = []
  const seen = new Set()

  for (const item of queries) {
    try {
      const image = await fetchPexelsPhoto(apiKey, item.query)
      if (!image || seen.has(image.id)) continue
      seen.add(image.id)
      images.push({ ...image, caption: item.caption })
    } catch {
      continue
    }
  }

  return {
    images,
    reason: images.length < 3 ? `not_enough_pexels_images:${images.length}` : '',
  }
}

function renderPexelsFigure(image, index, caption) {
  return `<figure class="cp9-deepdive-visual" data-cp9-visual="${index + 1}" style="margin:26px 0 30px;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;background:#111827;box-shadow:0 18px 42px rgba(15,23,42,.14);">
<img src="${escapeHtml(image.imageUrl)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" width="960" height="560" style="display:block;width:100%;height:auto;aspect-ratio:12/7;max-height:420px;object-fit:cover;" />
<figcaption style="margin:0;padding:16px 18px;background:#111827;color:#f9fafb;font-size:14px;line-height:1.65;">
<strong style="display:block;margin:0 0 4px;font-size:15px;color:#fff;">${escapeHtml(caption)}</strong>
</figcaption>
</figure>`
}

export function renderDeepdiveLayeredFigure(image, index) {
  const visibleCaption = image.caption || image.layerSubtitle || ''
  return `<figure class="cp9-deepdive-visual" data-cp9-visual="${index + 1}" style="margin:26px 0 30px;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;background:#111827;box-shadow:0 18px 42px rgba(15,23,42,.14);">
<img src="${escapeHtml(image.renderedUrl || image.imageUrl)}" alt="${escapeHtml(image.layerTitle || image.alt)}" loading="lazy" decoding="async" width="960" height="560" style="display:block;width:100%;height:auto;aspect-ratio:12/7;object-fit:cover;" />
<figcaption style="margin:0;padding:14px 18px;background:#111827;color:#f9fafb;font-size:14px;line-height:1.65;">
<strong style="display:block;margin:0 0 4px;font-size:15px;color:#fff;">${escapeHtml(visibleCaption)}</strong>
</figcaption>
</figure>`
}

function removePreviousVisuals(html) {
  return String(html || '')
    .replace(/\n?<aside class="cp9-deepdive-explainer"[\s\S]*?<\/aside>\n?/g, '\n')
    .replace(/\n?<figure class="cp9-deepdive-visual"[\s\S]*?<\/figure>\n?/g, '\n')
}

function insertFiguresAfterHeadings(html, figures) {
  let index = 0
  return html.replace(/(<h2\b[^>]*>[\s\S]*?<\/h2>)/gi, (match) => {
    if (index >= figures.length) return match
    const figure = figures[index]
    index += 1
    return `${match}\n${figure}`
  })
}

export async function enhanceDeepdivePexelsImages(html, options = {}) {
  const apiKey = options.apiKey || ''
  if (!apiKey) {
    return { html: removePreviousVisuals(html), changed: false, images: [], reason: 'missing_pexels_api_key' }
  }

  const cleaned = options.force ? removePreviousVisuals(html) : String(html || '')
  if (!options.force && cleaned.includes('cp9-deepdive-visual')) {
    return { html: cleaned, changed: false, images: [], reason: 'already_present' }
  }

  const queries = imageQueries({ title: options.title, keyword: options.keyword, html: cleaned }).slice(0, options.limit || 4)
  const images = []
  const figures = []
  const seen = new Set()

  for (const [index, item] of queries.entries()) {
    try {
      const image = await fetchPexelsPhoto(apiKey, item.query)
      if (!image || seen.has(image.id)) continue
      seen.add(image.id)
      images.push({ ...image, caption: item.caption })
      figures.push(renderPexelsFigure(image, index, item.caption))
    } catch {
      continue
    }
  }

  if (figures.length < 3) {
    return { html: cleaned, changed: cleaned !== html, images, reason: `not_enough_pexels_images:${figures.length}` }
  }

  return {
    html: insertFiguresAfterHeadings(cleaned, figures),
    changed: true,
    images,
  }
}

export function enhanceDeepdiveWithLayeredImages(html, images, options = {}) {
  const cleaned = options.force ? removePreviousVisuals(html) : String(html || '')
  if (!images?.length) return { html: cleaned, changed: cleaned !== html, images: [] }
  const figures = images.map((image, index) => renderDeepdiveLayeredFigure(image, index))
  return {
    html: insertFiguresAfterHeadings(cleaned, figures),
    changed: true,
    images,
  }
}
