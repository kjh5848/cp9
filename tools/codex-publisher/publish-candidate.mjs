#!/usr/bin/env node
import { createHmac } from 'node:crypto'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { enhanceFirstComparisonTable } from './mobile-compare-table.mjs'
import { renderThumbnailHtml } from './thumbnail-title.mjs'
import { enrichProductsWithResearch, renderItemListJsonLd, renderProductFactPanel } from './product-facts.mjs'
import { enhanceDeepdiveWithLayeredImages, fetchDeepdivePexelsImages } from './deepdive-pexels-images.mjs'
import { enhanceDeepdiveReportFormat } from './deepdive-report-format.mjs'
import { renderLayeredPexelsImage } from './deepdive-layered-image-renderer.mjs'

const COUPANG_HOST = 'https://api-gateway.coupang.com'
const DISCLOSURE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.'
const DEFAULT_CP_CATEGORY_ID = 85

const SUMMER_CURATION_QUERIES = [
  '휴대용 선풍기',
  '제습제',
  '쿨매트',
  '모기퇴치기',
  '냉감 이불',
  '아이스 텀블러',
  '에어컨 청소',
  '여름 슬리퍼',
  '샤워기 필터',
  '수납 정리함',
]

const COFFEE_DEEPDIVE_QUERIES = [
  '일리 커피머신',
  '일리 캡슐 커피머신',
  '네스프레소 커피머신',
  '드롱기 커피머신',
  '브레빌 커피머신',
  '필립스 전자동 커피머신',
  '전자동 커피머신',
]

const COFFEE_BRAND_SOURCES = [
  { label: 'illy 공식 커피머신 자료', url: 'https://www.illy.com/en-ww/coffee-machines' },
  { label: 'Nespresso 공식 지속가능성 자료', url: 'https://www.nespresso.com/kr/ko/sustainability' },
  { label: 'DeLonghi 공식 커피머신 자료', url: 'https://www.delonghi.com/ko-kr/products/coffee' },
  { label: 'Breville Barista Touch Impress 공식 자료', url: 'https://www.breville.com/us/en/products/espresso/bes881.html' },
  { label: 'Philips LatteGo 공식 자료', url: 'https://www.usa.philips.com/c-m-ho/coffee/lattego' },
]

const DISHWASHER_DEEPDIVE_QUERIES = [
  '밀레 식기세척기',
  'LG 식기세척기',
  '삼성 식기세척기',
  'SK매직 식기세척기',
  '12인용 식기세척기',
]

const DISHWASHER_BRAND_SOURCES = [
  { label: 'Miele 공식 식기세척기 자료', url: 'https://www.miele.com/en/com/dishwashers-1000019.htm' },
  { label: 'LG전자 공식 식기세척기 자료', url: 'https://www.lge.co.kr/dishwashers' },
  { label: '삼성전자 공식 식기세척기 자료', url: 'https://www.samsung.com/sec/dishwashers/' },
  { label: 'SK매직 공식 식기세척기 자료', url: 'https://www.skmagic.com/product/dishwasher' },
]

const CLEANER_DEEPDIVE_QUERIES = [
  '건습식 청소기',
  '습식 청소기',
  '무선 건습식 청소기',
  '카처 건습식 청소기',
  '업소용 건습식 청소기',
]

const ROBOT_VACUUM_QUERIES = [
  '로보락 Qrevo 로봇청소기',
  '로보락 Saros 로봇청소기',
  '로보락 S8 MaxV Ultra 로봇청소기',
  '드리미 X50 Ultra 로봇청소기',
  '드리미 L40 로봇청소기',
  '에코백스 X8 Pro Omni 로봇청소기',
  '에코백스 T50 로봇청소기',
  '삼성 비스포크 제트봇 AI 로봇청소기',
  'LG 로보킹 AI 올인원 로봇청소기',
  '샤오미 X20 로봇청소기',
  '로봇청소기 스테이션 물걸레',
]

function buildCurationQueries(candidate) {
  const baseQuery = candidate.coupangSearchTerm || candidate.keyword
  if (/로보락|로봇\s*청소기|로봇청소기|물걸레/.test(baseQuery)) {
    return [
      baseQuery,
      '로보락 로봇청소기',
      '로보락 물걸레 로봇청소기',
      '로보락 청소기',
      'Roborock 로봇청소기',
      '로보락 Qrevo',
      '로보락 S8',
      '로보락 S9',
      '로보락 Q10',
      '로봇청소기',
      '물걸레 로봇청소기',
      '자동 먼지비움 로봇청소기',
      '로봇청소기 스테이션',
    ]
  }
  if (/선풍기|서큘레이터|손선풍기|휴대용선풍기|탁상용선풍기/.test(baseQuery)) {
    return [baseQuery, ...SUMMER_CURATION_QUERIES]
  }
  if (/믹서기|블렌더/.test(baseQuery)) {
    return [
      baseQuery,
      '초고속 블렌더',
      '진공 블렌더',
      '핸드 블렌더',
      '미니 믹서기',
      '대용량 믹서기',
      '스무디 믹서기',
      '텀블러 믹서기',
    ]
  }
  if (/공기청정기/.test(baseQuery)) return [baseQuery, '원룸 공기청정기', '거실 공기청정기', '펫 공기청정기', '헤파 공기청정기']
  if (/가습기/.test(baseQuery)) return [baseQuery, '초음파 가습기', '가열식 가습기', '자연기화식 가습기', '대용량 가습기']
  if (/커피머신/.test(baseQuery)) return [baseQuery, ...COFFEE_DEEPDIVE_QUERIES]
  return [baseQuery, `${baseQuery} 추천`, `${baseQuery} 가정용`, `${baseQuery} 소형`, `${baseQuery} 대용량`]
}

function usage() {
  console.log(`Usage:
  node tools/codex-publisher/publish-candidate.mjs --type deepdive
  node tools/codex-publisher/publish-candidate.mjs --type curation_20
  node tools/codex-publisher/publish-candidate.mjs --candidate 2026-04-25-coffee-machine-deepdive
  node tools/codex-publisher/publish-candidate.mjs --post-id 522 --type deepdive
`)
}

function parseArgs(argv) {
  const options = { type: '', candidateId: '', postId: 0 }
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--type') {
      options.type = argv[index + 1] || ''
      index += 1
    } else if (arg === '--candidate') {
      options.candidateId = argv[index + 1] || ''
      index += 1
    } else if (arg === '--post-id') {
      options.postId = Number(argv[index + 1] || 0)
      index += 1
    } else if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    }
  }
  return options
}

function loadEnv(filePath) {
  const env = {}
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    env[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
  }
  return env
}

function requireEnv(env, keys) {
  const missing = keys.filter((key) => !env[key])
  if (missing.length) {
    throw new Error(`missing env: ${missing.join(', ')}`)
  }
}

function formatCoupangDate(date = new Date()) {
  const year = String(date.getUTCFullYear()).slice(2)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  const minute = String(date.getUTCMinutes()).padStart(2, '0')
  const second = String(date.getUTCSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hour}${minute}${second}Z`
}

function signCoupang(method, requestPath, secretKey, accessKey) {
  const [pathOnly, query = ''] = requestPath.split('?')
  const datetime = formatCoupangDate()
  const message = `${datetime}${method}${pathOnly}${query}`
  const signature = createHmac('sha256', secretKey).update(message).digest('hex')
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`
}

async function searchCoupangProducts(env, keyword, limit) {
  const method = 'GET'
  const requestPath = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`
  const response = await fetch(`${COUPANG_HOST}${requestPath}`, {
    method,
    headers: {
      Authorization: signCoupang(method, requestPath, env.COUPANG_SECRET_KEY, env.COUPANG_ACCESS_KEY),
      'X-EXTENDED-TIMEOUT': '60000',
    },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`coupang search failed for "${keyword}": ${response.status} ${text.slice(0, 300)}`)
  const data = JSON.parse(text)
  return data.data?.productData || []
}

function normalizeProduct(product, sourceKeyword = '') {
  return {
    id: String(product.productId || product.itemId || product.vendorItemId || product.productName),
    name: String(product.productName || '').trim(),
    price: Number(product.productPrice || 0),
    image: String(product.productImage || '').trim(),
    url: String(product.productUrl || '').trim(),
    categoryName: String(product.categoryName || '').trim(),
    isRocket: Boolean(product.isRocket),
    isFreeShipping: Boolean(product.isFreeShipping),
    sourceKeyword,
  }
}

function selectUniqueProducts(products, limit) {
  const seen = new Set()
  const selected = []
  for (const product of products) {
    if (!product.name || !product.url || !product.image || !product.price) continue
    const key = product.id || product.url
    if (seen.has(key)) continue
    seen.add(key)
    selected.push(product)
    if (selected.length >= limit) break
  }
  return selected
}

function isRobotVacuumKeyword(value) {
  return /로봇\s*청소기|로봇청소기|물걸레\s*로봇|로보락|Roborock|드리미|Dreame|에코백스|ECOVACS|DEEBOT|디봇|제트봇|Jet\s*Bot|로보킹|Roboking|샤오미\s*X20/i.test(String(value || ''))
}

function isRobotVacuumProduct(product) {
  const text = `${product.sourceKeyword || ''} ${product.name || ''} ${product.categoryName || ''}`
  const hasRobotSignal = isRobotVacuumKeyword(text) || /Qrevo|Saros|S8\s*MaxV|X50|X40|L40|X8\s*Pro|T50|X20\+?/i.test(text)
  if (!hasRobotSignal) return false
  const isExplicitRobot = /로봇\s*청소기|로봇청소기|Robot\s*Vacuum|Qrevo|Saros|제트봇|Jet\s*Bot|로보킹|Roboking|DEEBOT|디봇/i.test(text)
  const nonRobotCleaner = /업소용|건습식|습식청소기|무선청소기|스틱|핸디|침구|차량용|창문|공업용|유선청소기|진공청소기|물걸레청소기|F25|H12|H14/i.test(text)
  const accessoryOnly = /호환|소모품|브러쉬|브러시|더스트백|필터|액세서리|악세사리|교체용|먼지봉투/i.test(text)
    || (/물걸레|걸레|세제|클리너/i.test(text) && /\d+\s*개|단일상품|세트|호환/i.test(text))
  if (nonRobotCleaner || accessoryOnly) return false
  return isExplicitRobot || !nonRobotCleaner
}

function robotVacuumBrand(product) {
  const text = `${product.name || ''}`
  if (/로보락|Roborock|Qrevo|Saros|S8/i.test(text)) return '로보락'
  if (/드리미|Dreame|X50|X40|L40/i.test(text)) return '드리미'
  if (/에코백스|ECOVACS|DEEBOT|디봇|X8|T50/i.test(text)) return '에코백스'
  if (/삼성|비스포크|BESPOKE|제트봇|Jet\s*Bot/i.test(text)) return '삼성'
  if (/LG|엘지|로보킹|Roboking|코드제로/i.test(text)) return 'LG'
  if (/샤오미|Xiaomi|X20/i.test(text)) return '샤오미'
  return '기타'
}

function selectRobotVacuumProducts(products, limit) {
  const candidates = selectUniqueProducts(products.filter(isRobotVacuumProduct), Math.max(120, limit * 12))
    .sort((left, right) => robotVacuumScore(right) - robotVacuumScore(left))
  const selected = []
  const brandCount = new Map()
  for (const product of candidates) {
    const brand = robotVacuumBrand(product)
    if ((brandCount.get(brand) || 0) >= 2) continue
    selected.push(product)
    brandCount.set(brand, (brandCount.get(brand) || 0) + 1)
    if (selected.length >= limit) break
  }
  if (selected.length < limit) {
    const remaining = candidates
      .filter((product) => !selected.some((item) => item.id === product.id))
      .sort((left, right) => {
        const leftCount = brandCount.get(robotVacuumBrand(left)) || 0
        const rightCount = brandCount.get(robotVacuumBrand(right)) || 0
        if (leftCount !== rightCount) return leftCount - rightCount
        return robotVacuumScore(right) - robotVacuumScore(left)
      })
    for (const product of remaining) {
      if (selected.some((item) => item.id === product.id)) continue
      selected.push(product)
      const brand = robotVacuumBrand(product)
      brandCount.set(brand, (brandCount.get(brand) || 0) + 1)
      if (selected.length >= limit) break
    }
  }
  return selected
}

function robotVacuumScore(product) {
  const text = `${product.name || ''}`
  let score = 0
  if (robotVacuumBrand(product) !== '기타') score += 30
  if (/로보락|Roborock|드리미|Dreame|에코백스|ECOVACS|DEEBOT|디봇|삼성|비스포크|BESPOKE|제트봇|LG|로보킹|샤오미|Xiaomi/i.test(text)) score += 20
  if (/Qrevo|Saros|S8\s*MaxV|X50|X40|L40|X8\s*Pro|T50|X20/i.test(text)) score += 18
  if (/스테이션|올인원|자동\s*먼지|먼지비움|물걸레|온수|세척|건조/i.test(text)) score += 12
  if (product.isRocket) score += 6
  if (product.price >= 250000) score += 4
  if (robotVacuumBrand(product) === '기타') score -= 12
  return score
}

async function collectProducts(env, candidate) {
  if (candidate.articleType === 'top_3_5_compare' && isRobotVacuumKeyword(`${candidate.keyword || ''} ${candidate.coupangSearchTerm || ''}`)) {
    const batches = []
    for (const query of [...new Set([...ROBOT_VACUUM_QUERIES, candidate.coupangSearchTerm, candidate.keyword].filter(Boolean))]) {
      const products = await searchCoupangProducts(env, query, 10)
      batches.push(...products.map((product) => normalizeProduct(product, query)))
    }
    const selected = selectRobotVacuumProducts(batches, 5)
    if (selected.length < 3) throw new Error(`robot vacuum top compare requires at least 3 matched products, got ${selected.length}`)
    return selected
  }

  if (candidate.articleType === 'curation_20') {
    const batches = []
    for (const query of [...new Set(buildCurationQueries(candidate).filter(Boolean))]) {
      const products = await searchCoupangProducts(env, query, 10)
      batches.push(...products.map((product) => normalizeProduct(product, query)))
    }
    const selected = selectUniqueProducts(batches, 20)
    if (selected.length < 20) throw new Error(`curation requires 20 products, got ${selected.length}`)
    return selected
  }

  if (/커피머신/.test(candidate.keyword || '')) {
    const batches = []
    for (const query of COFFEE_DEEPDIVE_QUERIES) {
      const products = await searchCoupangProducts(env, query, 6)
      batches.push(...products.map((product) => normalizeProduct(product, query)))
    }
    const selected = selectUniqueProducts(batches, 8)
    if (selected.length < 4) throw new Error(`coffee deepdive requires at least 4 products, got ${selected.length}`)
    return selected
  }

  if (/식기세척기/.test(candidate.keyword || '')) {
    const batches = []
    for (const query of DISHWASHER_DEEPDIVE_QUERIES) {
      const products = await searchCoupangProducts(env, query, 6)
      batches.push(...products.map((product) => normalizeProduct(product, query)))
    }
    const selected = selectUniqueProducts(batches, 8)
    if (selected.length < 4) throw new Error(`dishwasher deepdive requires at least 4 products, got ${selected.length}`)
    return selected
  }

  if (/청소기/.test(candidate.keyword || '')) {
    const queries = candidate.coupangSearchTerm
      ? [candidate.coupangSearchTerm, ...CLEANER_DEEPDIVE_QUERIES]
      : CLEANER_DEEPDIVE_QUERIES
    const batches = []
    for (const query of [...new Set(queries)]) {
      const products = await searchCoupangProducts(env, query, 6)
      batches.push(...products.map((product) => normalizeProduct(product, query)))
    }
    const selected = selectUniqueProducts(batches, 8)
    if (selected.length < 4) throw new Error(`cleaner deepdive requires at least 4 products, got ${selected.length}`)
    return selected
  }

  const query = candidate.keyword.replace(/\s*고르는\s*법\s*$/g, '').trim()
  const products = await searchCoupangProducts(env, query, 10)
  const selected = selectUniqueProducts(products.map((product) => normalizeProduct(product, query)), 5)
  if (selected.length < 3) throw new Error(`deepdive requires at least 3 products, got ${selected.length}`)
  return selected
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function sanitizeTitleText(value) {
  return String(value || '')
    .replace(/[:：]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeHeadingColons(html) {
  return String(html || '').replace(/(<h[1-6]\b[^>]*>)([\s\S]*?)(<\/h[1-6]>)/gi, (match, open, inner, close) => (
    `${open}${inner.replace(/[:：]/g, ' ')}${close}`
  ))
}

function findHeadingTextWithColon(html) {
  const headings = String(html || '').matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)
  for (const heading of headings) {
    if (/[:：]/.test(stripHtmlText(heading[1]))) return heading[0]
  }
  return null
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function truncate(value, maxLength = 58) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

function productRole(product, index, articleType) {
  if (articleType === 'curation_20') {
    const source = product.sourceKeyword || '여름 생활'
    const name = product.name || ''
    if (/로보락|Roborock/i.test(name) || /로보락|Roborock/i.test(source)) return index < 5 ? '로보락 대표 모델 확인' : '로보락 옵션 비교'
    if (/로봇\s*청소기|로봇청소기|물걸레/i.test(name) || /로봇\s*청소기|로봇청소기|물걸레/i.test(source)) return '로봇청소 루틴 점검'
    if (/청소기/.test(name) || /청소기/.test(source)) return '청소 방식 비교'
    if (/선풍기|서큘레이터/.test(source)) return '더위 체감 낮추기'
    if (/믹서기|블렌더/.test(name) || /믹서기|블렌더/.test(source)) return '주방 준비 시간 줄이기'
    if (/제습|필터|청소/.test(source)) return '습기·냄새 관리'
    if (/쿨|냉감|이불/.test(source)) return '수면 온도 관리'
    if (/모기/.test(source)) return '벌레 스트레스 줄이기'
    if (/텀블러|슬리퍼/.test(source)) return '외출·생활 편의'
    return '수납·생활 정리'
  }

  const name = product.name
  if (isRobotVacuumProduct(product)) {
    const brand = robotVacuumBrand(product)
    if (/Qrevo|Saros|S8|MaxV|Ultra/i.test(name)) return `${brand} 상위 스테이션 후보`
    if (/X50|X40|L40/i.test(name)) return '문턱·장애물 대응 후보'
    if (/X8|T50|DEEBOT|디봇/i.test(name)) return '물걸레 관리 특화 후보'
    if (/제트봇|Jet\s*Bot|비스포크/i.test(name)) return '삼성 생태계 후보'
    if (/로보킹|Roboking|LG|코드제로/i.test(name)) return '국내 AS·주방 동선 후보'
    return '로봇청소기 비교 후보'
  }
  if (/캡슐|네스프레소|돌체/.test(name)) return '캡슐형 간편 추출'
  if (/전자동|자동/.test(name)) return '전자동 관리 편의'
  if (/반자동|에스프레소|스팀/.test(name)) return '반자동 입문'
  if (/밀레|Miele/i.test(name)) return '프리미엄 내구성 후보'
  if (/LG|디오스|오브제|Dios/i.test(name)) return '국내 주방 통합 후보'
  if (/삼성|비스포크|BESPOKE/i.test(name)) return '디자인 맞춤 후보'
  if (/SK|매직|Magic/i.test(name)) return '렌탈·관리 편의 후보'
  if (/12인용|14인용|대용량/.test(name)) return '대가족 대용량 후보'
  if (product.price >= 500000) return '프리미엄 후보'
  if (index === 0) return '대표 후보'
  return '실속 후보'
}

function buildComparisonTable(products) {
  const rows = products.slice(0, 5).map((product, index) => {
    const role = productRole(product, index, 'deepdive')
    return `<tr>
<td style="width:92px;padding:10px;border:1px solid #d1d5db;text-align:center;vertical-align:middle;"><a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" style="display:block;width:72px;height:72px;object-fit:contain;border:1px solid #edf0f5;border-radius:12px;padding:6px;background:#fff;" /></a></td>
<th scope="row" style="padding:10px;border:1px solid #d1d5db;text-align:left;vertical-align:middle;background:#fff;"><strong style="display:block;font-size:15px;line-height:1.35;color:#111;">${escapeHtml(product.name)}</strong><span style="display:block;margin-top:4px;font-size:13px;color:#6b7280;">${escapeHtml(role)}</span></th>
<td style="width:104px;padding:10px;border:1px solid #d1d5db;text-align:center;vertical-align:middle;font-weight:800;white-space:nowrap;">${formatPrice(product.price)}</td>
<td style="width:104px;padding:10px;border:1px solid #d1d5db;text-align:center;vertical-align:middle;"><a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:inline-block;background:#ff5a00;color:#fff;text-decoration:none;padding:10px 16px;border-radius:999px;font-size:14px;font-weight:800;white-space:nowrap;">바로가기</a></td>
</tr>`
  }).join('\n')

  return `<table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;background:#fff;margin:0 0 30px;table-layout:fixed;">
<caption style="caption-side:top;text-align:left;font-size:13px;color:#6b7280;margin:0 0 8px;">가격은 작성 시점 기준이며, 구매 전 상세 페이지에서 최신 가격과 구성품을 확인하세요.</caption>
<thead><tr><th scope="col" style="width:92px;padding:10px;border:1px solid #d1d5db;background:#f9fafb;text-align:center;font-size:13px;color:#374151;">사진</th><th scope="col" style="padding:10px;border:1px solid #d1d5db;background:#f9fafb;text-align:left;font-size:13px;color:#374151;">상품과 역할</th><th scope="col" style="width:104px;padding:10px;border:1px solid #d1d5db;background:#f9fafb;text-align:center;font-size:13px;color:#374151;">가격</th><th scope="col" style="width:104px;padding:10px;border:1px solid #d1d5db;background:#f9fafb;text-align:center;font-size:13px;color:#374151;">링크</th></tr></thead>
<tbody>${rows}</tbody>
</table>`
}

function productDecision(product, index) {
  const name = product.name
  const sourceText = `${product.sourceKeyword || ''} ${name}`
  if (/로봇\s*청소기|로봇청소기|물걸레/i.test(sourceText)) {
    const insight = robotVacuumInsight(product)
    if (insight) return insight.decision
    if (/스테이션|먼지비움|자동/i.test(name)) return '퇴근 후 바닥 청소를 다시 시작하고 싶지 않은 집에서 먼저 볼 만한 자동 관리 후보입니다.'
    if (/물걸레|걸레|Mop/i.test(name)) return '주방 앞 물자국과 아이 간식 부스러기까지 같이 줄이고 싶은 집에 맞는 물걸레 중심 후보입니다.'
    return '머리카락, 먼지, 생활 부스러기를 매일 조금씩 줄이고 싶은 집에서 기본기를 확인할 후보입니다.'
  }
  if (/침구/.test(sourceText)) return '침대와 소파 먼지가 신경 쓰이는 집에서 위생 루틴을 만들기 좋은 후보입니다.'
  if (/무선청소기/.test(sourceText)) return '아이 등교 후나 퇴근 뒤 빠르게 한 바퀴 돌릴 청소 루틴에 맞는 후보입니다.'
  if (/LG|삼성|위닉스|캐리어/i.test(name)) return '브랜드 AS와 생활가전 기본기를 우선하는 안정형 후보입니다.'
  if (/샤오미|미디어|쿠쿠|신일|위니아|테팔|필립스|일렉트로룩스/i.test(name)) return '가격과 기능 균형을 함께 보는 실속 후보입니다.'
  if (/프리미엄|프로|대용량|스마트|인버터/i.test(name)) return '상위 기능과 편의성을 기대할 수 있지만 실제 필요 기능을 따져볼 후보입니다.'
  if (product.price >= 300000) return '프리미엄 가격대인 만큼 용량, 관리 편의, 사후 관리를 꼼꼼히 볼 후보입니다.'
  if (product.price <= 100000) return '입문 가격대라 기본 성능과 소음, 구성품을 확인하면 좋은 후보입니다.'
  return index === 0 ? '이번 비교에서 가장 먼저 검토할 대표 후보입니다.' : '가격과 사용 환경을 함께 맞춰볼 비교 후보입니다.'
}

function robotVacuumInsight(product) {
  const text = `${product.name || ''}`
  if (!isRobotVacuumProduct(product)) return null
  if (/Qrevo|Curv/i.test(text)) {
    return {
      decision: '머리카락 엉킴, 모서리 물걸레, 스테이션 관리 부담을 한 번에 줄이고 싶은 집에서 먼저 볼 만한 상위 후보입니다.',
      scene: '긴 머리카락이 많은 집은 브러시 엉킴이 반복되면 결국 사람이 다시 풀어야 합니다. 로보락 Qrevo 계열은 모서리 청소와 물걸레 관리까지 같이 보는 구매자가 많으므로, 실제로는 흡입력보다 “내가 손대는 횟수가 줄어드는가”가 클릭 포인트입니다.',
      review: '상세 페이지와 후기를 볼 때는 브러시 엉킴, 모서리 물걸레 닿는 범위, 스테이션 세척·건조 소음, 소모품 가격을 먼저 보세요.',
      target: '머리카락, 반려동물 털, 주방 앞 얼룩 때문에 매일 바닥을 다시 보는 집에 맞습니다.',
      cta: '브러시·스테이션 조건 확인',
    }
  }
  if (/Saros|S8\s*MaxV/i.test(text)) {
    return {
      decision: '상위 내비게이션과 장애물 회피, 자동 관리 기능을 함께 보고 싶은 프리미엄 후보입니다.',
      scene: '아이 장난감, 슬리퍼, 충전선이 바닥에 자주 놓이는 집은 지도 성능보다 장애물 회피가 더 중요하게 느껴집니다. 상위 로보락 계열은 “청소를 시켰는데 중간에 멈추지 않는가”를 중심으로 봐야 합니다.',
      review: '후기에서는 장애물 회피, 낮은 가구 밑 진입, 문턱 넘김, 앱 지도 안정성, 야간 작동 소음을 확인하세요.',
      target: '가구와 물건이 많은 거실에서 로봇청소기를 매일 예약해두려는 집에 맞습니다.',
      cta: '문턱·장애물 조건 확인',
    }
  }
  if (/드리미|Dreame|X50|X40|L40/i.test(text)) {
    return {
      decision: '문턱, 낮은 가구, 물걸레 관리처럼 한국 아파트에서 자주 막히는 지점을 확인할 후보입니다.',
      scene: '로봇청소기가 한 방만 잘 치우고 문턱에서 멈추면 가족 입장에서는 “비싼 장난감”이 됩니다. 드리미 상위 계열은 문턱과 낮은 공간 대응을 강하게 내세우는 만큼, 우리 집 방문턱과 소파 밑 높이를 먼저 재보는 게 클릭 전 핵심입니다.',
      review: '후기에서는 문턱 넘김, 물걸레 세척 후 냄새, 본체 높이, 스테이션 물통 관리, 앱 예약 안정성을 확인하세요.',
      target: '문턱이 있거나 방마다 청소를 나눠 돌려야 하는 집에 맞습니다.',
      cta: '문턱·가구 밑 조건 확인',
    }
  }
  if (/에코백스|ECOVACS|DEEBOT|디봇|X8|T50/i.test(text)) {
    return {
      decision: '물걸레가 바닥을 지나가기만 하는 수준이 아니라 실제 닦임과 세척 루틴을 따져볼 후보입니다.',
      scene: '주방 앞 기름 자국, 아이 간식 부스러기, 현관 먼지가 섞이는 집은 흡입만으로 만족하기 어렵습니다. 에코백스 X8·디봇 계열은 물걸레 방식과 모서리 접근을 함께 봐야 하므로 “얼마나 깨끗하게 닦는가”와 “걸레를 얼마나 덜 만지는가”가 클릭 포인트입니다.',
      review: '후기에서는 롤러/회전 물걸레 방식, 오수통 냄새, 모서리 닦임, 스테이션 세척 소음, 소모품 구매 편의를 확인하세요.',
      target: '주방과 거실 물걸레 청소를 로봇에게 더 많이 넘기고 싶은 집에 맞습니다.',
      cta: '물걸레·스테이션 조건 확인',
    }
  }
  if (/삼성|비스포크|BESPOKE|제트봇|Jet\s*Bot/i.test(text)) {
    return {
      decision: '삼성 가전 생태계, 국내 AS, 스팀 물걸레 관리까지 함께 보는 안정형 후보입니다.',
      scene: '부모님 집이나 가족 공용 거실에서는 낯선 해외 앱보다 익숙한 브랜드와 AS 접근성이 더 중요할 수 있습니다. 삼성 제트봇 계열은 디자인과 관리 스테이션을 함께 보는 제품이므로, 가격보다 가족이 실제로 조작하기 쉬운지를 봐야 합니다.',
      review: '후기에서는 앱 연결, 물걸레 위생 관리, 스테이션 크기, 문턱 넘김, 국내 AS 접수 편의를 확인하세요.',
      target: '국내 브랜드와 가족 공용 사용성을 중요하게 보는 집에 맞습니다.',
      cta: '삼성 AS·스테이션 조건 확인',
    }
  }
  if (/LG|엘지|로보킹|Roboking|코드제로/i.test(text)) {
    return {
      decision: '국내 주방·거실 동선과 AS 접근성을 중시하는 집에서 검토할 현실형 후보입니다.',
      scene: '로봇청소기는 스펙보다 고장 났을 때와 소모품을 살 때의 스트레스가 오래 남습니다. LG 로보킹 계열은 국내 브랜드 신뢰와 관리 편의를 함께 기대하는 구매자가 보기 좋고, 특히 부모님 집이나 넓은 거실에서 “설명 없이 쓸 수 있는가”를 봐야 합니다.',
      review: '후기에서는 문턱 넘김, 급배수·스테이션 설치 조건, 소음, 앱 조작 난이도, 소모품 수급을 확인하세요.',
      target: '국내 AS와 가족이 이해하기 쉬운 사용성을 우선하는 집에 맞습니다.',
      cta: 'LG 설치·AS 조건 확인',
    }
  }
  return {
    decision: '흡입력 숫자보다 문턱, 러그, 스테이션 크기, 물걸레 관리 방식이 우리 집과 맞는지 확인할 후보입니다.',
    scene: '로봇청소기는 좋은 제품이어도 집 구조와 맞지 않으면 사용 빈도가 떨어집니다. 문턱, 러그, 낮은 가구, 충전 스테이션 위치를 먼저 확인해야 클릭 후 후회가 줄어듭니다.',
    review: '후기에서는 문턱, 러그, 머리카락 엉킴, 물걸레 냄새, 앱 지도 오류, 소모품 가격을 확인하세요.',
    target: '바닥 청소 시간을 줄이고 싶은 집에서 기본 조건을 맞춰볼 후보입니다.',
    cta: '우리 집 바닥 조건 확인',
  }
}

function productPros(product) {
  const insight = robotVacuumInsight(product)
  if (insight) {
    const pros = [
      insight.target,
      '실제 구매 판단은 흡입력 숫자보다 문턱, 물걸레 관리, 스테이션 설치 공간에서 갈립니다.',
      '쿠팡 가격만 보지 말고 공식몰, 대형가전몰, 오픈마켓의 구성품과 AS 조건을 같이 비교할 만한 모델입니다.',
    ]
    return pros.slice(0, 3)
  }
  const pros = []
  if (/LG|삼성|위닉스|캐리어|위니아|신일|쿠쿠|샤오미|일렉트로룩스|필립스|테팔|쿠첸|쿠잉|미디어/i.test(product.name)) pros.push('브랜드 인지도가 있어 AS와 상세 스펙을 확인하기 쉽습니다.')
  if (product.price <= 100000) pros.push('입문 가격대라 첫 구매나 보조 용도로 접근하기 좋습니다.')
  if (product.price >= 300000) pros.push('상위 가격대 후보라 용량, 편의 기능, 관리 옵션을 기대해 볼 수 있습니다.')
  if (!pros.length) pros.push('가격, 이미지, 상품 링크가 모두 확인되어 비교 후보로 넣을 수 있습니다.')
  return pros.slice(0, 3)
}

function productCons(product) {
  const insight = robotVacuumInsight(product)
  if (insight) {
    const cons = [
      '문턱, 러그, 낮은 가구 밑 높이와 맞지 않으면 상위 기능도 체감이 떨어질 수 있습니다.',
      '스테이션이 큰 모델은 설치 공간과 물통·오수통 관리 루틴을 먼저 정해야 합니다.',
      '후기에서 앱 지도 오류나 걸레 냄새 이야기가 반복되면 가격이 좋아도 신중하게 봐야 합니다.',
    ]
    return cons.slice(0, 3)
  }
  const cons = []
  cons.push('온라인 상품 정보만으로는 실제 소음, 전기요금, 장기 내구성, 세부 구성품을 확정할 수 없습니다.')
  if (product.price >= 300000) cons.push('가격대가 높으므로 필요한 기능과 보증 조건이 충분한지 비교해야 합니다.')
  if (product.price <= 100000) cons.push('저가형은 용량, 소음, 부품 마감, 소모품 조건을 별도로 확인해야 합니다.')
  return cons.slice(0, 3)
}

function productTarget(product) {
  const insight = robotVacuumInsight(product)
  if (insight) return insight.target
  if (product.price <= 100000) return '예산을 낮추면서 핵심 기능을 먼저 확인하려는 입문 사용자에게 맞습니다.'
  if (product.price >= 300000) return '한 번 사서 오래 쓰는 생활가전으로 보고 기능과 사후 관리를 함께 따지는 사용자에게 맞습니다.'
  if (/LG|삼성|위닉스|캐리어/i.test(product.name)) return '브랜드 신뢰도와 AS 접근성을 중요하게 보는 사용자에게 맞습니다.'
  return '가격, 용량, 관리 편의성, AS 조건을 균형 있게 비교하려는 사용자에게 맞습니다.'
}

function productChecks(product) {
  const insight = robotVacuumInsight(product)
  if (insight) {
    return [
      '문턱 높이, 러그 사용 여부, 침대·소파 밑 진입 높이',
      '스테이션 크기, 물통·오수통 비우는 동선, 소음',
      '물걸레 세척·건조 방식과 냄새 관리 루틴',
      '소모품 가격, 앱 지도 안정성, AS 접수 방식',
    ]
  }
  const checks = [
    '사용 공간에 맞는 용량, 크기, 무게, 보관 방식',
    '소음 수치, 소비전력, 필터·부품 분리 세척 방식',
    '기본 구성품, 보증 기간, AS 접수 방식',
  ]
  if (product.price >= 300000) checks.push('동급 상위 모델과 기능 차이, 장기 사용 비용 비교')
  if (product.price <= 100000) checks.push('저가형에서 자주 빠지는 부가 기능과 소모품 가격')
  return checks.slice(0, 4)
}

function robotVacuumMarketSignal(product) {
  const text = `${product.name || ''}`
  if (/드리미|Dreame|X50|X60|L40|L10/i.test(text)) {
    return '드리미는 올인원 스테이션, 물걸레 세척·건조, 문턱 대응 같은 “사람이 덜 만지는 청소” 이미지가 강합니다. 사용후기에서는 청소 성능보다 스테이션 관리, 물걸레 냄새, 앱 지도 안정성, 문턱 통과가 반복 확인 포인트입니다. 같은 모델명이라도 공식몰, 대형가전몰, 오픈마켓, 쿠팡에서 구성품과 사은품이 달라질 수 있어 가격표만 단독으로 보면 손해를 볼 수 있습니다.'
  }
  if (/로보락|Roborock|Qrevo|Saros|S8/i.test(text)) {
    return '로보락은 프리미엄 로봇청소기 비교에서 자주 언급되는 브랜드입니다. 특히 모서리 청소, 브러시 엉킴, 장애물 회피, 스테이션 자동 관리가 구매 이유로 연결됩니다. 다만 인기 모델일수록 소모품, 직배수 키트, 스테이션 크기, 공식 AS 조건을 판매처별로 확인해야 실제 체감 비용이 보입니다.'
  }
  if (/에코백스|ECOVACS|DEEBOT|디봇|X8|T50/i.test(text)) {
    return '에코백스는 물걸레 방식과 스테이션 관리 기능을 중심으로 비교되는 브랜드입니다. 주방 앞 물자국이나 아이 간식 부스러기처럼 “흡입만으로 부족한 집”에서 관심을 받을 만합니다. 구매 전에는 롤러·회전 물걸레 방식, 오수통 관리, 세제·걸레 소모품 가격, 공식몰과 오픈마켓 구성 차이를 함께 보는 편이 안전합니다.'
  }
  if (/삼성|비스포크|BESPOKE|제트봇|Jet\s*Bot/i.test(text)) {
    return '삼성 제트봇 계열은 국내 브랜드 AS, SmartThings 연동, 스팀·청정스테이션 같은 가전 생태계 관점에서 비교할 만합니다. 해외 프리미엄 브랜드보다 기능 숫자가 덜 화려해 보여도 부모님 집이나 가족 공용 거실에서는 AS 접근성과 사용 설명의 쉬움이 실제 장점이 됩니다.'
  }
  if (/LG|엘지|로보킹|Roboking|코드제로/i.test(text)) {
    return 'LG 로보킹·코드제로 계열은 국내 AS와 설치 상담, 기존 LG 가전과의 신뢰감이 구매 이유가 됩니다. 가격만 보면 비싸게 느껴질 수 있지만, 설치 조건과 관리 서비스까지 포함해 볼 때 부모님 집이나 넓은 거실용 후보로 비교할 만합니다.'
  }
  return '이 후보는 브랜드보다 집 구조와 관리 루틴을 먼저 맞춰야 합니다. 사용후기에서는 흡입력 칭찬보다 문턱, 러그, 앱 지도 오류, 물걸레 냄새, 소모품 가격처럼 반복 불편이 있는지 확인하는 편이 실제 구매 판단에 더 가깝습니다.'
}

function personaIntro(keyword) {
  if (/로봇\s*청소기|로봇청소기|물걸레/.test(keyword)) {
    return '로봇청소기는 “청소를 안 해도 되는 기계”라기보다 집안일이 가장 바쁜 시간대를 덜 빼앗기게 해주는 도구입니다. 아침에 아이 챙기고 출근 준비하느라 바닥 볼 틈이 없는 집, 퇴근 후 저녁 준비만으로도 이미 지친 집, 주말마다 머리카락과 먼지를 한 번에 몰아서 치우는 집이라면 기준이 달라집니다.'
  }
  if (/청소기/.test(keyword)) {
    return '청소기는 스펙보다 “언제 꺼내 쓰게 되는가”가 더 중요합니다. 아이가 과자를 흘린 뒤, 출근 전 현관 먼지가 보일 때, 엄마가 오기 전 거실을 급히 정리해야 할 때 손이 가는 제품이어야 오래 씁니다.'
  }
  if (/선풍기|서큘레이터/.test(keyword)) {
    return '선풍기는 여름에 가족이 가장 자주 만지는 생활가전입니다. 거실에서 엄마가 리모컨을 찾고, 아이는 바람이 세다고 끄고, 밤에는 소음 때문에 다시 끄는 일이 생기지 않으려면 가격보다 생활 장면을 먼저 봐야 합니다.'
  }
  return `${keyword}를 고를 때는 가격표보다 실제 생활 장면이 먼저입니다. 집안일, 출근 준비, 아이 돌봄, 부모님 선물처럼 매일 반복되는 상황에서 덜 귀찮아지는 제품이어야 만족도가 오래 갑니다.`
}

function personaSelectionNote(keyword) {
  if (/로봇\s*청소기|로봇청소기|물걸레/.test(keyword)) {
    return '이번 비교는 30대부터 60대까지 집안일과 일을 함께 챙기는 여성, 주부, 엄마 입장에서 “내가 직접 밀대를 잡는 시간이 줄어드는가”를 중심으로 봤습니다. 가격은 바뀔 수 있으니 결제 전에는 최신 가격, 판매처별 구성품, 스테이션 크기, 물걸레 관리 방식을 다시 확인하세요.'
  }
  return '이번 비교는 제품을 잘 아는 사람보다 매일 써야 하는 사람의 시선으로 정리했습니다. 가격은 바뀔 수 있으니 결제 전에는 최신 가격, 구성품, 설치 조건을 다시 확인하세요.'
}

function productLifeScene(product, candidate) {
  const text = `${candidate.keyword || ''} ${product.sourceKeyword || ''} ${product.name || ''}`
  if (/로봇\s*청소기|로봇청소기|물걸레/i.test(text)) {
    const insight = robotVacuumInsight(product)
    if (insight) return insight.scene
    return '아침에 한 번 돌려두고 나갔을 때 머리카락과 먼지가 덜 보이는지, 저녁 준비 전 주방 앞 얼룩까지 부담 없이 맡길 수 있는지가 핵심입니다. 스테이션이 있는 모델은 편하지만 자리도 차지하므로 현관 옆, 거실 구석, 다용도실 앞에 실제로 둘 수 있는지 먼저 상상해야 합니다.'
  }
  if (/침구/.test(text)) return '침구청소기는 매일 쓰기보다 주말 루틴에 들어가야 값어치를 합니다. 침대, 패브릭 소파, 아이 방 매트처럼 먼지가 쌓이는 자리를 정해두면 구매 후 방치될 확률이 줄어듭니다.'
  if (/무선청소기/.test(text)) return '무선청소기는 충전 거치대에서 바로 꺼내 한 바퀴 돌릴 수 있어야 합니다. 먼지가 보일 때마다 꺼내 쓰려면 무게, 손목 부담, 먼지통 비우는 방식이 성능표만큼 중요합니다.'
  return '이 제품은 한 번 사두고 가끔 보는 물건이 아니라 생활 동선 안에서 반복해서 만지는 물건입니다. 둘 자리, 꺼내는 빈도, 청소나 세척 방식까지 맞아야 가격 대비 만족도가 올라갑니다.'
}

function productReviewGuide(product, candidate) {
  const text = `${candidate.keyword || ''} ${product.sourceKeyword || ''} ${product.name || ''}`
  if (/로봇\s*청소기|로봇청소기|물걸레/i.test(text)) {
    const insight = robotVacuumInsight(product)
    if (insight) return insight.review
    return '후기를 볼 때는 “잘 빨아들인다”보다 문턱을 넘는지, 러그에 걸리는지, 물걸레 냄새가 남는지, 앱 지도가 자주 틀어지는지, 스테이션 청소가 귀찮지 않은지를 먼저 보세요. 이 부분이 실제 집에서는 가격 확인 버튼을 누를 이유가 됩니다.'
  }
  return '후기를 볼 때는 만족도 숫자보다 반복되는 불편을 보세요. 소음, 무게, 세척, 보관, AS처럼 매일 쓰는 사람이 자주 언급하는 지점이 실제 구매 판단에 더 가깝습니다.'
}

function productDeliverySentence(product) {
  return '결제 전에는 옵션, 구성품, 도착 예정일을 상세 페이지에서 한 번 더 확인하세요.'
}

function productCtaButtonText(product) {
  return robotVacuumInsight(product)?.cta || '우리 집 조건으로 가격 확인'
}

function renderProductClickReason(product) {
  const insight = robotVacuumInsight(product)
  if (!insight) return ''
  return `<div style="border:1px solid #fed7aa;background:#fff7ed;border-radius:16px;padding:16px 18px;margin:14px 0;">
<strong style="display:block;margin:0 0 8px;color:#111;">구매 버튼 누르기 전 핵심 확인</strong>
<p style="margin:0;color:#374151;">이 제품은 단순히 “청소가 잘 되는지”가 아니라 <strong>내가 다시 밀대와 걸레를 잡는 횟수를 줄이는지</strong>를 확인해야 합니다. 가격보다 먼저 스테이션 크기, 문턱 대응, 물걸레 세척·건조, 소모품 구성을 보세요. 이 조건이 맞으면 가격 확인 버튼을 누를 이유가 생기고, 맞지 않으면 비싼 모델도 체감이 약합니다.</p>
</div>`
}

function buildTopCompareArticle(candidate, products) {
  const selected = products.slice(0, 5)
  const title = sanitizeTitleText(candidate.blogTitle?.includes('TOP')
    ? candidate.blogTitle
    : `${candidate.keyword} TOP ${selected.length} 소음, 용량, 관리 기준으로 고르는 법`)
  const slug = `cp9-${formatKstDate()}-${Date.now()}`
  const table = enhanceFirstComparisonTable(buildComparisonTable(selected), { force: true }).html
  const itemListJsonLd = renderItemListJsonLd(selected, title)
  const sections = selected.map((product, index) => {
    const pros = productPros(product).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    const cons = productCons(product).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    const checks = productChecks(product).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    return `<section class="cp9-top-product" style="border-top:1px solid #e5e7eb;padding:28px 0;">
<h2 style="font-size:24px;line-height:1.35;margin:0 0 12px;color:#111;">${index + 1}. ${escapeHtml(product.name)}</h2>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;margin:0 auto 18px;"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" style="display:block;box-sizing:border-box;width:min(100%,340px);height:340px;object-fit:contain;border:1px solid #edf0f5;border-radius:18px;padding:14px;background:#fff;margin:0 auto;box-shadow:0 10px 26px rgba(15,23,42,.06);" /></a>
<p style="margin:0 0 10px;"><strong>핵심 판단:</strong> ${escapeHtml(productDecision(product, index))} 오늘 확인한 가격은 <strong>${formatPrice(product.price)}</strong>입니다. ${escapeHtml(productDeliverySentence(product))}</p>
<p style="margin:0 0 10px;">${escapeHtml(productLifeScene(product, candidate))}</p>
<p style="margin:0 0 14px;">${escapeHtml(productReviewGuide(product, candidate))}</p>
${robotVacuumInsight(product) ? `<div style="border:1px solid #dbe3ef;border-radius:14px;background:#f8fafc;padding:14px;margin:0 0 14px;"><strong style="display:block;margin:0 0 8px;color:#111;">브랜드·후기·판매처 체크</strong><p style="margin:0;color:#374151;">${escapeHtml(robotVacuumMarketSignal(product))}</p></div>` : ''}
${renderProductFactPanel(product)}
<div style="display:block;margin:14px 0;">
<div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#f8fafc;margin:0 0 10px;"><strong style="display:block;margin-bottom:8px;color:#111;">좋은 점</strong><ul style="margin:0;padding-left:20px;">${pros}</ul></div>
<div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#fff7ed;"><strong style="display:block;margin-bottom:8px;color:#111;">조심할 점</strong><ul style="margin:0;padding-left:20px;">${cons}</ul></div>
</div>
<p style="margin:0 0 10px;"><strong>추천 대상:</strong> ${escapeHtml(productTarget(product))}</p>
<div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#fff;margin:0 0 14px;"><strong style="display:block;margin-bottom:8px;color:#111;">구매 전 체크</strong><ul style="margin:0;padding-left:20px;">${checks}</ul></div>
${renderProductClickReason(product)}
<div style="display:flex;justify-content:center;align-items:center;margin:18px 0 4px;">
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;min-height:54px;min-width:220px;padding:0 30px;border-radius:999px;background:linear-gradient(135deg,#ff5a00 0%,#ff7a1a 100%);color:#fff!important;text-decoration:none!important;font-size:17px;font-weight:900;letter-spacing:-.02em;box-shadow:0 12px 24px rgba(255,90,0,.28),0 3px 8px rgba(15,23,42,.12);border:1px solid rgba(255,255,255,.28);">✓ ${escapeHtml(productCtaButtonText(product))}</a>
</div>
</section>`
  }).join('\n')

  const content = `<article class="cp9-article" style="max-width:760px;margin:0 auto;color:#222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.78;font-size:16px;">
<p style="font-size:17px;color:#444;margin:0 0 18px;">${escapeHtml(personaIntro(candidate.keyword))}</p>
<p style="margin:0 0 24px;">${escapeHtml(personaSelectionNote(candidate.keyword))}</p>
<div style="border:1px solid #e5e7eb;background:#f8fafc;border-radius:14px;padding:18px 20px;margin:24px 0;"><strong style="display:block;margin-bottom:8px;color:#111;">선택 기준 요약</strong><ul style="margin:0;padding-left:20px;"><li>사용 공간에 맞는 용량과 크기가 1순위입니다.</li><li>소음, 소비전력, 세척 방식은 매일 사용할 때 체감 차이가 큽니다.</li><li>장기 사용 목적이면 AS와 필터·소모품 관리 조건을 함께 봐야 합니다.</li><li>가격은 작성 시점 기준이며 구매 전 최신 가격, 판매처별 구성품, 도착 예정일을 확인해야 합니다.</li></ul></div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">${escapeHtml(candidate.keyword)} TOP ${selected.length} 빠른 비교</h2>
${table}
${sections}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">마지막으로 보는 구매 순서</h2>
<p>첫째, 실제로 둘 공간의 크기와 사용 빈도를 먼저 정하세요. 둘째, 가격이 비슷한 후보끼리는 소음, 소비전력, 세척 편의성, 기본 구성품을 비교해야 합니다. 셋째, 매일 쓰는 생활가전이라면 AS와 소모품 조건이 더 중요할 수 있습니다. 넷째, 쿠팡뿐 아니라 공식몰, 대형가전몰, 오픈마켓의 구성품과 사은품을 함께 본 뒤 결제하는 것이 안전합니다.</p>
<p>가장 좋은 제품은 무조건 비싼 모델이 아니라 내 공간과 생활 패턴에 맞는 모델입니다. 이번 TOP 비교는 작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 구성품 확인 가능성을 기준으로 삼았습니다. 실제 사용감은 상세 페이지의 스펙과 별도 후기 확인으로 보완하세요.</p>
<p style="font-size:13px;color:#666;margin-top:28px;">${DISCLOSURE}</p>
${itemListJsonLd}
</article>`

  return { title, slug, content, auxiliaryImages: [] }
}

function buildDeepdiveArticle(candidate, products) {
  const isIllyKeyword = /일리|illy/i.test(candidate.keyword || '')
  const title = isIllyKeyword
    ? '일리커피머신 고르는 법 캡슐 감성, 관리 기준, 브랜드 차이'
    : '커피머신 고르는 법 캡슐·반자동·전자동 차이와 관리 기준'
  const slug = isIllyKeyword ? 'illy-coffee-machine-deepdive-capsule-care' : 'coffee-machine-deepdive-capsule-semi-auto-care'
  const table = enhanceFirstComparisonTable(buildComparisonTable(products), { force: true }).html
  const itemListJsonLd = renderItemListJsonLd(products, title)
  const sourceLinks = COFFEE_BRAND_SOURCES.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a></li>`).join('')
  const featuredProducts = products.slice(0, 4).map((product, index) => {
    const role = productRole(product, index, 'deepdive')
    return `<section style="border:1px solid #e5e7eb;border-radius:18px;padding:18px;margin:18px 0;background:#fff;">
<h3 style="font-size:20px;line-height:1.35;margin:0 0 10px;color:#111;">${index + 1}. ${escapeHtml(product.name)}</h3>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" style="display:block;width:180px;max-width:100%;height:180px;object-fit:contain;border:1px solid #edf0f5;border-radius:16px;padding:10px;background:#fff;margin:0 auto 12px;" /></a>
<p style="margin:0 0 10px;"><strong>구매 연결 역할:</strong> ${escapeHtml(role)} 포지션입니다. 이 글의 본론은 브랜드와 방식의 해석이므로, 이 영역은 독자가 실제 가격과 구성품을 확인하는 보조 링크로만 둡니다. 현재 확인 가격은 <strong>${formatPrice(product.price)}</strong>입니다.</p>
${renderProductFactPanel(product)}
<ul style="margin:0 0 12px;padding-left:20px;">
<li>확인할 것: 구성품, 캡슐/원두 호환성, 물통 용량, 세척 방식, 보증 조건</li>
<li>주의할 것: 온라인 상품 정보만으로는 실제 추출 압력, 소음, 내부 세척 난이도를 확정할 수 없습니다.</li>
<li>맞는 사람: ${escapeHtml(role)}을 우선순위로 보는 사용자</li>
</ul>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:999px;background:#ff5a00;color:#fff;text-decoration:none;font-size:15px;font-weight:900;">가격·구성 바로 확인</a>
</section>`
  }).join('\n')

  const content = `<article class="cp9-article" style="max-width:760px;margin:0 auto;color:#222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.78;font-size:16px;">
<p style="font-size:17px;color:#444;margin:0 0 18px;">커피머신 고르는 법을 단순히 가격, 압력, 물통 용량으로만 보면 중요한 장면을 놓칩니다. 커피머신은 주방에 놓이는 작은 가전이지만, 실제로는 사용자의 아침 루틴, 손님을 맞이하는 방식, 집 안에서 어떤 취향을 드러내고 싶은지까지 건드립니다. 같은 커피를 마셔도 어떤 사람은 버튼 한 번의 안정감을 원하고, 어떤 사람은 원두를 갈고 추출을 조절하는 시간을 일종의 의식처럼 여깁니다.</p>
<p style="margin:0 0 24px;">그래서 딥다이브 글에서는 상품 스펙 설명만 반복하지 않습니다. 일리커피머신을 중심에 두고, 유명 브랜드가 어떤 철학으로 커피 경험을 설계했는지, 대표 아이템이 어떤 이미지를 만들었는지, 그 이미지가 실제 구매 결정에 어떤 의미를 갖는지까지 봅니다. 구매 링크는 글 하단의 확인용으로 배치하고, 본문은 브랜드와 방식의 차이를 이해하는 데 집중합니다.</p>
<div style="border:1px solid #e5e7eb;background:#f8fafc;border-radius:14px;padding:18px 20px;margin:24px 0;"><strong style="display:block;margin-bottom:8px;color:#111;">결론부터 말하면</strong><ul style="margin:0;padding-left:20px;"><li>편의성이 최우선이면 캡슐형이 안전합니다.</li><li>맛 조절과 스팀 밀크까지 원하면 반자동을 봐야 합니다.</li><li>가족이 여러 잔을 마시고 관리 시간을 줄이고 싶다면 전자동이 맞습니다.</li><li>어떤 방식이든 물통, 세척, 캡슐/원두 비용, AS를 가격보다 먼저 확인해야 합니다.</li></ul></div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">1. 일리커피머신은 감성과 단순함을 함께 사는 선택입니다</h2>
<p>일리는 커피머신을 단순한 추출 도구보다 브랜드 경험의 입구로 다룹니다. 빨간 로고, 둥근 캡슐, 주방 위에 두었을 때의 작은 오브제 같은 인상이 먼저 들어옵니다. 이 이미지는 구매 결정에 꽤 큰 영향을 줍니다. 일리커피머신을 찾는 사람은 대개 복잡한 반자동 세팅보다 정돈된 캡슐 루틴, 작은 주방에 어울리는 디자인, 매일 반복하기 쉬운 커피 시간을 기대합니다.</p>
<p>확인 가능한 구매 정보 기준으로 보면 일리 계열은 캡슐 호환성, 물통 관리, 캡슐 수급, 본체 크기를 먼저 봐야 합니다. 해석하자면 일리는 맛의 세밀한 조절보다 브랜드가 정한 커피 경험을 안정적으로 반복하는 쪽에 가깝습니다. 구매 전 질문은 단순합니다. 나는 원두를 직접 고르고 분쇄하는 재미를 원하는가, 아니면 캡슐을 넣고 일정한 결과를 얻는 편안함을 원하는가. 후자라면 일리커피머신은 충분히 설득력 있는 후보가 됩니다.</p>
<p>다만 캡슐형의 장점은 동시에 한계입니다. 캡슐 가격이 누적되고, 호환 캡슐 선택지가 방식별로 달라질 수 있으며, 라떼나 카푸치노를 자주 마신다면 우유 거품을 어떻게 만들지 별도로 봐야 합니다. 작은 머신이 주는 예쁨만 보고 사면 물 보충과 캡슐 처리 동선에서 아쉬움이 생길 수 있습니다. 예쁩니다. 하지만 예쁜 물건도 매일 치우기 귀찮으면 금방 장식품이 됩니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">2. 네스프레소: 커피를 취향보다 시스템으로 만든 브랜드</h2>
<p>네스프레소가 만든 이미지는 명확합니다. 커피를 잘 모르는 사람도 일정한 품질의 에스프레소 경험에 접근하게 만드는 것. 이 브랜드의 핵심은 머신 하나가 아니라 캡슐, 추출 압력, 물량, 클럽형 구매 경험, 재활용 캠페인까지 이어지는 폐쇄형 생태계입니다. 이것을 단점으로 보는 사람도 있고, 장점으로 보는 사람도 있습니다. 중요한 것은 네스프레소를 산다는 행위가 “나는 커피를 직접 공부하겠다”가 아니라 “검증된 결과를 빠르게 반복하겠다”는 선택에 가깝다는 점입니다.</p>
<p>대표 아이템을 보면 그 철학이 더 분명해집니다. 오리지널 라인은 작고 직관적입니다. 에스프레소와 룽고 중심의 단순한 사용성을 제공하고, 좁은 주방이나 사무실 책상 옆에도 자연스럽게 들어갑니다. 반면 버츄오 라인은 캡슐 바코드와 회전 추출을 통해 잔의 크기와 질감을 확장합니다. 사용자는 원두의 산지나 로스팅보다 캡슐 이름과 컵 사이즈로 취향을 기억합니다. 이 방식은 커피 애호가에게는 다소 제한적으로 보일 수 있지만, 매일 같은 품질을 원하는 사람에게는 강력한 안정감입니다.</p>
<p>브랜드 이미지도 구매 이유에 크게 작동합니다. 네스프레소는 주방에 두었을 때 “전문 장비”보다 “잘 정리된 라이프스타일 오브제”에 가깝습니다. 머신 디자인은 과시적이지 않고, 캡슐 보관함과 함께 놓으면 호텔 라운지나 오피스 팬트리 같은 인상을 만듭니다. 손님에게 커피를 낼 때도 복잡한 설명이 필요 없습니다. 캡슐을 고르게 하고 버튼을 누르면 됩니다. 이 간단함이 네스프레소의 진짜 프리미엄입니다.</p>
<p>다만 철학이 분명한 만큼 한계도 분명합니다. 캡슐 시스템은 자유도를 포기하는 대신 반복성을 얻는 구조입니다. 캡슐 단가가 누적되고, 호환 캡슐 품질에 따라 만족도가 흔들릴 수 있으며, 원두를 직접 고르고 분쇄하는 재미는 거의 없습니다. 따라서 네스프레소는 커피 취미를 시작하려는 사람보다, 좋은 커피를 매일 빠르게 마시고 싶은 사람에게 맞습니다. 구매 전에는 오리지널과 버츄오의 캡슐 호환성이 완전히 다르다는 점을 반드시 확인해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">2. 드롱기: 이탈리안 홈카페의 이미지와 일상성</h2>
<p>드롱기는 커피머신을 기능만으로 팔지 않습니다. 이 브랜드의 힘은 이탈리안 홈카페라는 이미지에 있습니다. 스테인리스, 레트로한 곡선, 주방 위에 놓였을 때의 존재감, 그리고 에스프레소와 우유 음료를 집에서 만든다는 장면이 브랜드의 중심입니다. 드롱기 머신을 고르는 사람은 단순히 카페인을 원한다기보다, 집 안에 작은 카페 문화를 들이고 싶어 하는 경우가 많습니다.</p>
<p>대표적으로 데디카 같은 슬림 반자동 라인은 드롱기의 이미지를 잘 보여줍니다. 폭이 좁고 금속 질감이 강하며, 입문자가 보기에도 “커피머신다운” 모양을 갖고 있습니다. 이 점은 생각보다 중요합니다. 커피머신은 매일 보이는 위치에 놓이는 물건이기 때문에 디자인 만족도가 사용 빈도에 영향을 줍니다. 보기 싫은 머신은 결국 수납장 안으로 들어가고, 수납장 안으로 들어간 머신은 사용 빈도가 떨어집니다.</p>
<p>드롱기의 의미는 자동화와 수동성 사이의 균형에도 있습니다. 완전히 수동적인 상업용 머신처럼 부담스럽지는 않지만, 캡슐형처럼 모든 것을 시스템에 맡기지도 않습니다. 포터필터를 끼우고, 추출 버튼을 누르고, 우유 스팀을 다루는 과정이 남아 있습니다. 이 과정을 귀찮다고 느끼면 드롱기는 맞지 않습니다. 반대로 그 짧은 손동작이 아침 루틴의 즐거움이라면 드롱기의 만족도는 가격 이상의 의미를 갖습니다.</p>
<p>단점은 입문자의 기대와 실제 결과 사이의 간극입니다. 반자동 머신은 머신만 산다고 카페 맛이 바로 나오지 않습니다. 원두, 분쇄도, 탬핑, 추출 시간, 우유 온도까지 영향을 줍니다. 드롱기가 주는 브랜드 이미지는 매력적이지만, 그 이미지를 제대로 즐기려면 어느 정도 시행착오를 받아들여야 합니다. 그래서 드롱기는 “버튼 한 번으로 끝내고 싶은 사람”보다 “집에서 직접 만드는 장면을 좋아하는 사람”에게 더 맞습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">3. 브레빌: 집에서 하는 스페셜티 커피라는 욕망</h2>
<p>브레빌은 커피머신을 생활가전보다 도구에 가깝게 포지셔닝합니다. 특히 바리스타 라인업은 집에서도 그라인딩, 도징, 탬핑, 추출, 밀크 텍스처링을 하나의 과정으로 경험하게 만듭니다. 이 브랜드가 주는 이미지는 “편한 머신”보다 “내가 커피를 이해하고 있다”는 감각입니다. 그래서 브레빌은 커피를 취미로 삼는 사람에게 강하게 어필합니다.</p>
<p>바리스타 터치 임프레스 같은 아이템은 이 철학의 현대적 버전입니다. 전통적인 반자동의 부담을 줄이면서도 커피를 만드는 과정 자체는 남겨둡니다. 터치 화면, 보조 탬핑, 우유 텍스처 조절 같은 기능은 초보자가 실패를 줄이도록 돕습니다. 중요한 것은 자동화가 사용자를 대체하는 방식이 아니라, 사용자가 바리스타처럼 행동하도록 보조하는 방식이라는 점입니다.</p>
<p>브레빌의 브랜드 이미지는 주방의 분위기도 바꿉니다. 네스프레소가 정돈된 호텔 라운지라면, 브레빌은 작은 홈바에 가깝습니다. 머신 앞에서 원두를 고르고, 분쇄량을 조절하고, 추출을 바라보는 시간이 생깁니다. 이것은 효율만 놓고 보면 불필요한 시간일 수 있습니다. 하지만 취향 소비의 관점에서는 그 시간이 제품의 핵심 가치입니다. 커피 한 잔을 사는 것이 아니라, 커피를 만드는 사람이 되는 경험을 사는 것입니다.</p>
<p>단점도 바로 여기에 있습니다. 브레빌은 공간, 예산, 관리 의지가 필요합니다. 원두 찌꺼기, 스팀 노즐 청소, 물때 관리, 그라인더 조정이 따라옵니다. 바쁜 평일 아침에 버튼 한 번만 누르고 싶은 사람에게는 과한 선택이 될 수 있습니다. 하지만 주말마다 원두를 바꾸고, 라떼아트까지 시도해 보고 싶다면 브레빌은 단순한 가전이 아니라 취미 장비가 됩니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">4. 필립스 전자동: 가족용 커피 루틴의 현실적인 답</h2>
<p>필립스 전자동 라인은 커피를 취미보다 생활 편의로 봅니다. 원두를 넣고 버튼을 누르면 분쇄와 추출이 이어지고, 라떼고 같은 우유 시스템은 세척 부담을 줄이는 방향으로 설계되어 있습니다. 이 브랜드의 이미지는 화려한 홈카페보다 “가족이 매일 쓰는 실용적인 자동화”에 가깝습니다. 여러 사람이 각자 아메리카노, 라떼, 카푸치노를 마시는 집이라면 이 철학이 꽤 설득력 있게 다가옵니다.</p>
<p>전자동의 장점은 피로를 줄이는 데 있습니다. 커피를 좋아하지만 매번 원두를 갈고 포터필터를 닦는 과정이 부담스러운 사람에게 전자동은 현실적인 타협입니다. 맛의 자유도는 반자동보다 낮지만, 일관성과 편의성은 높습니다. 특히 아침 시간이 짧은 가족, 재택근무 중 여러 잔을 마시는 사람, 손님이 왔을 때 빠르게 여러 잔을 내야 하는 집에서 가치가 커집니다.</p>
<p>필립스가 주는 브랜드 이미지는 과시보다 신뢰에 가깝습니다. 주방에서 튀기보다 자연스럽게 놓이고, 커피머신을 처음 쓰는 사람도 메뉴 버튼을 통해 접근할 수 있습니다. 라떼고 구조처럼 세척을 쉽게 하려는 방향은 전자동 머신의 가장 큰 장벽을 정확히 건드립니다. 전자동 머신은 맛보다 관리에서 포기하는 경우가 많기 때문입니다.</p>
<p>다만 전자동도 완전히 손이 안 가는 제품은 아닙니다. 물통, 찌꺼기통, 추출 유닛, 석회질 관리가 필요합니다. 또한 원두를 자동으로 갈아주는 구조상 소음이 있고, 내부 청소를 게을리하면 맛과 위생이 동시에 떨어집니다. 그래서 필립스 전자동은 “관리하지 않아도 되는 머신”이 아니라 “관리를 단순화한 머신”으로 이해해야 합니다. 이 차이를 알고 사면 만족도가 높고, 모르고 사면 기대가 과해질 수 있습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">5. 방식별 선택 기준: 나는 어떤 커피 경험을 사고 싶은가</h2>
<p>커피머신 선택의 핵심 질문은 “어떤 제품이 제일 좋은가”가 아닙니다. “나는 어떤 커피 경험을 반복하고 싶은가”입니다. 네스프레소는 결과의 반복성을 삽니다. 드롱기는 홈카페의 장면과 손맛을 삽니다. 브레빌은 취미로서의 커피 제작 경험을 삽니다. 필립스 전자동은 가족과 일상 속에서 커피를 쉽게 반복하는 자동화를 삽니다. 이 차이를 이해하면 가격 비교가 훨씬 선명해집니다.</p>
<p>혼자 살고 아침이 바쁘다면 캡슐형이 가장 실패 확률이 낮습니다. 커피를 취미로 키우고 싶고 주방 위에 머신을 계속 올려둘 생각이라면 반자동이 맞습니다. 우유 음료를 자주 만들고 손님에게 커피를 내는 장면을 즐긴다면 드롱기나 브레빌의 만족도가 큽니다. 가족이 여러 명이고 버튼 한 번으로 각자 커피를 마시는 흐름을 원한다면 필립스 전자동이 합리적입니다.</p>
<p>예산도 방식에 따라 다르게 봐야 합니다. 캡슐형은 머신 가격보다 캡슐 단가가 누적됩니다. 반자동은 머신 외에 그라인더, 저울, 탬퍼, 청소 도구가 추가될 수 있습니다. 전자동은 초기 가격과 소모품, AS 비용을 함께 봐야 합니다. 따라서 “오늘 가장 싼 제품”보다 “1년 동안 내가 실제로 감당할 총비용”을 계산해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">6. 구매 전에 확인해야 할 체크리스트</h2>
<ul style="padding-left:20px;"><li>캡슐형: 오리지널/버츄오 호환성, 캡슐 단가, 캡슐 수급, 재활용 방식</li><li>반자동: 그라인더 필요 여부, 포터필터 규격, 스팀 성능, 청소 난이도, 설치 공간</li><li>전자동: 추출 유닛 분리 여부, 석회질 관리, 물통/찌꺼기통 용량, 소음, AS 조건</li><li>공통: 주방 상판 깊이, 전원 위치, 물 보충 동선, 가족 사용 빈도, 소모품 비용</li></ul>
<p>특히 설치 공간은 과소평가하기 쉽습니다. 커피머신은 본체 크기만 보면 안 됩니다. 물통을 빼는 방향, 캡슐이나 원두를 넣는 위쪽 공간, 스팀 노즐을 쓰는 옆 공간, 컵을 놓고 빼는 앞 공간이 필요합니다. 스펙상 폭이 맞아도 실제 주방에서는 불편할 수 있습니다.</p>
<p>또 하나는 세척입니다. 매일 쓰는 커피머신은 맛보다 세척 때문에 포기하는 경우가 많습니다. 캡슐형은 캡슐 처리와 물때, 반자동은 포터필터와 스팀 노즐, 전자동은 추출 유닛과 찌꺼기통이 핵심입니다. 세척 동선이 나와 맞지 않으면 아무리 좋은 머신도 사용 빈도가 떨어집니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">7. 브랜드 이미지는 실제 만족도에 영향을 줍니다</h2>
<p>가전은 기능으로만 쓰는 물건처럼 보이지만, 커피머신은 예외에 가깝습니다. 커피머신은 대부분 주방 상판 위에 계속 놓입니다. 매일 눈에 보이고, 손님이 왔을 때도 자연스럽게 시선에 들어옵니다. 그래서 브랜드 이미지와 디자인 언어가 사용 빈도에 영향을 줍니다. 성능이 좋아도 보기 싫으면 수납장에 들어가고, 수납장에 들어간 커피머신은 결국 쓰지 않게 됩니다.</p>
<p>네스프레소는 정돈된 호텔식 이미지를 만듭니다. 드롱기는 이탈리아 주방과 홈카페의 감성을 만듭니다. 브레빌은 커피를 취미로 다루는 사람의 작업대 이미지를 만듭니다. 필립스 전자동은 가족 모두가 버튼 하나로 커피를 마시는 생활가전 이미지를 만듭니다. 이 이미지는 허세가 아니라 사용자의 생활 방식과 연결됩니다. 내가 원하는 장면과 브랜드 이미지가 맞아야 오래 씁니다.</p>
<p>예를 들어 미니멀한 주방을 선호하고 물건이 많아 보이는 것을 싫어한다면 브레빌처럼 존재감이 큰 장비는 부담스러울 수 있습니다. 반대로 주방 한쪽을 홈카페처럼 꾸미고 싶다면 작은 캡슐 머신은 아쉬울 수 있습니다. 가족이 함께 쓰는 공간이라면 개성 강한 반자동보다 누구나 쉽게 누를 수 있는 전자동이 더 현실적입니다. 디자인 취향은 단순한 장식이 아니라 사용 습관의 일부입니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">8. 유명 브랜드를 고를 때 피해야 할 착각</h2>
<p>첫 번째 착각은 “유명 브랜드면 내 입맛에도 맞을 것”이라는 생각입니다. 네스프레소가 아무리 안정적이어도 캡슐 맛이 내 취향과 다르면 만족도는 낮습니다. 드롱기와 브레빌이 아무리 홈카페 이미지를 잘 만들어도 원두 관리와 청소가 귀찮으면 사용 빈도는 떨어집니다. 필립스 전자동이 편해도 내부 세척을 미루면 맛이 흐려지고 위생 문제가 생깁니다.</p>
<p>두 번째 착각은 “비쌀수록 무조건 맛있을 것”이라는 생각입니다. 커피 맛은 머신 가격만으로 정해지지 않습니다. 원두 상태, 물, 분쇄도, 추출 온도, 관리 상태가 함께 작동합니다. 특히 반자동과 전자동은 원두 선택의 영향을 크게 받습니다. 비싼 머신을 사고 저가 원두를 오래 방치하면 기대한 맛이 나오기 어렵습니다. 반대로 적당한 머신이라도 신선한 원두와 좋은 관리 습관이 있으면 만족도가 높아집니다.</p>
<p>세 번째 착각은 “자동이면 관리가 필요 없을 것”이라는 생각입니다. 자동화는 과정을 줄여줄 뿐 관리를 없애지 않습니다. 전자동 머신은 내부에 원두 가루와 물이 지나갑니다. 캡슐 머신도 물때와 캡슐 트레이 관리가 필요합니다. 반자동은 스팀 노즐과 포터필터 청소가 습관이 되어야 합니다. 구매 전에는 내가 이 관리를 감당할 수 있는지 솔직하게 봐야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">9. 사용 장면별 추천 방향</h2>
<p>출근 전 3분 안에 커피를 마셔야 한다면 캡슐형이 가장 현실적입니다. 버튼 수가 적고 실패 가능성이 낮으며, 캡슐만 준비되어 있으면 매번 비슷한 결과가 나옵니다. 커피를 마시는 시간보다 준비 시간을 줄이는 것이 중요하다면 네스프레소 계열이 맞습니다.</p>
<p>주말에 원두를 고르고 라떼를 만들어 보는 시간이 즐겁다면 반자동이 더 낫습니다. 이 경우에는 드롱기나 브레빌처럼 손이 가는 머신이 오히려 만족을 줍니다. 다만 입문 단계에서는 너무 큰 장비보다 세척이 쉽고 사용법이 명확한 모델을 고르는 편이 안전합니다. 장비가 어려우면 취미가 되기 전에 부담이 됩니다.</p>
<p>가족이 함께 쓰고 하루에 여러 잔이 필요하다면 전자동이 유리합니다. 각자 컵을 놓고 버튼을 누르면 되기 때문에 사용자가 많을수록 편의성이 커집니다. 특히 우유 음료를 자주 마신다면 우유 시스템의 세척 구조가 중요합니다. 라떼 기능이 좋아 보여도 세척이 번거로우면 결국 아메리카노만 마시게 될 수 있습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">10. 결국 커피머신은 시간을 어디에 쓸지 정하는 물건입니다</h2>
<p>커피머신을 사는 이유는 커피값을 아끼기 위해서만은 아닙니다. 사실 캡슐 단가, 원두값, 소모품, 세척 시간까지 계산하면 단순 절약만으로는 설명되지 않는 경우가 많습니다. 더 중요한 것은 내가 커피를 마시는 시간을 어떤 방식으로 만들고 싶은가입니다. 네스프레소는 시간을 줄여줍니다. 드롱기와 브레빌은 시간을 커피 만드는 경험으로 바꿉니다. 필립스 전자동은 가족의 반복 사용 시간을 단순하게 만듭니다.</p>
<p>이 차이를 모르면 구매 후 불만이 생깁니다. 편하려고 산 사람이 반자동을 사면 관리가 귀찮고, 취미를 기대한 사람이 캡슐형을 사면 금방 심심해집니다. 가족용으로 산 사람이 작은 캡슐 머신을 고르면 캡슐 비용과 물 보충이 번거롭고, 혼자 쓰는 사람이 대형 전자동을 사면 청소 부담이 과하게 느껴질 수 있습니다. 결국 좋은 선택은 유명 브랜드 순위가 아니라 생활 장면과 브랜드 철학의 일치에서 나옵니다.</p>
<p>따라서 구매 전에는 세 문장을 적어보는 것이 좋습니다. 첫째, 나는 하루에 몇 잔을 마시는가. 둘째, 커피를 만드는 과정 자체가 즐거운가. 셋째, 세척을 매일 할 자신이 있는가. 이 답이 명확하면 브랜드와 방식은 자연스럽게 좁혀집니다. 답이 모호하다면 가장 비싼 제품보다 가장 단순한 제품부터 시작하는 편이 실패 확률이 낮습니다.</p>
<p>마지막으로 기억할 점은 커피머신이 취향의 시작점이라는 사실입니다. 처음부터 완벽한 답을 찾으려고 하면 선택이 어려워집니다. 대신 지금 내 생활에서 가장 자주 반복될 장면을 기준으로 고르세요. 출근 전 한 잔, 주말 홈카페, 가족의 아침 루틴, 손님 접대 중 무엇이 핵심인지 정하면 브랜드의 의미가 선명해집니다. 그때 제품 비교는 훨씬 쉬워집니다.</p>
<p>결국 커피머신의 가치는 매일 다시 켜고 싶어지는가로 판단해야 합니다.</p>
<p>한 번 더 현실적으로 말하면, 커피머신은 구매 당일보다 3개월 뒤의 사용 빈도가 더 중요합니다. 처음 며칠은 어떤 제품도 새롭고 즐겁습니다. 하지만 물 보충이 불편하고, 청소가 번거롭고, 캡슐이나 원두를 사는 루틴이 맞지 않으면 금방 멈춥니다. 그래서 브랜드의 매력보다 나의 반복 행동을 먼저 봐야 합니다. 매일 반복할 수 있는 방식이 결국 가장 좋은 방식입니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">브랜드별 구매 후보 확인</h2>
${table}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">구매 링크는 본문 해석을 확인하는 보조 수단입니다</h2>
${featuredProducts}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">마지막 정리</h2>
<p>커피머신은 집 안에서 반복되는 장면을 바꾸는 물건입니다. 그래서 스펙 비교만으로는 부족합니다. 네스프레소를 고르면 안정적이고 정돈된 캡슐 루틴을 들이는 것이고, 드롱기를 고르면 이탈리안 홈카페 이미지를 주방에 들이는 것이며, 브레빌을 고르면 취미로서의 커피 제작 경험을 선택하는 것입니다. 필립스 전자동은 여러 사람이 매일 마시는 커피를 자동화하는 현실적 선택입니다.</p>
<p>가장 좋은 커피머신은 유명한 제품이 아니라, 내가 매일 실제로 쓰게 되는 제품입니다. 아침 5분이 중요한 사람에게는 캡슐형이 프리미엄이고, 주말의 20분이 즐거운 사람에게는 반자동이 프리미엄입니다. 가족 모두가 각자 커피를 마신다면 전자동의 편의성이 프리미엄입니다. 이 기준을 먼저 정하면 불필요한 과소비와 방치되는 가전을 줄일 수 있습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">참고한 브랜드 공식 자료</h2>
<ul style="padding-left:20px;">${sourceLinks}</ul>
<p style="font-size:13px;color:#666;margin-top:28px;">${DISCLOSURE}</p>
${itemListJsonLd}
</article>`

  return { title, slug, content }
}

function buildDishwasherDeepdiveArticle(candidate, products) {
  const title = sanitizeTitleText(candidate.blogTitle || '식기세척기 고르는 법 밀레, LG, 삼성, SK매직 브랜드 이미지와 세척 철학')
  const slug = 'dishwasher-brand-philosophy-washing-drying-installation'
  const table = enhanceFirstComparisonTable(buildComparisonTable(products), { force: true }).html
  const itemListJsonLd = renderItemListJsonLd(products, title)
  const sourceLinks = DISHWASHER_BRAND_SOURCES.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a></li>`).join('')
  const featuredProducts = products.slice(0, 5).map((product, index) => {
    const role = productRole(product, index, 'deepdive')
    return `<section style="border:1px solid #e5e7eb;border-radius:18px;padding:18px;margin:18px 0;background:#fff;">
<h3 style="font-size:20px;line-height:1.35;margin:0 0 10px;color:#111;">${index + 1}. ${escapeHtml(product.name)}</h3>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" style="display:block;width:180px;max-width:100%;height:180px;object-fit:contain;border:1px solid #edf0f5;border-radius:16px;padding:10px;background:#fff;margin:0 auto 12px;" /></a>
<p style="margin:0 0 10px;"><strong>구매 확인 역할:</strong> ${escapeHtml(role)}입니다. 본문은 브랜드 철학과 설치 판단을 중심으로 읽고, 이 영역은 실제 가격, 설치 조건, 구성품, 배송 가능 여부를 확인하는 보조 링크로만 사용하세요. 현재 확인 가격은 <strong>${formatPrice(product.price)}</strong>입니다.</p>
${renderProductFactPanel(product)}
<ul style="margin:0 0 12px;padding-left:20px;">
<li>핵심 판단: 설치 방식, 용량, 건조 방식, 내부 바스켓 구조, AS 접근성을 함께 봐야 합니다.</li>
<li>주의할 점: 온라인 상품 정보만으로는 현장 설치 가능 여부, 급수·배수 조건, 실제 소음, 세척 코스별 시간은 확정할 수 없습니다.</li>
<li>추천 대상: ${escapeHtml(role)}을 우선순위로 보는 사용자</li>
</ul>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:999px;background:#ff5a00;color:#fff;text-decoration:none;font-size:15px;font-weight:900;">가격·설치 조건 확인</a>
</section>`
  }).join('\n')

  const content = `<article class="cp9-article" style="max-width:760px;margin:0 auto;color:#222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.78;font-size:16px;">
<p style="font-size:17px;color:#444;margin:0 0 18px;">식기세척기 고르는 법은 단순히 6인용, 12인용, 14인용 중 하나를 고르는 문제가 아닙니다. 실제 만족도는 세척력보다 더 넓은 곳에서 갈립니다. 내가 설거지를 어떤 시간대에 하는지, 냄비와 프라이팬을 얼마나 자주 넣는지, 주방 하부장 구조가 빌트인을 받아줄 수 있는지, 건조 후 바로 식기를 꺼낼지 하루 뒤에 열어볼지까지 연결됩니다.</p>
<p style="margin:0 0 24px;">그래서 이 글은 상품명과 가격을 먼저 나열하지 않습니다. 밀레, LG, 삼성, SK매직 같은 대표 브랜드가 식기세척기를 어떤 생활 도구로 해석하는지 보고, 그 철학이 실제 주방에서 어떤 의미를 갖는지 설명합니다. 구매 링크는 글 하단의 확인용 보조 영역으로만 두고, 본문은 브랜드 이미지, 세척 방식, 건조 경험, 설치 리스크, 관리 루틴을 이해하는 데 집중합니다.</p>
<div style="border:1px solid #e5e7eb;background:#f8fafc;border-radius:14px;padding:18px 20px;margin:24px 0;"><strong style="display:block;margin-bottom:8px;color:#111;">결론부터 말하면</strong><ul style="margin:0;padding-left:20px;"><li>내구성과 조용한 프리미엄 이미지를 중시하면 밀레를 먼저 봅니다.</li><li>국내 주방 동선, AS, 가전 통합성을 중시하면 LG가 현실적인 기준점입니다.</li><li>인테리어 일체감과 패널·색상 선택을 중시하면 삼성 비스포크 계열이 강합니다.</li><li>초기 비용과 관리 부담을 낮추고 싶으면 SK매직의 렌탈·관리형 접근이 맞을 수 있습니다.</li><li>브랜드보다 먼저 확인할 것은 설치 가능 여부, 급수·배수, 문 열림 공간, 건조 방식입니다.</li></ul></div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">1. 식기세척기는 설거지 기계가 아니라 주방 루틴을 바꾸는 기계입니다</h2>
<p>식기세척기를 처음 고를 때 많은 사람이 세척력만 봅니다. 물론 세척력은 중요합니다. 하지만 요즘 주요 브랜드의 중상급 식기세척기는 기본적인 밥그릇, 접시, 컵 세척에서는 큰 실패가 적습니다. 오히려 구매 후 불만은 다른 곳에서 나옵니다. 그릇을 어떻게 넣어야 하는지 모르겠다, 냄비가 안 들어간다, 건조가 기대만큼 뽀송하지 않다, 설치 기사 방문 후 추가 공사가 필요했다, 소음 때문에 밤에 돌리기 부담스럽다 같은 문제입니다.</p>
<p>이 불만은 스펙표 하나로 해결되지 않습니다. 식기세척기는 주방의 물길, 전기, 수납, 동선을 동시에 건드립니다. 제품 크기가 맞아도 문을 열었을 때 맞은편 수납장과 부딪히면 불편합니다. 12인용이라고 해도 가족이 쓰는 접시의 지름과 냄비 손잡이 구조에 따라 체감 용량은 달라집니다. 자동문 열림 건조가 있어도 주방 습도와 사용 시간대에 따라 결과가 다르게 느껴질 수 있습니다.</p>
<p>그래서 좋은 선택은 브랜드 순위가 아니라 생활 장면에서 시작합니다. 저녁 식사 후 바로 돌리고 자기 전에 끝나길 원하는 집, 아침에 그릇을 한 번에 넣는 집, 아이 식기와 젖병을 자주 씻는 집, 요리를 자주 해서 냄비와 프라이팬이 많은 집은 기준이 다릅니다. 식기세척기는 설거지를 없애주는 마법이 아니라, 설거지의 시간을 다른 방식으로 옮기는 도구입니다. 이 관점을 잡으면 브랜드별 철학이 훨씬 선명해집니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">2. 밀레: 오래 쓰는 프리미엄 도구라는 이미지</h2>
<p>밀레 식기세척기가 갖는 이미지는 강합니다. 독일 프리미엄, 내구성, 조용함, 오래 쓰는 가전이라는 단어가 먼저 떠오릅니다. 밀레를 고르는 사람은 단순히 오늘 저렴한 식기세척기를 찾는다기보다, 주방에 오래 둘 핵심 설비를 고른다는 감각에 가깝습니다. 자동차로 치면 옵션 하나보다 기본기와 완성도를 중시하는 선택입니다.</p>
<p>밀레의 브랜드 철학은 과시적인 기능보다 안정적인 사용 경험에 있습니다. 식기를 넣고, 문을 닫고, 코스를 돌렸을 때 결과가 예측 가능해야 합니다. 바스켓이 흔들리지 않고, 문과 힌지가 단단하게 느껴지며, 세척 후에도 브랜드가 주는 신뢰가 남아야 합니다. 이런 감각은 스펙표의 숫자만으로 설명하기 어렵지만, 프리미엄 가전에서 실제 만족도를 크게 좌우합니다.</p>
<p>대표 아이템은 대개 12인용 이상 대형 빌트인 또는 프리스탠딩 구조에서 의미가 큽니다. 밀레를 고려한다면 작은 원룸형 주방보다 가족 주방, 신축 또는 리모델링 주방, 오래 사용할 계획이 있는 집이 더 어울립니다. 제품 가격이 높은 편이기 때문에 단기 비용 절감 목적과는 맞지 않을 수 있습니다. 대신 5년, 10년 단위로 주방의 기본 설비처럼 쓰겠다는 기대가 있으면 선택 이유가 생깁니다.</p>
<p>한계도 분명합니다. 가격이 높고, 설치 조건과 AS 접근성을 반드시 확인해야 합니다. 해외 프리미엄 브랜드는 브랜드 이미지가 강한 만큼 실제 내 주방에서 서비스가 빠른지, 소모품이나 설치 부품 수급이 편한지 따져봐야 합니다. 밀레는 “가장 유명하니까 산다”보다 “오래 쓸 프리미엄 설비를 들인다”는 마음일 때 만족도가 높습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">3. LG: 한국 주방에 맞춘 현실적인 프리미엄</h2>
<p>LG 식기세척기는 국내 사용자에게 현실적인 기준점이 됩니다. 이유는 단순합니다. 한국 주방 구조, 국내 AS, 다른 LG 가전과의 통합 이미지, 설치 상담 접근성이 모두 구매 불안을 낮춥니다. 식기세척기를 처음 들이는 사람은 세척력보다 “우리 집에 설치될까”를 더 걱정하는 경우가 많습니다. 이때 국내 대형 브랜드의 안정감은 큰 장점입니다.</p>
<p>LG의 브랜드 이미지는 생활 밀착형 프리미엄에 가깝습니다. 오브제 라인처럼 주방 인테리어와 맞추려는 시도도 있지만, 핵심은 사용자가 매일 불편 없이 쓰게 만드는 쪽입니다. 세척 코스, 건조 기능, 스마트 연동, 내부 바스켓의 조절성은 모두 “복잡한 설거지를 어떻게 덜 피곤하게 만들 것인가”라는 질문으로 이어집니다.</p>
<p>LG를 볼 때 중요한 것은 용량과 설치 방식입니다. 12인용, 14인용 같은 대용량은 가족 주방에서 의미가 큽니다. 그러나 숫자가 크다고 무조건 좋은 것은 아닙니다. 하부장 철거가 필요한지, 싱크대 높이와 걸레받이 구조가 맞는지, 문을 열었을 때 이동 동선이 막히지 않는지 확인해야 합니다. LG가 현실적인 선택이라는 말은 아무 집에나 대충 맞는다는 뜻이 아니라, 설치와 사후 관리의 불확실성을 비교적 줄일 수 있다는 뜻입니다.</p>
<p>단점은 브랜드 이미지가 아주 뚜렷한 취향을 주기보다 안정적인 대중성을 준다는 점입니다. 밀레처럼 프리미엄 도구의 상징성을 기대하거나, 삼성처럼 패널과 색상으로 주방 인테리어를 강하게 맞추려는 사람에게는 덜 특별하게 느껴질 수 있습니다. 하지만 매일 쓰는 가전에서는 특별함보다 실패 확률이 낮은 것이 더 중요할 때가 많습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">4. 삼성: 주방 인테리어와 가전 경험을 맞추는 선택</h2>
<p>삼성 식기세척기의 강점은 비스포크 이미지와 연결됩니다. 식기세척기를 독립된 기계가 아니라 주방 가전 세트의 일부로 보는 사람에게 매력적입니다. 냉장고, 오븐, 인덕션, 식기세척기의 색상과 질감이 맞으면 주방은 훨씬 정돈되어 보입니다. 식기세척기는 문이 큰 가전이기 때문에 전면 패널의 인상이 생각보다 강합니다.</p>
<p>삼성의 브랜드 철학은 사용자 경험을 시각적으로 정리하는 쪽에 가깝습니다. 기능만 충분한 가전이 아니라, 집의 분위기와 연결되는 가전이라는 메시지를 줍니다. 이 관점은 신혼집, 리모델링 주방, 오픈형 거실 주방에서 특히 중요합니다. 식기세척기가 거실에서 보이는 구조라면 색상과 패널 일체감은 단순 장식이 아니라 만족도의 일부가 됩니다.</p>
<p>제품을 고를 때는 디자인만 보고 결정하면 안 됩니다. 세척 코스, 건조 방식, 내부 높이 조절, 큰 냄비 수납성, 소음, 자동문 열림 여부를 함께 확인해야 합니다. 삼성의 장점인 디자인 일체감이 실제 사용 불편을 덮어주지는 않습니다. 특히 깊은 그릇, 냄비, 도마를 자주 넣는 집이라면 내부 바스켓의 자유도가 중요합니다.</p>
<p>삼성은 “주방을 하나의 시스템처럼 보이게 만들고 싶은 사람”에게 잘 맞습니다. 이미 삼성 가전을 많이 쓰고 있거나, 비스포크 패널 색상에 맞춰 주방을 계획하고 있다면 선택 이유가 분명합니다. 반대로 설치 후 외관보다 세척 기본기와 긴 수명에만 관심이 있다면 다른 브랜드와 냉정하게 비교해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">5. SK매직: 구매보다 사용 관리를 쉽게 만드는 접근</h2>
<p>SK매직은 식기세척기를 구매형 가전이 아니라 관리형 생활 서비스에 가깝게 느끼게 합니다. 정수기, 렌탈, 방문 관리 경험과 연결된 브랜드 이미지가 있기 때문입니다. 식기세척기를 사고 싶지만 초기 비용이 부담스럽거나, 관리와 AS가 걱정되는 사람에게 SK매직은 다른 의미의 선택지가 됩니다.</p>
<p>이 브랜드의 장점은 심리적 진입 장벽을 낮추는 데 있습니다. 식기세척기를 처음 쓰는 사람은 “내가 잘 관리할 수 있을까”, “고장 나면 어떻게 하지”, “필터나 세정제는 뭘 써야 하지” 같은 걱정을 합니다. 렌탈이나 관리형 상품은 이런 걱정을 비용 구조 안에 포함시켜 생각하게 만듭니다. 물론 총비용은 별도로 계산해야 하지만, 매달 일정 비용으로 관리 부담을 나누는 방식이 맞는 사용자도 있습니다.</p>
<p>SK매직을 볼 때는 제품 스펙과 계약 조건을 함께 봐야 합니다. 월 렌탈료, 의무 사용 기간, 소유권 이전 조건, 관리 방문 범위, 해지 비용, 소모품 포함 여부가 실제 가격입니다. 단순히 월 비용만 낮다고 좋은 것이 아닙니다. 총 납부액과 구매형 제품 가격을 비교해야 합니다.</p>
<p>사용자에게 맞는 경우는 명확합니다. 신혼이나 전세처럼 몇 년 단위로 주거가 바뀔 수 있고, 큰돈을 한 번에 쓰기보다 월 비용으로 나누고 싶으며, 관리 상담을 받을 수 있다는 안정감을 선호한다면 SK매직은 현실적인 후보가 됩니다. 반대로 장기 보유와 최고급 마감감을 기대한다면 밀레나 국내 프리미엄 라인과 비교해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">6. 용량은 인원수보다 식기 패턴으로 봐야 합니다</h2>
<p>식기세척기에서 가장 흔한 질문은 몇 인용을 사야 하느냐입니다. 하지만 인원수만으로는 부족합니다. 2인 가구라도 요리를 자주 하고 냄비와 프라이팬을 많이 쓰면 소형 제품이 금방 답답합니다. 4인 가구라도 외식을 자주 하고 컵과 접시 위주라면 대형 제품이 매일 꽉 차지 않을 수 있습니다. 중요한 것은 식사 횟수, 조리 빈도, 냄비 사용량, 그릇 크기입니다.</p>
<p>6인용 이하 제품은 설치 부담이 낮고 작은 주방에 넣기 쉽습니다. 하지만 냄비와 큰 접시를 넣기 어렵고, 하루 식기를 여러 번 나눠 돌릴 수 있습니다. 12인용 이상은 한 번에 많은 식기를 처리할 수 있지만, 설치 공간과 초기 비용이 커집니다. 특히 하부장 철거가 필요한 경우에는 제품 가격 외 공사 비용과 복구 가능성까지 생각해야 합니다.</p>
<p>한국 주방에서는 밥그릇, 국그릇, 반찬 접시, 냄비 뚜껑이 동시에 나옵니다. 서구형 접시 중심 설명만 보고 고르면 실제 체감 용량이 다를 수 있습니다. 구매 전에는 내가 자주 쓰는 그릇의 지름과 높이를 떠올리고, 내부 바스켓 사진을 자세히 봐야 합니다. 접시를 세우는 간격, 컵 선반, 수저 바구니 구조가 실제 사용성을 좌우합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">7. 건조 방식은 기대치를 정확히 잡아야 합니다</h2>
<p>식기세척기 만족도에서 건조는 세척만큼 중요합니다. 세척이 잘 되어도 플라스틱 컵에 물방울이 남거나, 오목한 그릇 바닥에 물이 고이면 사용자는 덜 만족합니다. 하지만 모든 식기를 완전히 보송하게 말리는 것은 생각보다 어렵습니다. 소재, 그릇 형태, 적재 방식, 코스, 실내 습도가 모두 영향을 줍니다.</p>
<p>자동문 열림 방식은 내부 습기를 밖으로 빼는 데 도움이 됩니다. 열풍 건조나 응축 건조, 자연 건조 보조 방식은 브랜드와 모델마다 다릅니다. 중요한 것은 광고 문구보다 내가 쓰는 식기의 소재입니다. 플라스틱, 실리콘, 오목한 컵은 물방울이 남기 쉽습니다. 유리와 도자기는 상대적으로 건조감이 좋습니다. 즉 건조 불만은 제품만의 문제가 아니라 식기 구성과도 연결됩니다.</p>
<p>구매 전에는 건조 기능 이름보다 실제 사용 후기를 볼 때 어떤 식기에 물이 남는지 확인하는 편이 좋습니다. 작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 배송 조건을 기본 기준으로 삼고, 확인되지 않은 리뷰 수와 평점은 본문에서 단정하지 않습니다. 건조 만족도는 상세 페이지와 최신 후기를 함께 보며 판단해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">8. 설치 조건은 구매 전 가장 먼저 확인해야 합니다</h2>
<p>식기세척기는 온라인으로 결제하기 쉬워 보여도 실제로는 설치형 가전에 가깝습니다. 특히 빌트인이나 12인용 이상 제품은 싱크대 하부장 구조, 급수·배수 위치, 전원 콘센트, 걸레받이 높이, 문 열림 공간을 확인해야 합니다. 제품이 좋아도 설치가 어렵거나 추가 공사가 필요하면 구매 경험이 나빠집니다.</p>
<p>전세나 월세라면 원상복구 가능성도 중요합니다. 하부장을 철거해야 하는지, 나중에 복구할 수 있는지, 집주인 동의가 필요한지 확인해야 합니다. 자가라도 리모델링 계획이 있다면 지금 급하게 설치하는 것보다 주방 공사와 함께 계획하는 편이 나을 수 있습니다. 식기세척기는 위치가 한 번 정해지면 옮기기 어렵습니다.</p>
<p>설치 상담을 받을 때는 제품 폭만 묻지 말고, 급수와 배수 거리, 배수 호스 경로, 전원 위치, 문을 열었을 때 통로 폭, 싱크볼과의 거리까지 확인하세요. 식기세척기는 설거지 후 바로 넣는 동선이 중요하기 때문에 싱크대와 너무 멀면 사용 빈도가 떨어집니다. 좋은 제품도 동선이 나쁘면 결국 손설거지로 돌아갑니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">9. 세제, 린스, 소금, 필터 같은 운영 비용</h2>
<p>식기세척기 가격에는 본체만 포함됩니다. 실제 운영에는 세제, 린스, 내부 세척제, 필터 관리, 물때 관리가 따라옵니다. 해외 브랜드 일부는 연수 장치나 소금 사용 조건을 강조하기도 하고, 국내 모델은 전용 세제나 관리 코스를 안내합니다. 이런 소모품은 한 달 비용으로 보면 작아 보이지만, 몇 년 단위로 보면 총비용에 들어갑니다.</p>
<p>세제는 타블렛, 가루, 액상 형태가 있고 각각 장단점이 있습니다. 타블렛은 편하지만 1회 비용이 높을 수 있습니다. 가루 세제는 양 조절이 가능하지만 보관과 계량이 번거롭습니다. 린스는 건조와 물자국에 영향을 줄 수 있지만 모든 사용자가 반드시 같은 만족을 느끼는 것은 아닙니다. 물 경도와 식기 소재에 따라 체감이 달라집니다.</p>
<p>필터 청소도 무시하면 안 됩니다. 식기세척기는 음식물 찌꺼기를 완전히 사라지게 하는 기계가 아닙니다. 큰 찌꺼기는 제거하고 넣어야 하며, 필터는 주기적으로 비워야 합니다. 이 과정을 싫어하면 어떤 브랜드를 사도 불만이 생깁니다. 구매 전에는 “내가 필터를 정기적으로 청소할 수 있는가”를 솔직하게 봐야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">10. 브랜드별로 사용자가 얻는 의미</h2>
<p>밀레를 고르는 의미는 주방에 오래 쓰는 프리미엄 설비를 들인다는 감각입니다. 가격보다 내구성, 조용함, 완성도, 브랜드 신뢰를 중시하는 선택입니다. LG를 고르는 의미는 한국 주방에서 설치와 사후 관리의 불안을 줄이고, 매일 쓰는 가전으로 안정적인 경험을 얻는 것입니다. 삼성은 식기세척기를 주방 인테리어와 가전 세트의 일부로 만들고 싶은 사람에게 의미가 큽니다. SK매직은 큰 초기 비용과 관리 부담을 낮추고, 렌탈이나 관리형 서비스의 안정감을 얻고 싶은 사람에게 맞습니다.</p>
<p>이 네 가지는 우열이라기보다 생활 방식의 차이입니다. 같은 12인용 식기세척기라도 어떤 사람에게는 조용한 밤 세척이 중요하고, 어떤 사람에게는 패널 색상이 중요하며, 어떤 사람에게는 설치 상담과 AS가 중요합니다. 브랜드 철학을 이해하면 광고 문구에 덜 흔들립니다. 내가 얻고 싶은 의미가 무엇인지 먼저 정하면 제품 후보는 자연스럽게 좁아집니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">브랜드별 구매 후보 확인</h2>
${table}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">구매 링크는 설치 가능성과 가격 확인용입니다</h2>
${featuredProducts}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">마지막 정리</h2>
<p>식기세척기는 설거지를 없애는 물건이라기보다 설거지의 방식을 바꾸는 물건입니다. 그래서 좋은 선택은 세척력 숫자만으로 나오지 않습니다. 밀레는 오래 쓰는 프리미엄 설비의 이미지, LG는 국내 주방에 맞춘 현실적인 안정감, 삼성은 인테리어와 가전 경험의 통일감, SK매직은 관리와 비용 부담을 나누는 접근을 제공합니다.</p>
<p>구매 전에는 브랜드보다 먼저 설치 가능 여부를 확인하세요. 그다음 가족의 식사 패턴, 냄비 사용량, 건조 기대치, 세제와 필터 관리 의지를 따져보면 됩니다. 이 기준이 분명하면 비싼 제품을 사놓고 손설거지로 돌아가는 일을 줄일 수 있습니다.</p>
<p>마지막으로, 식기세척기는 매일 돌릴수록 가치가 커집니다. 가끔 쓰는 장식품이 아니라 저녁 루틴을 바꾸는 도구로 봐야 합니다. 내 주방에서 문을 열고 그릇을 넣는 동선이 자연스러운지, 세척 후 꺼내는 시간이 편한지, 필터 청소를 감당할 수 있는지까지 상상해 보세요. 그 장면이 자연스럽다면 식기세척기는 주방에서 가장 자주 고마워할 가전이 될 수 있습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">참고한 브랜드 공식 자료</h2>
<ul style="padding-left:20px;">${sourceLinks}</ul>
<p style="font-size:13px;color:#666;margin-top:28px;">${DISCLOSURE}</p>
${itemListJsonLd}
</article>`

  return { title, slug, content, auxiliaryImages: [] }
}

function buildCleanerDeepdiveArticle(candidate, products) {
  const title = sanitizeTitleText(candidate.blogTitle || `${candidate.keyword} 물청소, 흡입력, 관리 기준으로 고르는 법`)
  const slug = `wet-dry-cleaner-guide-${formatKstDate()}-${Date.now()}`
  const table = enhanceFirstComparisonTable(buildComparisonTable(products), { force: true }).html
  const itemListJsonLd = renderItemListJsonLd(products, title)
  const featuredProducts = products.slice(0, 5).map((product, index) => {
    const role = productRole(product, index, 'deepdive')
    return `<section style="border:1px solid #e5e7eb;border-radius:18px;padding:18px;margin:18px 0;background:#fff;">
<h3 style="font-size:20px;line-height:1.35;margin:0 0 10px;color:#111;">${index + 1}. ${escapeHtml(product.name)}</h3>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" style="display:block;width:180px;max-width:100%;height:180px;object-fit:contain;border:1px solid #edf0f5;border-radius:16px;padding:10px;background:#fff;margin:0 auto 12px;" /></a>
<p style="margin:0 0 10px;"><strong>구매 확인 역할:</strong> ${escapeHtml(role)}입니다. 본문은 건식 흡입, 습식 처리, 오염수 관리, 사용 공간을 이해하는 데 집중하고, 이 영역은 실제 가격과 구성품을 확인하는 보조 링크로만 사용하세요. 현재 확인 가격은 <strong>${formatPrice(product.price)}</strong>입니다.</p>
${renderProductFactPanel(product)}
<ul style="margin:0 0 12px;padding-left:20px;">
<li>핵심 판단: 흡입력 숫자보다 물통 분리, 오염수 배출, 브러시 세척, 소모품 조건을 함께 봐야 합니다.</li>
<li>주의할 점: 온라인 상품 정보만으로는 실제 소음, 장판 물자국, 카펫 호환성, 장기 배터리 성능을 확정할 수 없습니다.</li>
<li>추천 대상: ${escapeHtml(role)}을 우선순위로 보는 사용자</li>
</ul>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:999px;background:#ff5a00;color:#fff;text-decoration:none;font-size:15px;font-weight:900;">가격·구성 확인</a>
</section>`
  }).join('\n')

  const content = `<article class="cp9-article" style="max-width:760px;margin:0 auto;color:#222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.78;font-size:16px;">
<p style="font-size:17px;color:#444;margin:0 0 18px;">건습식 청소기 추천 글을 볼 때는 흡입력 숫자보다 먼저 생활 장면을 떠올려야 합니다. 마른 먼지만 빨아들이는 무선청소기와 달리 건습식 청소기는 흘린 음료, 젖은 발자국, 욕실 앞 물기, 반려동물 털과 미세한 가루가 섞인 오염을 함께 다루는 도구입니다. 그래서 좋은 선택은 단순히 강한 모터가 아니라, 물과 먼지가 섞였을 때 얼마나 덜 번거롭게 처리되는가에서 갈립니다.</p>
<p style="margin:0 0 24px;">이 딥다이브는 특정 상품을 길게 광고하는 글이 아닙니다. 유명 브랜드가 건습식 청소를 어떤 방식으로 해석하는지, 대표 아이템이 어떤 사용자 이미지를 만드는지, 구매자가 실제로 얻는 의미가 무엇인지 중심으로 정리합니다. 구매 링크는 하단의 가격과 구성 확인용 보조 영역으로만 배치했습니다.</p>
<div style="border:1px solid #e5e7eb;background:#f8fafc;border-radius:14px;padding:18px 20px;margin:24px 0;"><strong style="display:block;margin-bottom:8px;color:#111;">결론부터 말하면</strong><ul style="margin:0;padding-left:20px;"><li>아이, 반려동물, 주방 오염이 많으면 물걸레 겸용보다 진짜 오염수 분리 구조가 중요합니다.</li><li>차량, 창고, 베란다까지 쓰려면 무선 편의보다 탱크 용량과 흡입 유지력이 중요합니다.</li><li>매일 거실을 닦을 목적이면 셀프클리닝, 브러시 건조, 물통 세척 난이도를 먼저 봐야 합니다.</li><li>업소나 공방처럼 젖은 먼지가 많은 공간은 가정용 디자인보다 내구성과 필터 관리가 우선입니다.</li></ul></div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">1. 건습식 청소기는 청소기를 넘어 오염 처리 방식입니다</h2>
<p>일반 무선청소기는 먼지와 머리카락을 빠르게 치우는 데 강합니다. 하지만 물기가 섞이면 이야기가 달라집니다. 밀가루가 물과 만나 반죽처럼 되거나, 음료가 바닥에 흐른 뒤 먼지와 섞이거나, 현관의 흙탕물이 말라붙기 전에 닦아야 하는 상황에서는 건식 흡입만으로 충분하지 않습니다. 이때 건습식 청소기는 바닥 오염을 빨아들이고, 물이나 세척액으로 닦고, 더러운 물을 별도 탱크에 모으는 방식으로 문제를 해결합니다.</p>
<p>이 구조가 주는 의미는 청소 시간을 줄이는 것만이 아닙니다. 사용자가 청소를 미루지 않게 만드는 데 있습니다. 걸레를 빨고, 물통을 준비하고, 청소 후 걸레를 널어야 한다면 작은 오염도 다음으로 미루기 쉽습니다. 반면 오염을 발견한 순간 바로 켜서 처리할 수 있으면 집 안의 위생 기준이 달라집니다. 건습식 청소기의 진짜 가치는 강한 흡입보다 즉시성에 있습니다.</p>
<p>다만 즉시성은 관리 편의가 따라올 때만 유지됩니다. 오염수 통을 비우기 어렵거나 브러시에 냄새가 남거나 필터 세척이 번거로우면 사용자는 다시 손걸레로 돌아갑니다. 그래서 구매 전에는 광고의 흡입력보다 청소 후 내가 해야 하는 일을 상상해야 합니다. 물통을 빼고, 오염수를 버리고, 브러시를 세척하고, 충전 거치대에 올리는 과정이 자연스러워야 매일 쓰는 제품이 됩니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">2. 다이슨과 프리미엄 무선 브랜드가 만든 기대치</h2>
<p>다이슨 같은 프리미엄 무선 브랜드는 청소기를 단순 생활도구에서 기술 제품으로 바꿔 놓았습니다. 강한 모터, 먼지 시각화, 세련된 거치 방식, 교체 헤드 구성은 사용자가 청소기를 볼 때 기대하는 기준을 높였습니다. 건습식 청소기 시장에서도 이 영향은 큽니다. 사용자는 이제 바닥을 잘 닦는 것만이 아니라, 제품이 집 안에 놓였을 때의 이미지와 조작감까지 함께 봅니다.</p>
<p>프리미엄 브랜드의 철학은 보통 “청소가 귀찮은 노동이 아니라 정밀한 관리 경험이 될 수 있다”는 메시지에 가깝습니다. 버튼 감각, 디스플레이, 먼지통 분리 구조, 헤드 움직임은 모두 사용자가 제품을 신뢰하게 만드는 요소입니다. 가격이 높아도 이런 완성도가 구매 이유가 됩니다. 특히 거실에 충전 거치대를 두고 매일 보게 되는 제품이라면 디자인과 마감은 생각보다 중요합니다.</p>
<p>하지만 프리미엄 이미지가 곧 건습식 만족을 보장하지는 않습니다. 물이 섞인 오염은 마른 먼지보다 관리 난도가 높습니다. 브러시가 젖고, 오염수 냄새가 생기고, 배터리와 모터가 습한 환경을 견뎌야 합니다. 그래서 브랜드 이미지가 좋은 제품일수록 물통 구조, 셀프클리닝 시간, 건조 방식, 소모품 가격을 더 냉정하게 확인해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">3. 카처와 업소용 계열이 주는 내구성의 이미지</h2>
<p>카처처럼 청소 장비 이미지가 강한 브랜드는 가정용 무선청소기와 다른 신뢰를 줍니다. 이쪽의 핵심은 예쁜 거실 가전보다 젖은 먼지, 흙, 작업장 오염, 차량 매트 같은 거친 환경을 처리하는 능력입니다. 브랜드 철학도 다릅니다. 조용하고 날렵한 생활가전보다, 탱크 용량과 필터, 호스, 노즐, 모터 내구성을 앞세우는 도구에 가깝습니다.</p>
<p>이런 브랜드가 맞는 사용자는 명확합니다. 베란다, 창고, 차고, 공방, 사무실, 차량 내부처럼 오염 종류가 일정하지 않은 공간을 자주 청소하는 사람입니다. 마른 먼지만 있는 집 안 바닥보다 젖은 흙, 물기, 작은 부스러기, 작업 부산물이 섞인 환경에서 의미가 큽니다. 물청소를 자주 하거나 실외와 실내가 연결된 공간을 관리한다면 업소용 계열의 거친 실용성이 오히려 편할 수 있습니다.</p>
<p>반대로 단점도 분명합니다. 크고 무겁고 소음이 클 수 있으며, 거실 한쪽에 두기에는 디자인이 투박할 수 있습니다. 호스와 본체를 꺼내는 과정이 귀찮으면 작은 오염에는 손이 가지 않습니다. 따라서 업소용 이미지를 가진 제품은 “강력해 보이니까”가 아니라, 실제로 거친 오염을 자주 마주하는 생활인지부터 확인해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">4. 샤오미와 실속 브랜드가 만든 접근성</h2>
<p>샤오미와 여러 실속형 브랜드는 건습식 청소기의 진입 장벽을 낮췄습니다. 예전에는 물청소 기능이 있는 제품을 사려면 꽤 높은 가격을 각오해야 했지만, 이제는 더 많은 사용자가 중저가 영역에서 바닥 세척, 흡입, 셀프클리닝을 경험할 수 있습니다. 이 흐름은 건습식 청소기를 특별한 프리미엄 가전이 아니라 생활 문제를 해결하는 현실적인 선택지로 만들었습니다.</p>
<p>실속 브랜드의 의미는 “완벽한 한 대”보다 “내 생활에서 자주 쓰는 기능을 적당한 가격에 얻는다”는 데 있습니다. 원룸, 신혼집, 반려동물 초보 가정, 아이가 있는 집에서 바닥 오염이 반복된다면 고가 모델이 아니어도 체감 가치는 충분할 수 있습니다. 특히 처음 건습식 청소기를 써보는 사람에게는 입문 가격대가 실패 비용을 줄여 줍니다.</p>
<p>다만 실속형일수록 확인할 항목은 더 많습니다. 배터리 사용 시간, 물통 용량, 브러시 교체 가능 여부, AS 접수 방식, 필터 구매 가능성, 흡입력이 떨어지는 시점, 셀프클리닝 후 실제 건조 상태를 봐야 합니다. 가격이 낮은 대신 관리 부품이 약하거나 소모품을 구하기 어려우면 장기 만족도는 떨어질 수 있습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">5. 차량용과 가정용은 같은 청소기가 아닙니다</h2>
<p>차량용 청소기는 좁은 틈, 시트 사이, 발매트, 트렁크처럼 집과 전혀 다른 공간을 다룹니다. 여기서는 바닥을 넓게 닦는 능력보다 노즐 접근성, 본체 크기, 배터리 지속 시간, 충전 방식, 먼지통 비우기 편의가 중요합니다. 차량 내부에는 모래, 과자 부스러기, 머리카락, 먼지, 습기가 섞여 있고, 콘센트를 바로 쓰기 어렵기 때문에 휴대성이 큰 가치가 됩니다.</p>
<p>가정용 건습식 청소기는 반대로 반복 동선이 중요합니다. 거실, 주방, 현관, 욕실 앞을 자주 오가며 쓰기 때문에 충전 거치대 위치와 물 보충 동선이 만족도를 좌우합니다. 집 안에서는 소음도 더 민감합니다. 밤에 아이가 자는 동안 사용할 수 있는지, 아파트에서 아래층에 신경 쓰이지 않는지, 세척 후 브러시 냄새가 남지 않는지가 차량용보다 중요합니다.</p>
<p>두 용도를 한 제품으로 해결하려는 욕심은 실패로 이어질 수 있습니다. 차량용으로 좋은 작은 제품은 집 전체 물청소에는 약하고, 집에서 좋은 대형 제품은 차 안으로 들고 들어가기 어렵습니다. 구매 전에는 내가 가장 자주 청소하는 공간 하나를 정해야 합니다. 그 공간에서 가장 번거로운 오염이 무엇인지가 제품 선택의 출발점입니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">6. 흡입력보다 중요한 것은 오염수 관리입니다</h2>
<p>건습식 청소기에서 흡입력은 중요하지만 충분조건은 아닙니다. 젖은 먼지와 물기를 빨아들인 뒤 더러운 물이 어디에 모이고, 얼마나 쉽게 비워지고, 내부에 냄새가 남지 않는지가 장기 사용을 결정합니다. 오염수 통이 작으면 자주 비워야 하고, 구조가 복잡하면 세척을 미루게 됩니다. 세척을 미루면 냄새가 생기고, 냄새가 생기면 사용 빈도는 급격히 떨어집니다.</p>
<p>그래서 좋은 건습식 청소기는 청소 중 성능보다 청소 후 루틴이 더 중요할 때가 많습니다. 물통을 빼는 동작이 쉬운지, 손에 더러운 물이 묻지 않는지, 브러시 커버를 분리할 수 있는지, 필터를 말릴 공간이 필요한지 확인해야 합니다. 셀프클리닝 기능이 있어도 완전 자동 관리라고 생각하면 안 됩니다. 사용자는 결국 오염수 통을 비우고 일부 부품을 확인해야 합니다.</p>
<p>특히 반려동물 털, 아이 간식 부스러기, 주방 기름기처럼 냄새가 남기 쉬운 오염을 자주 다룬다면 관리 구조는 더 중요합니다. 강한 흡입으로 한 번에 빨아들이는 제품보다, 청소 후 냄새 없이 다음 날 다시 쓸 수 있는 제품이 실제 만족도가 높습니다. 구매 전 상세 페이지에서 오염수 통 분리 사진과 브러시 세척 방식을 꼭 보세요.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">7. 바닥재와 공간에 따라 선택 기준이 바뀝니다</h2>
<p>강마루, 장판, 타일, 대리석, 카펫은 물청소에 대한 반응이 다릅니다. 물을 많이 남기는 제품은 장판이나 마루에서 자국을 만들 수 있고, 틈새가 있는 바닥에서는 습기가 남을 수 있습니다. 타일은 물청소 만족도가 높지만 줄눈 관리가 별도 문제로 남습니다. 카펫이나 러그는 흡입과 건조가 더 까다롭고, 제품이 실제로 카펫 습식 청소를 지원하는지 확인해야 합니다.</p>
<p>공간 크기도 중요합니다. 원룸이나 작은 거실에서는 물통이 작아도 충분할 수 있지만, 넓은 집에서는 한 번에 청소할 수 있는 면적이 중요합니다. 배터리 사용 시간은 공회전 기준보다 실제 물분사와 흡입을 함께 쓸 때 줄어들 수 있습니다. 충전 시간이 길면 하루에 여러 번 쓰기 어렵습니다. 따라서 제품 설명의 최대 사용 시간은 보수적으로 해석하는 편이 안전합니다.</p>
<p>소음은 가족 구성과 시간대에 따라 체감이 갈립니다. 낮에 빠르게 청소하는 집이라면 큰 문제가 아닐 수 있지만, 밤이나 새벽에 아이가 자는 시간에 쓰려면 소음과 진동이 구매 만족도를 좌우합니다. 자동 세척 과정이 청소 본체보다 더 시끄러운 모델도 있을 수 있으므로, 상세 페이지에서 세척 모드와 건조 모드의 작동 방식을 확인해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">8. 사용자가 얻는 의미는 위생, 즉시성, 루틴의 안정감입니다</h2>
<p>건습식 청소기를 산다는 것은 단순히 청소 도구를 하나 더 사는 일이 아닙니다. 집 안에서 작은 오염을 보는 태도가 바뀝니다. 예전에는 “나중에 닦아야지” 하고 미루던 물자국이나 음식물 자국을 바로 처리하게 됩니다. 특히 아이가 있거나 반려동물과 함께 사는 집에서는 이 즉시성이 생활 스트레스를 줄입니다. 바닥이 자주 더러워지는 집일수록 건습식 청소기의 가치는 더 잘 드러납니다.</p>
<p>브랜드별 이미지도 여기서 갈립니다. 프리미엄 무선 브랜드는 깔끔한 집과 정돈된 사용 경험의 이미지를 줍니다. 업소용 계열은 거친 오염도 처리할 수 있다는 신뢰를 줍니다. 실속 브랜드는 비싼 장비 없이도 물청소 루틴을 시작할 수 있다는 접근성을 줍니다. 어떤 이미지가 더 좋은지는 생활 방식에 따라 달라집니다.</p>
<p>결국 핵심 질문은 하나입니다. 이 제품을 사면 내가 더 자주, 더 쉽게, 덜 스트레스 받으며 청소하게 되는가. 이 질문에 답하려면 브랜드 순위보다 내 집의 오염 패턴을 먼저 봐야 합니다. 주방 바닥이 자주 끈적이는지, 현관 흙먼지가 많은지, 차량 내부 청소가 잦은지, 반려동물 털과 물그릇 주변 오염이 반복되는지에 따라 좋은 제품은 달라집니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">9. 구매 전 체크리스트</h2>
<p>첫째, 물통과 오염수 통 용량을 확인하세요. 너무 작으면 청소 중간에 멈춰야 하고, 너무 크면 본체가 무거워집니다. 둘째, 브러시 분리와 세척 방식을 봐야 합니다. 셀프클리닝이 있어도 머리카락이나 끈적한 오염은 직접 확인해야 할 수 있습니다. 셋째, 바닥재 호환성을 확인하세요. 모든 제품이 모든 바닥에 같은 결과를 내지는 않습니다.</p>
<p>넷째, 소모품과 AS를 확인하세요. 필터, 롤러 브러시, 세척액, 배터리 교체 가능성은 장기 비용입니다. 다섯째, 충전 거치대 크기와 보관 위치를 정하세요. 좋은 제품도 꺼내기 어렵게 보관하면 사용 빈도가 떨어집니다. 여섯째, 제품 무게와 손목 부담을 봐야 합니다. 물을 넣은 상태의 체감 무게는 빈 본체보다 큽니다.</p>
<p>일곱째, 차량용인지 가정용인지 우선순위를 정하세요. 두 용도를 모두 완벽하게 만족시키는 제품은 드뭅니다. 여덟째, 쿠팡 상세 페이지에서 최신 가격, 구성품, 배송 조건을 다시 확인하세요. 가격은 작성 시점 기준이고 옵션에 따라 달라질 수 있습니다. 리뷰 수와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않고, 최신 후기와 상세 스펙을 함께 확인하는 방식으로 보완해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">10. 가격대는 성능보다 사용 빈도와 맞춰야 합니다</h2>
<p>건습식 청소기 가격은 저가 입문형, 중가형 생활가전, 프리미엄 관리형, 업소용 장비형으로 나눠 생각하는 편이 쉽습니다. 저가 입문형은 첫 경험 비용을 낮추는 장점이 있지만 물통 용량, 브러시 내구성, 배터리 지속 시간에서 한계가 생길 수 있습니다. 중가형은 가정에서 가장 현실적인 구간입니다. 거실, 주방, 현관을 자주 닦는 집이라면 이 가격대에서 관리 편의와 성능 균형을 찾는 것이 좋습니다.</p>
<p>프리미엄 가격대는 제품을 매일 쓰는 사람에게 의미가 있습니다. 셀프클리닝, 건조, 디스플레이, 소음 제어, 거치대 완성도 같은 요소가 반복 사용의 피로를 줄입니다. 단순히 한 달에 몇 번만 쓸 계획이라면 이런 편의 기능의 가격을 회수하기 어렵습니다. 반대로 아이나 반려동물 때문에 하루에도 여러 번 바닥을 닦는 집이라면 프리미엄 기능은 사치가 아니라 사용 빈도를 유지하는 장치가 됩니다.</p>
<p>업소용 장비형은 가격보다 환경 적합성이 중요합니다. 공방, 매장, 창고, 차량 관리처럼 오염이 거칠고 양이 많다면 가정용의 예쁜 디자인보다 탱크 용량과 내구성이 더 값어치 있습니다. 그러나 일반 아파트 거실에서 쓰기에는 소음, 부피, 보관 부담이 커질 수 있습니다. 가격대는 예산표가 아니라 생활 패턴표와 함께 봐야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">11. 건습식 청소기가 맞지 않는 사용자도 있습니다</h2>
<p>건습식 청소기가 모든 집에 정답은 아닙니다. 바닥 오염이 대부분 마른 먼지와 머리카락이고, 이미 좋은 무선청소기와 물걸레 청소 루틴이 자리 잡은 집이라면 추가 구매의 체감이 크지 않을 수 있습니다. 특히 청소 후 물통을 비우고 부품을 말리는 과정 자체가 싫은 사람에게는 건습식 구조가 오히려 번거롭게 느껴질 수 있습니다.</p>
<p>집 안에 러그나 카펫이 많고 마루 물청소를 자주 하지 않는 경우도 신중해야 합니다. 일부 제품은 카펫에 적합하지 않거나, 습식 사용 후 충분한 건조가 필요할 수 있습니다. 바닥재가 물에 민감한 집이라면 물분사량 조절과 잔수 남김 정도를 반드시 확인해야 합니다. 제품이 좋더라도 내 바닥재와 맞지 않으면 만족도는 낮아집니다.</p>
<p>또 하나의 변수는 보관입니다. 건습식 청소기는 충전 거치대, 물통, 브러시 건조 공간이 필요합니다. 현관이나 세탁실, 다용도실에 둘 수 있으면 좋지만, 좁은 원룸에서는 보관 자체가 스트레스가 될 수 있습니다. 구매 전에는 제품이 도착한 뒤 어디에 세워둘지, 물을 어디서 채우고 버릴지, 세척 후 부품을 어디서 말릴지까지 정해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">12. 오래 쓰려면 소모품과 위생 루틴을 먼저 설계해야 합니다</h2>
<p>건습식 청소기는 구매 순간보다 유지 과정에서 차이가 납니다. 롤러 브러시, 필터, 세척액, 배터리, 고무 패킹은 시간이 지나며 성능에 영향을 줍니다. 소모품을 쉽게 구할 수 있는지, 가격이 과도하지 않은지, 교체 주기가 명확한지 확인해야 합니다. 소모품이 불편하면 처음에는 잘 쓰던 제품도 몇 달 뒤 방치될 수 있습니다.</p>
<p>위생 루틴도 중요합니다. 오염수 통은 사용 후 바로 비우는 것이 좋고, 브러시는 냄새가 나기 전에 말려야 합니다. 셀프클리닝 기능이 있더라도 음식물이나 머리카락이 엉킨 부분은 사용자가 확인해야 합니다. 자동 기능을 과신하면 내부에 냄새가 남고, 냄새가 남으면 제품을 켜기 싫어집니다. 좋은 제품은 관리가 필요 없는 제품이 아니라, 관리가 쉬운 제품입니다.</p>
<p>가족이 함께 쓰는 집이라면 사용 규칙을 간단하게 정하는 것도 도움이 됩니다. 누가 오염수 통을 비울지, 세척 모드는 언제 돌릴지, 충전 거치대에는 항상 올려둘지 같은 작은 규칙이 사용 빈도를 유지합니다. 건습식 청소기는 혼자 쓰는 도구라기보다 집 안 청소 루틴의 일부가 되기 때문에, 제품 선택과 함께 운영 방식을 정해야 오래 갑니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">브랜드별 구매 후보 확인</h2>
${table}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">구매 링크는 가격과 구성 확인용입니다</h2>
${featuredProducts}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">마지막 정리</h2>
<p>건습식 청소기는 강한 흡입력 하나로 고르는 제품이 아닙니다. 물과 먼지가 섞인 오염을 얼마나 쉽게 처리하고, 청소 후 관리 루틴을 얼마나 가볍게 만들며, 내 생활 공간에서 얼마나 자주 손이 가는지가 중요합니다. 프리미엄 브랜드는 정돈된 사용 경험을 주고, 업소용 계열은 거친 오염을 처리하는 신뢰를 주며, 실속 브랜드는 물청소 루틴을 낮은 비용으로 시작하게 해줍니다.</p>
<p>가장 좋은 건습식 청소기는 유명한 제품이 아니라 내 집의 반복 오염에 맞는 제품입니다. 아이 간식, 반려동물 물그릇, 주방 바닥, 현관 흙먼지, 차량 매트 중 어디가 가장 자주 문제인지 먼저 정하세요. 그다음 물통, 브러시, 소음, 보관, AS를 확인하면 불필요한 과소비를 줄일 수 있습니다.</p>
<p style="font-size:13px;color:#666;margin-top:28px;">${DISCLOSURE}</p>
${itemListJsonLd}
</article>`

  return { title, slug, content, auxiliaryImages: [] }
}

function buildFanDeepdiveArticle(candidate, products) {
  const title = sanitizeTitleText(candidate.blogTitle || '선풍기 고르는 법 바람, 소음, 공간, 전기요금 기준으로 보는 여름 가전 보고서')
  const slug = `fan-buying-guide-airflow-noise-space-${formatKstDate()}-${Date.now()}`
  const table = enhanceFirstComparisonTable(buildComparisonTable(products), { force: true }).html
  const itemListJsonLd = renderItemListJsonLd(products, title)
  const featuredProducts = products.slice(0, 5).map((product, index) => {
    const role = productRole(product, index, 'deepdive')
    return `<section style="border:1px solid #e5e7eb;border-radius:18px;padding:18px;margin:18px 0;background:#fff;">
<h3 style="font-size:20px;line-height:1.35;margin:0 0 10px;color:#111;">${index + 1}. ${escapeHtml(product.name)}</h3>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" style="display:block;width:180px;max-width:100%;height:180px;object-fit:contain;border:1px solid #edf0f5;border-radius:16px;padding:10px;background:#fff;margin:0 auto 12px;" /></a>
<p style="margin:0 0 10px;"><strong>구매 확인 역할:</strong> ${escapeHtml(role)}입니다. 본문은 바람의 성격, 소음, 보관, 사용 장면을 이해하는 데 집중하고, 이 영역은 실제 가격과 배송 조건을 확인하는 보조 링크로만 사용하세요. 현재 확인 가격은 <strong>${formatPrice(product.price)}</strong>입니다.</p>
${renderProductFactPanel(product)}
<ul style="margin:0 0 12px;padding-left:20px;">
<li>핵심 판단: 바람 세기보다 바람 거리, 회전 범위, 소음, 전원 방식, 보관 위치를 함께 봐야 합니다.</li>
<li>주의할 점: 온라인 상품 정보만으로는 실제 취침 소음, 바람의 부드러움, 장기 모터 내구성을 확정할 수 없습니다.</li>
<li>추천 대상: ${escapeHtml(role)}을 우선순위로 보는 사용자</li>
</ul>
<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:999px;background:#ff5a00;color:#fff;text-decoration:none;font-size:15px;font-weight:900;">가격·배송 조건 확인</a>
</section>`
  }).join('\n')

  const content = `<article class="cp9-article" style="max-width:760px;margin:0 auto;color:#222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.78;font-size:16px;">
<p style="font-size:17px;color:#444;margin:0 0 18px;">선풍기 고르는 법은 생각보다 단순하지 않습니다. 여름 가전 중 가장 익숙한 물건이라 가격과 날개 크기만 보고 고르기 쉽지만, 실제 만족도는 바람의 질, 소음, 회전 범위, 보관 위치, 에어컨과 함께 쓰는 방식에서 갈립니다. 선풍기는 더위를 완전히 없애는 기계가 아니라 공기의 움직임을 설계하는 도구입니다.</p>
<p style="margin:0 0 24px;">이 딥다이브는 특정 상품을 길게 광고하는 글이 아닙니다. 신일, 한일, 보국, 샤오미, 다이슨 같은 이름이 사용자에게 어떤 이미지를 주는지, 스탠드형과 서큘레이터와 무선형이 생활 장면을 어떻게 바꾸는지, 구매자가 실제로 얻는 의미가 무엇인지 중심으로 정리합니다. 구매 링크는 하단의 가격과 조건 확인용 보조 영역으로만 배치했습니다.</p>
<div class="cp9-report-brief" style="border:1px solid #dbe3ef;background:#f8fafc;border-radius:16px;padding:18px 20px;margin:24px 0;">
<strong style="display:block;margin-bottom:8px;color:#111;">핵심 판단</strong>
<ul style="margin:0;padding-left:20px;">
<li>거실은 넓은 회전 범위와 안정적인 스탠드 구조가 중요합니다.</li>
<li>침실은 바람 세기보다 저단 소음과 미세 풍량 조절이 더 중요합니다.</li>
<li>에어컨 보조용은 멀리 보내는 직진 바람과 상하 각도 조절을 봐야 합니다.</li>
<li>무선형은 편하지만 배터리 지속 시간과 충전 동선이 만족도를 좌우합니다.</li>
</ul>
<strong style="display:block;margin:14px 0 8px;color:#111;">읽어야 할 사람</strong>
<p style="margin:0;">선풍기를 하나 더 살지, 서큘레이터로 바꿀지, 침실용 저소음 모델을 따로 둘지 고민하는 사람에게 맞습니다.</p>
<strong style="display:block;margin:14px 0 8px;color:#111;">가장 큰 리스크</strong>
<p style="margin:0;">바람이 강한 제품을 사도 실제 공간과 소음 기준에 맞지 않으면 매일 쓰기 어렵습니다. 선풍기는 성능보다 생활 동선과 맞아야 오래 갑니다.</p>
</div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">1. 선풍기는 더위보다 공기 흐름을 다루는 가전입니다</h2>
<p>선풍기를 켜면 시원해지는 이유는 공기 온도가 크게 내려가기 때문이 아닙니다. 피부 주변의 더운 공기를 밀어내고 땀이 증발하는 속도를 높이기 때문입니다. 그래서 같은 제품도 어디에 두는지, 어느 방향으로 틀어두는지, 에어컨과 함께 쓰는지에 따라 체감이 크게 달라집니다. 거실 중앙에 두는 선풍기와 침대 옆 협탁에 두는 선풍기는 같은 기준으로 고르면 안 됩니다.</p>
<p>가장 먼저 정할 것은 바람의 목적입니다. 몸에 직접 닿는 바람이 필요한지, 방 안 공기를 천천히 섞고 싶은지, 에어컨 냉기를 멀리 보내고 싶은지 구분해야 합니다. 직접 바람은 더위를 빠르게 낮추지만 오래 맞으면 피곤할 수 있습니다. 순환 바람은 체감이 부드럽지만 제품 위치와 각도 설정이 중요합니다. 에어컨 보조 바람은 직진성과 회전 범위가 중요합니다.</p>
<p>이 관점으로 보면 선풍기는 단순한 날개 달린 기계가 아니라 여름 생활의 배치 도구입니다. 책상 아래, 침대 옆, 주방 조리대, 거실 소파, 현관 앞 제습 공간처럼 쓰임새가 다릅니다. 좋은 제품은 광고 문구가 화려한 제품이 아니라 내가 자주 머무는 자리의 공기를 자연스럽게 바꿔 주는 제품입니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">2. 신일과 한일이 주는 익숙한 신뢰감</h2>
<p>국내 선풍기 시장에서 신일과 한일 같은 브랜드는 오래된 생활가전의 이미지를 갖고 있습니다. 이 브랜드들이 주는 의미는 최신 기능보다 실패 확률을 낮추는 안정감에 가깝습니다. 부모님 집, 사무실, 매장, 오래된 거실에서 본 적 있는 브랜드라는 기억은 생각보다 강한 구매 이유가 됩니다. 선풍기는 매일 켜고 끄는 제품이라 낯선 혁신보다 익숙한 조작감이 더 편할 때가 많습니다.</p>
<p>이런 브랜드를 볼 때는 기본기를 중심으로 판단해야 합니다. 받침대가 안정적인지, 높이 조절이 쉬운지, 날개망 분리가 편한지, 리모컨과 버튼이 직관적인지, AS 접근성이 어떤지 확인해야 합니다. 복잡한 앱 기능보다 가족 모두가 쉽게 쓰는 조작감이 중요합니다. 특히 거실용 선풍기는 한 사람이 아니라 가족 전체가 쓰기 때문에 버튼 설명이 쉬운 제품이 오래 갑니다.</p>
<p>단점도 있습니다. 익숙한 브랜드의 제품이라고 해서 모든 모델이 조용하거나 세련된 것은 아닙니다. 저가형은 바람 단계가 거칠 수 있고, 디자인이 투박할 수 있으며, 보관할 때 부피가 클 수 있습니다. 그래서 브랜드 신뢰는 출발점일 뿐이고, 실제 구매 전에는 소음, 높이, 회전 방식, 날개망 분리 구조를 다시 봐야 합니다.</p>
<blockquote style="border-left:4px solid #cbd5e1;margin:24px 0;padding:10px 16px;color:#475467;background:#f8fafc;">선풍기는 스펙보다 가족의 손이 얼마나 자연스럽게 가는지가 오래 쓰는 기준이 됩니다.</blockquote>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">3. 서큘레이터는 선풍기의 대체품이 아니라 다른 역할입니다</h2>
<p>서큘레이터는 이름부터 공기 순환에 초점을 둡니다. 선풍기가 사람에게 바람을 보내는 물건이라면, 서큘레이터는 방 안의 공기를 움직이는 물건에 가깝습니다. 직진성이 강한 바람으로 냉기를 멀리 보내고, 방 구석에 고인 공기를 섞고, 제습기나 에어컨의 효율을 보조합니다. 그래서 서큘레이터를 사면서 선풍기처럼 바로 몸 앞에 두면 바람이 부담스럽게 느껴질 수 있습니다.</p>
<p>에어컨과 함께 쓸 목적이라면 서큘레이터가 유리할 수 있습니다. 냉기가 한쪽에만 머물지 않도록 멀리 밀어 주고, 방과 거실 사이의 온도 차이를 줄이는 데 도움이 됩니다. 다만 방향 설정이 중요합니다. 몸을 향해 강하게 트는 것이 아니라 벽, 천장, 복도 방향으로 공기 길을 만드는 식으로 써야 장점이 살아납니다.</p>
<p>구매 전에는 상하 각도, 좌우 회전, 소음, 청소 편의, 보관 크기를 확인해야 합니다. 작은 제품이라도 바람이 강하면 밤에는 시끄럽게 느껴질 수 있습니다. 반대로 너무 약하면 에어컨 보조 역할이 애매합니다. 서큘레이터는 작아 보이지만 위치를 잘못 잡으면 방 안에서 계속 신경 쓰이는 제품이 됩니다. 작은 몸집에 속지 말고 실제 둘 자리를 먼저 정하세요.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">4. 침실용은 바람 세기보다 저단 소음이 우선입니다</h2>
<p>침실에서 선풍기를 쓸 때 가장 중요한 것은 강풍이 아닙니다. 밤새 켜두어도 거슬리지 않는 저단 소음, 부드러운 풍량, 꺼짐 예약, 조명 밝기, 버튼음 같은 작은 요소입니다. 낮에는 신경 쓰이지 않던 작동음도 밤에는 크게 들립니다. 특히 머리맡 가까이에 두는 제품이라면 모터음과 회전음이 수면의 질을 좌우할 수 있습니다.</p>
<p>초미풍이나 자연풍 같은 표현은 매력적이지만, 실제 느낌은 제품마다 다릅니다. 중요한 것은 가장 약한 단계가 내 수면 환경에 맞는지입니다. 바람이 너무 약하면 답답하고, 너무 강하면 목이 마르거나 몸이 피곤해질 수 있습니다. 침실에서는 풍량 단계가 촘촘한 제품이 유리합니다. 리모컨 반응과 예약 기능도 실제 사용 빈도를 높입니다.</p>
<p>침실용은 안전도 함께 봐야 합니다. 아이가 있는 집은 날개망 간격과 넘어짐 가능성을 확인해야 하고, 반려동물이 있는 집은 선을 물거나 받침대를 건드릴 수 있는지 생각해야 합니다. 무선형은 선이 줄어드는 장점이 있지만 충전을 깜빡하면 가장 더운 밤에 쓰지 못할 수 있습니다. 침실 선풍기는 낮의 성능표보다 밤의 루틴으로 고르는 편이 맞습니다.</p>
<div style="border:1px solid #e5e7eb;border-radius:16px;padding:16px;background:#fff7ed;margin:24px 0;"><strong style="display:block;margin-bottom:8px;color:#111;">짧은 체크 카드</strong><p style="margin:0;">취침용이라면 강풍보다 약풍을 보세요. 여름밤에는 가장 약한 단계가 실력입니다.</p></div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">5. 거실용은 안정성과 회전 범위가 만족도를 만듭니다</h2>
<p>거실 선풍기는 한 사람만을 위한 제품이 아닙니다. 소파, 식탁, TV 앞, 아이 놀이 공간처럼 여러 방향으로 바람을 보내야 합니다. 그래서 거실용은 받침대 안정성, 높이 조절, 좌우 회전 각도, 리모컨 편의가 중요합니다. 바람이 강해도 한 방향만 시원하면 가족 중 누군가는 계속 불편합니다.</p>
<p>거실에서는 제품이 계속 보입니다. 디자인과 색상도 무시하기 어렵습니다. 여름 내내 거실 한쪽에 서 있는 물건이기 때문에 너무 투박하거나 먼지가 잘 보이면 신경 쓰입니다. 다만 디자인만 보고 고르면 실패할 수 있습니다. 예쁜 제품이 청소하기 어렵거나 높이 조절이 제한적이면 여름 중반부터 불편이 쌓입니다.</p>
<p>거실용 구매 전에는 실제 보관까지 생각해야 합니다. 여름이 끝난 뒤 분해해서 박스에 넣을지, 다용도실에 세워둘지, 커버를 씌워 보관할지에 따라 제품 크기의 의미가 달라집니다. 선풍기는 여름에만 쓰는 것처럼 보이지만, 보관 기간이 더 긴 물건입니다. 보관이 어려우면 다음 해 꺼낼 때부터 귀찮아집니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">6. 무선 선풍기와 휴대용 선풍기의 진짜 장점</h2>
<p>무선 선풍기의 장점은 선이 없다는 사실보다 자리를 쉽게 바꿀 수 있다는 데 있습니다. 주방에서 요리할 때, 베란다에서 빨래를 널 때, 아이가 공부하는 책상 옆, 캠핑 테이블 위처럼 이동이 잦은 장면에서 가치가 큽니다. 콘센트 위치 때문에 선풍기 자리가 고정되는 집이라면 무선형이 생활 동선을 크게 바꿀 수 있습니다.</p>
<p>하지만 무선형은 배터리라는 조건이 따라옵니다. 최대 사용 시간은 보통 낮은 풍량 기준일 수 있고, 강풍에서는 짧아질 수 있습니다. 충전 시간이 길면 매일 쓰기 번거롭고, 충전 단자가 특수하면 케이블 분실이 스트레스가 됩니다. 휴대용 제품은 더 그렇습니다. 작고 귀여운 제품이라도 충전이 불편하면 여름 가방 속 장식품이 됩니다.</p>
<p>무선형을 고를 때는 배터리 시간보다 충전 루틴을 먼저 상상하세요. 어디에 꽂아둘지, 사용 후 바로 충전할지, 가족이 함께 쓰면 누가 충전할지 정해야 합니다. 선이 없어서 자유로운 제품은 관리 루틴이 없으면 금방 불편한 제품이 됩니다. 자유에는 충전이라는 작은 책임이 붙습니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">7. 날개형과 날개 없는 디자인의 선택 기준</h2>
<p>날개형 선풍기는 구조가 익숙하고 가격 선택지가 넓습니다. 날개망을 분리해 청소할 수 있고, 바람의 방향과 세기가 직관적으로 느껴집니다. 반면 날개망에 먼지가 쌓이고, 아이 손이 닿는 환경에서는 안전을 신경 써야 합니다. 일반 가정에서 가장 현실적인 선택지는 여전히 날개형인 경우가 많습니다.</p>
<p>날개 없는 디자인은 안전감과 인테리어 이미지를 줍니다. 거실에 두었을 때 깔끔하고, 날개망 청소 스트레스가 적어 보입니다. 다만 가격대가 높고, 바람의 질과 소음은 모델별 차이가 큽니다. 디자인이 부드럽다고 해서 모든 제품이 조용한 것은 아닙니다. 필터나 공기청정 기능이 붙은 제품이라면 소모품 비용도 함께 봐야 합니다.</p>
<p>이 선택은 기술 우열보다 생활 이미지의 차이에 가깝습니다. 아이와 반려동물이 있어 안전감을 중시하거나 거실 인테리어를 해치고 싶지 않다면 날개 없는 디자인이 의미가 있습니다. 예산과 실용성을 우선하고, 청소와 보관을 감당할 수 있다면 날개형이 더 합리적일 수 있습니다. 중요한 것은 내 집에서 매일 보이고 만지는 방식입니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">8. 전기요금보다 사용 시간과 에어컨 조합을 봐야 합니다</h2>
<p>선풍기 전기요금은 보통 에어컨보다 부담이 작지만, 그렇다고 아무렇게나 써도 된다는 뜻은 아닙니다. 여름 내내 하루 종일 켜두는 집이라면 소비전력과 사용 시간이 누적됩니다. 특히 여러 대를 동시에 쓰면 작은 차이도 의미가 생깁니다. 다만 선풍기의 진짜 절약 효과는 단독 사용보다 에어컨과 함께 쓸 때 나오는 경우가 많습니다.</p>
<p>에어컨 설정 온도를 너무 낮추기보다 선풍기로 체감 온도를 보완하면 전력 부담을 줄이는 데 도움이 될 수 있습니다. 하지만 이때도 바람 방향이 중요합니다. 차가운 공기를 사람에게 바로 때리는 방식보다 방 전체에 천천히 돌리는 방식이 더 편할 수 있습니다. 선풍기는 에어컨의 경쟁자가 아니라 조율자에 가깝습니다.</p>
<p>구매 전에는 소비전력 숫자만 보지 말고 내가 실제로 몇 시간 켤지 생각해야 합니다. 침실에서 밤새 쓸 제품, 거실에서 오후에만 쓸 제품, 주방에서 요리할 때만 쓸 제품은 기준이 다릅니다. 사용 시간이 길수록 소음과 전력, 모터 발열, 청소 편의가 중요해집니다. 짧게 쓰는 제품은 이동성과 즉시성이 더 중요합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">9. 청소와 보관은 구매 후 만족도의 절반입니다</h2>
<p>선풍기는 먼지를 모으는 가전입니다. 날개, 망, 기둥, 받침대에 먼지가 붙고, 여름이 길어질수록 바람 냄새도 달라질 수 있습니다. 그래서 분해 청소가 쉬운지, 나사를 많이 풀어야 하는지, 날개망을 물로 씻기 쉬운지 확인해야 합니다. 청소가 어려우면 처음 한 달은 잘 쓰다가도 점점 손이 가지 않습니다.</p>
<p>보관도 중요합니다. 스탠드형은 높이가 있어 다용도실에 세워둘 수 있는지 봐야 하고, 박스 보관을 원하면 분해가 쉬운지 확인해야 합니다. 서큘레이터나 탁상형은 작지만 여러 개가 생기면 충전기와 함께 흩어지기 쉽습니다. 여름이 끝난 뒤 어디에 둘지 정하지 않으면 다음 여름에 다시 새 제품을 사고 싶어집니다.</p>
<p>가족이 함께 쓰는 집에서는 청소 담당과 보관 방식을 정하는 것도 좋습니다. 선풍기는 가격이 낮아 보일수록 관리가 대충 넘어가기 쉽지만, 먼지와 안전은 매년 반복되는 문제입니다. 오래 쓰는 제품은 모터보다 관리 루틴에서 결정됩니다. 좋은 선풍기는 시원한 제품이면서 동시에 청소하기 쉬운 제품입니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">10. 가격대는 기능보다 실패 비용으로 봐야 합니다</h2>
<p>저가형 선풍기는 보조용이나 짧은 사용에 좋습니다. 원룸, 사무실 책상, 세탁실, 주방 보조처럼 특정 자리에 두고 쓰기에는 충분할 수 있습니다. 다만 소음, 내구성, 회전 부드러움, 리모컨 품질에서 아쉬움이 생길 수 있습니다. 가격이 낮을수록 기대치를 정확히 잡아야 만족합니다.</p>
<p>중가형은 대부분의 가정에서 가장 현실적인 구간입니다. 거실과 침실에서 매일 쓰면서도 과한 기능을 줄이고, 리모컨, 예약, 높이 조절, 회전 같은 기본 편의를 확보할 수 있습니다. 프리미엄 가격대는 디자인, 저소음, 공기청정 연계, 무선 편의, 브랜드 이미지에 값을 지불하는 영역입니다. 매일 보이는 장소에 둘수록 이런 요소의 체감이 커집니다.</p>
<p>가격을 볼 때는 한여름 한 달이 아니라 몇 년을 생각하세요. 매년 꺼내 쓰는 제품이라면 조금 더 좋은 조작감과 청소 편의가 값을 할 수 있습니다. 반대로 특정 공간 보조용이라면 비싼 모델보다 목적이 분명한 실속형이 낫습니다. 가장 비싼 선풍기가 아니라 가장 자주 켜게 될 선풍기를 고르는 것이 핵심입니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">11. 선풍기가 맞지 않는 상황도 있습니다</h2>
<p>모든 더위 문제를 선풍기로 해결할 수는 없습니다. 실내 온도와 습도가 너무 높으면 선풍기는 더운 공기를 계속 움직일 뿐입니다. 이때는 에어컨, 제습기, 환기, 차광이 함께 필요합니다. 특히 장마철에는 바람이 있어도 끈적함이 남을 수 있습니다. 선풍기는 습기를 제거하지 않기 때문입니다.</p>
<p>먼지가 많거나 알레르기에 민감한 집도 주의해야 합니다. 선풍기가 바닥 먼지를 다시 띄울 수 있고, 날개망에 먼지가 쌓인 상태로 켜면 공기 질이 나빠질 수 있습니다. 아이나 반려동물이 있는 집은 안전망과 선 정리도 중요합니다. 시원함보다 안전과 위생이 먼저인 상황이 분명히 있습니다.</p>
<p>또한 조용한 공간에서 일하거나 녹음을 하거나 공부하는 환경이라면 선풍기 소음이 집중을 방해할 수 있습니다. 이런 경우에는 제품 위치를 멀리 두거나, 서큘레이터로 간접 순환을 만들거나, 에어컨 설정을 조정하는 편이 나을 수 있습니다. 선풍기를 사기 전에 정말 바람이 필요한 문제인지, 온도와 습도와 환기 중 무엇이 문제인지 구분해야 합니다.</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">브랜드별 구매 후보 확인</h2>
${table}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">구매 링크는 가격과 배송 조건 확인용입니다</h2>
${featuredProducts}
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">마지막 정리</h2>
<p>선풍기는 오래된 가전이지만 여전히 여름 생활을 바꾸는 힘이 있습니다. 다만 이제는 단순히 강한 바람을 찾는 시대가 아닙니다. 침실에서는 조용한 약풍, 거실에서는 넓은 회전과 안정성, 에어컨 보조용으로는 공기 순환, 이동이 많은 집에서는 무선 편의가 중요합니다. 브랜드는 이 기준을 이해한 뒤 고르면 됩니다.</p>
<p>구매 전에는 세 가지를 먼저 정하세요. 어디에 둘 것인가, 누구에게 바람을 보낼 것인가, 여름이 끝나면 어디에 보관할 것인가. 이 세 질문에 답하면 가격표가 훨씬 선명해집니다. 작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 배송 조건을 기준으로 후보를 확인하고, 실제 소음과 세부 구성은 구매 전 상세 페이지에서 다시 보세요.</p>
<p>좋은 선풍기는 존재감이 큰 제품이 아니라 더운 날 자연스럽게 손이 가는 제품입니다. 매일 켜고, 쉽게 끄고, 부담 없이 청소하고, 다음 여름에도 다시 꺼내 쓰게 된다면 그 제품은 이미 제 역할을 하고 있습니다.</p>
<p style="font-size:13px;color:#666;margin-top:28px;">${DISCLOSURE}</p>
${itemListJsonLd}
</article>`

  return { title, slug, content, auxiliaryImages: [] }
}

function buildCurationCard(product, index) {
  const role = productRole(product, index, 'curation_20')
  const description = curationDescription(product, role, index)
  return `<section class="cp9-curation-card" style="box-sizing:border-box;width:100%;display:grid!important;grid-template-columns:112px minmax(0,1fr)!important;gap:18px!important;align-items:start!important;border:1px solid #d1d5db;border-radius:18px;padding:18px;background:#fff;margin:0 0 14px;box-shadow:0 8px 22px rgba(15,23,42,.04);">
<a class="cp9-curation-image" href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:block;width:112px;min-width:112px;"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" style="display:block;box-sizing:border-box;width:112px!important;height:112px!important;max-width:112px!important;object-fit:contain;border:1px solid #edf0f5;border-radius:14px;padding:8px;background:#fff;" /></a>
<div class="cp9-curation-body" style="min-width:0;width:100%;display:block;"><span style="display:inline-block;font-size:13px;color:#6b7280;margin:0 0 5px;line-height:1.45;">${String(index + 1).padStart(2, '0')} · ${escapeHtml(role)}</span><strong style="display:block;font-size:18px;line-height:1.42;color:#111;margin:0 0 8px;letter-spacing:-.025em;word-break:keep-all;overflow-wrap:anywhere;">${escapeHtml(product.name)}</strong><p style="margin:0 0 10px;color:#475467;font-size:15px;line-height:1.72;word-break:keep-all;overflow-wrap:anywhere;">${escapeHtml(description)}</p>${renderProductFactPanel(product, { compact: true })}<a href="${escapeHtml(product.url)}" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 16px;border-radius:999px;background:#ff5a00;color:#fff!important;text-decoration:none!important;font-size:14px;font-weight:900;">가격 확인</a></div>
</section>`
}

function curationDescription(product, role, index) {
  const source = product.sourceKeyword || '여름 생활용품'
  const price = formatPrice(product.price)
  const common = `현재 확인 가격은 ${price}입니다. 가격은 작성 시점 기준이므로 구매 전 쿠팡 상세 페이지에서 옵션, 색상, 구성품, 배송 조건을 다시 확인해야 합니다. 비슷한 상품이 많을수록 사진만 보고 고르기보다 실제 설치 위치, 보관 공간, 사용 빈도를 함께 따져보는 편이 안전합니다.`

  if (/로보락|로봇\s*청소기|로봇청소기|물걸레/i.test(`${source} ${product.name}`)) {
    return `로봇청소기는 흡입력 숫자만으로 고르기보다 집 구조와 관리 루틴에 맞는지가 더 중요합니다. 이 상품은 ${role} 관점에서 자동 먼지 비움, 물걸레 세척, 장애물 회피, 앱 제어처럼 매일 쓰는 편의 기능을 확인할 후보입니다. 구매 전에는 문턱 높이, 러그 사용 여부, 스테이션 크기, 물걸레 관리 방식, 소모품 가격을 함께 확인하세요. ${common}`
  }
  if (/선풍기|서큘레이터/.test(source)) {
    return `여름에는 에어컨을 계속 켜는 것보다 몸 가까이에서 바람을 보태는 소형 냉방 아이템이 체감 효율을 높입니다. 이 상품은 ${role} 목적에 맞춰 책상, 침대 옆, 외출 가방 안에서 보조 냉방 역할을 기대할 수 있습니다. 구매 전에는 배터리 지속 시간, 충전 단자, 소음, 목 각도 조절 여부를 확인하세요. ${common}`
  }
  if (/제습|필터|청소/.test(source)) {
    return `장마철과 여름철의 불편은 더위보다 습기와 냄새에서 시작되는 경우가 많습니다. 이 상품은 ${role} 용도로 욕실, 신발장, 원룸 구석처럼 환기가 약한 공간의 불쾌감을 줄이는 데 초점을 둡니다. 소모품이 필요한 제품이라면 리필 가격과 교체 주기를 함께 봐야 실제 유지 비용을 판단할 수 있습니다. ${common}`
  }
  if (/쿨|냉감|이불/.test(source)) {
    return `밤에 덥고 끈적이면 수면의 질이 바로 떨어집니다. 이 상품은 ${role} 관점에서 피부에 닿는 면적과 세탁 편의성이 중요합니다. 냉감 소재는 처음 닿는 느낌만 보고 고르면 실패할 수 있으므로 세탁 가능 여부, 미끄러짐, 두께, 침대 사이즈 호환성을 함께 확인하세요. ${common}`
  }
  if (/모기/.test(source)) {
    return `여름 생활의 작은 스트레스는 모기와 날벌레에서 크게 올라갑니다. 이 상품은 ${role} 목적의 아이템으로, 침실이나 거실에서 잠들기 전 불편을 줄이는 데 의미가 있습니다. 다만 벌레 관련 제품은 사용 공간, 전원 방식, 소모품 유무, 어린이나 반려동물이 있는 환경에서의 주의사항을 꼭 확인해야 합니다. ${common}`
  }
  if (/텀블러|슬리퍼/.test(source)) {
    return `외출이 잦은 여름에는 작은 휴대 아이템의 만족도가 큽니다. 이 상품은 ${role} 관점에서 매일 들고 다니거나 자주 신는 물건에 해당합니다. 디자인만 보지 말고 무게, 세척 난이도, 미끄럼 방지, 손잡이 구조, 가방 수납성을 확인하면 실제 사용 빈도를 예측하기 쉽습니다. ${common}`
  }
  if (/믹서기|블렌더/.test(`${source} ${product.name}`)) {
    return `믹서기는 단순히 잘 갈리는지만 보면 실패하기 쉽습니다. 이 상품은 ${role} 관점에서 주스, 스무디, 이유식, 양념, 얼음 분쇄처럼 자주 쓰는 조리 장면에 맞춰 확인할 후보입니다. 구매 전에는 칼날 구조, 용기 용량, 분리 세척, 작동 소음, 얼음 사용 가능 여부, 보관 높이를 함께 확인하세요. ${common}`
  }
  return `좁은 공간에서는 정리 아이템 하나가 생활 동선을 바꿉니다. 이 상품은 ${role} 목적에 맞춰 바닥에 흩어지는 물건을 줄이고, 습한 계절에 청소와 환기를 쉽게 만드는 데 도움을 줄 수 있습니다. 구매 전에는 실제 설치 위치의 폭과 높이, 하중, 재질, 물청소 가능 여부를 확인하는 편이 안전합니다. ${common}`
}

function buildCurationArticle(candidate, products) {
  const isRobotVacuum = /로보락|로봇\s*청소기|로봇청소기|물걸레/i.test(candidate.keyword || '')
  const isSummer = /선풍기|서큘레이터|손선풍기|휴대용선풍기|탁상용선풍기/i.test(candidate.keyword || '')
  const isMixer = /믹서기|블렌더/i.test(candidate.keyword || '')
  const title = isRobotVacuum
    ? '로보락 로봇청소기 20가지 사용 환경별 구매 체크'
    : isSummer
    ? '여름 생활 필수템 20가지 더위·습기·냄새 줄이는 실용템 큐레이션'
    : candidate.blogTitle || `${candidate.keyword} 추천 20가지 구매 전 체크`
  const slug = isRobotVacuum
    ? `roborock-robot-vacuum-20-${formatKstDate()}-${Date.now()}`
    : isSummer
    ? `summer-living-essentials-20-${formatKstDate()}-${Date.now()}`
    : `cp9-${slugifyAscii(candidate.keyword)}-20-${formatKstDate()}-${Date.now()}`
  const cards = products.map(buildCurationCard).join('\n')
  const itemListJsonLd = renderItemListJsonLd(products, title)
  const intro = isRobotVacuum
    ? '로보락 로봇청소기는 모델명이 비슷해 보여도 자동 먼지 비움, 물걸레 세척, 건조, 장애물 회피, 흡입력, 스테이션 크기에서 체감 차이가 큽니다. 집 구조와 청소 루틴에 맞는 후보를 먼저 좁히는 편이 안전합니다.'
    : isSummer
    ? '여름 생활 필수템은 예쁜 소품보다 더위, 습기, 냄새, 벌레, 수납 문제를 얼마나 줄여주는지가 중요합니다. 좁은 방이나 원룸일수록 하나의 물건이 매일 쓰이는지부터 봐야 합니다.'
    : isMixer
    ? '믹서기는 모터 힘만 보고 고르면 주방에서 오래 쓰기 어렵습니다. 자주 만드는 메뉴, 용기 용량, 세척 방식, 보관 높이, 소음까지 맞아야 매일 꺼내 쓰는 도구가 됩니다.'
    : `${candidate.keyword} 상품은 가격만 나열하면 실제 선택에 도움이 되지 않습니다. 이번 큐레이션은 사용 장면, 보관 조건, 관리 부담, 가격 확인 가능성을 함께 보며 후보를 좁혔습니다.`
  const criteria = isRobotVacuum
    ? ['집 구조와 문턱, 러그 환경에 맞는 주행 방식인가', '물걸레 세척과 건조, 먼지 비움 같은 관리 부담을 줄이는가', '스테이션 크기와 설치 위치가 생활 동선을 방해하지 않는가', '상품 이미지와 링크가 정상이고 가격 확인이 가능한가']
    : isSummer
    ? ['더위 체감, 습기, 냄새, 벌레, 수납 문제를 직접 줄이는가', '가격이 낮아도 구매 목적이 즉시 이해되는가', '원룸, 자취방, 작은 거실에서도 부담 없이 둘 수 있는가', '상품 이미지와 링크가 정상이고 가격 확인이 가능한가']
    : isMixer
    ? ['스무디, 주스, 이유식, 양념처럼 실제 조리 목적이 분명한가', '용량과 세척 방식이 매일 쓰기 부담스럽지 않은가', '소음, 보관 높이, 칼날 분리 여부를 구매 전 확인할 수 있는가', '상품 이미지와 링크가 정상이고 가격 확인이 가능한가']
    : ['더위 체감, 습기, 냄새, 벌레, 수납 문제를 직접 줄이는가', '가격이 낮아도 구매 목적이 즉시 이해되는가', '원룸, 자취방, 작은 거실에서도 부담 없이 둘 수 있는가', '상품 이미지와 링크가 정상이고 가격 확인이 가능한가']
  const listHeading = isRobotVacuum ? '로보락 로봇청소기 20가지 빠른 리스트' : isSummer ? '여름 생활 필수템 20가지 빠른 리스트' : `${candidate.keyword} 20가지 빠른 리스트`
  const closingGuide = isRobotVacuum
    ? '20개를 모두 같은 기준으로 볼 필요는 없습니다. 먼저 집에 러그가 많은지, 문턱이 높은지, 물걸레 청소를 자주 하는지, 스테이션을 둘 공간이 충분한지부터 확인하세요. 그다음 자동 세척과 건조 같은 편의 기능이 실제로 필요한지 따지면 과한 지출을 줄일 수 있습니다.'
    : isSummer
    ? '20개를 모두 살 필요는 없습니다. 먼저 내가 겪는 문제가 더위인지, 습기인지, 냄새인지, 벌레인지 구분하세요. 그다음 매일 쓰는 물건부터 고르면 불필요한 충동구매를 줄일 수 있습니다.'
    : isMixer
    ? '20개를 모두 같은 목적으로 볼 필요는 없습니다. 아침 스무디가 목적이면 텀블러형과 세척 편의가 중요하고, 양념이나 이유식까지 생각하면 용량과 칼날 구조를 더 봐야 합니다. 자주 만들 메뉴 하나를 정한 뒤 가격을 비교하면 선택이 쉬워집니다.'
    : `20개를 모두 살 필요는 없습니다. 먼저 ${candidate.keyword}을 어디에서 얼마나 자주 쓸지 정하세요. 그다음 크기, 보관, 세척, 소모품, 배송 조건을 확인하면 불필요한 지출을 줄일 수 있습니다.`
  const purchaseCheck = isRobotVacuum
    ? '로봇청소기는 본체보다 집과의 궁합이 중요합니다. 구매 전 문턱 높이, 침대와 소파 하부 높이, 러그 인식, 물걸레 패드 관리, 소모품 가격, 앱 지원, AS 조건을 확인하세요. 가격은 작성 시점 기준이므로 구매 전 쿠팡 상세 페이지에서 최신 가격과 배송 조건을 확인해야 합니다.'
    : isSummer
    ? '여름 상품은 사이즈와 소모품 조건이 중요합니다. 선풍기류는 충전 방식과 소음, 제습·청소용품은 리필 가능 여부, 침구류는 세탁 가능 여부를 확인하세요. 가격은 작성 시점 기준이므로 구매 전 쿠팡 상세 페이지에서 최신 가격과 배송 조건을 확인해야 합니다.'
    : isMixer
    ? '믹서기는 용량, 칼날 구조, 얼음 사용 가능 여부, 분리 세척, 소음, 보관 높이를 확인해야 합니다. 유리 용기는 냄새 배임이 적지만 무겁고, 텀블러형은 간편하지만 대량 조리에 약할 수 있습니다. 가격은 작성 시점 기준이므로 구매 전 쿠팡 상세 페이지에서 최신 가격과 배송 조건을 확인해야 합니다.'
    : `${candidate.keyword} 구매 전에는 실제 설치 위치, 보관 공간, 구성품, 배송 조건, AS 가능 여부를 확인해야 합니다. 가격은 작성 시점 기준이므로 구매 전 쿠팡 상세 페이지에서 최신 가격과 배송 조건을 다시 보세요.`
  const content = `<style>
.cp9-curation-list{display:block!important;width:100%!important;margin:0 0 32px!important;padding:0!important}
.cp9-curation-card>p:empty{display:none!important}
@media (max-width:520px){
  .cp9-curation-card{grid-template-columns:82px minmax(0,1fr)!important;gap:12px!important;padding:14px!important}
  .cp9-curation-image{width:82px!important;min-width:82px!important}
  .cp9-curation-image img{width:82px!important;height:82px!important;max-width:82px!important}
  .cp9-curation-body strong{font-size:15px!important;line-height:1.38!important}
  .cp9-curation-body p{font-size:13px!important;line-height:1.65!important}
}
</style>
<article class="cp9-article" style="max-width:760px;margin:0 auto;color:#222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.78;font-size:16px;">
<p style="font-size:17px;color:#444;margin:0 0 18px;">${intro}</p>
<p style="margin:0 0 24px;">이번 큐레이션은 작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 배송 조건을 바탕으로 20개를 선별했습니다. 리뷰와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않고, 과장된 만족도 표현은 배제했습니다.</p>
<div style="border:1px solid #e5e7eb;background:#f8fafc;border-radius:14px;padding:18px 20px;margin:24px 0;"><strong style="display:block;margin-bottom:8px;color:#111;">선별 기준</strong><ul style="margin:0;padding-left:20px;">${criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">${listHeading}</h2>
<div class="cp9-curation-list">${cards}</div>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">이 큐레이션을 보는 기준</h2>
<p>${closingGuide}</p>
<h2 style="font-size:24px;margin:34px 0 14px;color:#111;">구매 전 체크</h2>
<p>${purchaseCheck}</p>
<p style="font-size:13px;color:#666;margin-top:28px;">${DISCLOSURE}</p>
${itemListJsonLd}
</article>`

  return { title, slug, content }
}

async function wpFetch({ siteUrl, authHeader, endpoint, options = {} }) {
  const response = await fetch(`${siteUrl.replace(/\/+$/, '')}/wp-json/wp/v2${endpoint}`, {
    ...options,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`wordpress ${response.status}: ${text.slice(0, 600)}`)
  return text ? JSON.parse(text) : null
}

async function renderThumbnailToJpeg(title, imageUrl) {
  const requireFromFrontend = createRequire(path.join(process.cwd(), 'frontend/package.json'))
  const { chromium } = requireFromFrontend('playwright')
  const html = renderThumbnailHtml({ title, imageUrl, imageAlt: title })
  const htmlPath = path.join(os.tmpdir(), `cp9-publish-thumbnail-${Date.now()}.html`)
  const outputPath = path.join(os.tmpdir(), `cp9-publish-thumbnail-${Date.now()}.jpg`)
  fs.writeFileSync(htmlPath, html)

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }))
  if (metrics.scrollWidth > 1200 || metrics.scrollHeight > 630) {
    await browser.close()
    throw new Error(`thumbnail overflow: ${metrics.scrollWidth}x${metrics.scrollHeight}`)
  }
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 88 })
  await browser.close()
  fs.unlinkSync(htmlPath)
  return outputPath
}

async function uploadMedia({ siteUrl, authHeader, filePath, filename, altText }) {
  const response = await fetch(`${siteUrl.replace(/\/+$/, '')}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: fs.readFileSync(filePath),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`wordpress media ${response.status}: ${text.slice(0, 600)}`)
  const media = JSON.parse(text)
  await wpFetch({
    siteUrl,
    authHeader,
    endpoint: `/media/${media.id}`,
    options: { method: 'POST', body: JSON.stringify({ alt_text: altText }) },
  })
  return media
}

function slugifyAscii(value) {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `image-${Date.now()}`
}

function deepdiveLayerTitle(articleTitle, index) {
  if (index === 0) return '세척력보다 먼저 볼 것'
  if (index === 1) return '설치와 동선이 만족도를 바꿉니다'
  if (index === 2) return '브랜드 이미지는 사용 장면에서 완성됩니다'
  return '구매 전 확인할 현실 조건'
}

async function uploadDeepdiveLayeredImages(env, authHeader, article) {
  if (!article.auxiliaryImages?.length) return article
  const siteUrl = env.WORDPRESS_SITE_URL
  const uploadedImages = []

  for (const [index, image] of article.auxiliaryImages.entries()) {
    const layeredPath = await renderLayeredPexelsImage(image, {
      label: 'DEEP DIVE REPORT',
      title: deepdiveLayerTitle(article.title, index),
      subtitle: image.caption,
    })
    try {
      const media = await uploadMedia({
        siteUrl,
        authHeader,
        filePath: layeredPath,
        filename: `cp9-deepdive-${slugifyAscii(image.query)}-${index + 1}.jpg`,
        altText: `${article.title} - ${image.caption}`,
      })
      uploadedImages.push({
        ...image,
        mediaId: media.id,
        renderedUrl: media.source_url,
        layerTitle: deepdiveLayerTitle(article.title, index),
        layerSubtitle: image.caption,
      })
    } finally {
      if (fs.existsSync(layeredPath)) fs.unlinkSync(layeredPath)
    }
  }

  article.auxiliaryImages = uploadedImages
  article.content = enhanceDeepdiveWithLayeredImages(article.content, uploadedImages, { force: true }).html
  return article
}

async function publishPost(env, article, products, candidate) {
  const siteUrl = env.WORDPRESS_SITE_URL
  const authHeader = `Basic ${Buffer.from(`${env.WORDPRESS_USERNAME}:${env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`
  if (candidate.articleType === 'deepdive') {
    await uploadDeepdiveLayeredImages(env, authHeader, article)
  }
  const thumbnailPath = await renderThumbnailToJpeg(article.title, products[0].image)
  const media = await uploadMedia({
    siteUrl,
    authHeader,
    filePath: thumbnailPath,
    filename: `cp9-${article.slug}.jpg`,
    altText: article.title,
  })
  fs.unlinkSync(thumbnailPath)

  const post = await wpFetch({
    siteUrl,
    authHeader,
    endpoint: '/posts',
    options: {
      method: 'POST',
      body: JSON.stringify({
        title: article.title,
        slug: article.slug,
        content: article.content,
        status: env.WP_AUTOPUBLISH_STATUS || 'publish',
        excerpt: `${candidate.keyword} 기준과 상품 후보를 정리한 쿠팡 파트너스 글입니다.`,
        categories: [Number(env.WORDPRESS_CP_CATEGORY_ID || DEFAULT_CP_CATEGORY_ID)],
        featured_media: media.id,
      }),
    },
  })

  return { post, media }
}

async function updatePost(env, article, postId) {
  const siteUrl = env.WORDPRESS_SITE_URL
  const authHeader = `Basic ${Buffer.from(`${env.WORDPRESS_USERNAME}:${env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`
  await uploadDeepdiveLayeredImages(env, authHeader, article)
  const post = await wpFetch({
    siteUrl,
    authHeader,
    endpoint: `/posts/${postId}`,
    options: {
      method: 'POST',
      body: JSON.stringify({
        title: article.title,
        content: article.content,
        status: env.WP_AUTOPUBLISH_STATUS || 'publish',
      }),
    },
  })
  return post
}

function loadJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return []
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(data)) throw new Error(`${filePath} must be a JSON array`)
  return data
}

function formatKstDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function updateRecords({ candidate, article, products, post, media }) {
  const candidatesPath = 'data/keyword-candidates.json'
  const historyPath = 'data/codex-publisher-history.json'
  const candidates = loadJsonArray(candidatesPath)
  const candidateRecord = candidates.find((item) => item.id === candidate.id)
  if (candidateRecord) {
    candidateRecord.status = 'published'
    candidateRecord.publishedAt = new Date().toISOString()
    candidateRecord.wordpressPostId = post.id
    candidateRecord.wordpressUrl = post.link
  }
  fs.writeFileSync(candidatesPath, `${JSON.stringify(candidates, null, 2)}\n`)

  const history = loadJsonArray(historyPath)
  history.push({
    id: candidate.id,
    date: formatKstDate(),
    keyword: candidate.keyword,
    articleType: candidate.articleType,
    status: 'published',
    platforms: {
      wordpress: {
        postId: post.id,
        url: post.link,
        status: post.status,
      },
      cafe: {
        status: 'skipped',
        reason: 'missing_cafe_env',
      },
    },
    productIds: products.map((product) => product.id),
    deepdiveAuxiliaryImages: article.auxiliaryImages || [],
  })
  fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`)
}

function markHistoryUpdated({ postId, article, products, candidate }) {
  const historyPath = 'data/codex-publisher-history.json'
  const history = loadJsonArray(historyPath)
  const entry = history.find((item) => item.wordpress?.postId === postId || item.platforms?.wordpress?.postId === postId)
  if (entry) {
    entry.title = article.title
    entry.updatedAt = new Date().toISOString()
    entry.qualityUpdatedAt = entry.updatedAt
    entry.productIds = products.map((product) => product.id)
    delete entry.products
  }
  fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`)
}

function selectCandidate(options) {
  const candidates = loadJsonArray('data/keyword-candidates.json')
  if (options.postId) {
    const history = loadJsonArray('data/codex-publisher-history.json')
    const entry = history.find((item) => item.wordpress?.postId === options.postId || item.platforms?.wordpress?.postId === options.postId)
    if (!entry) throw new Error(`history entry not found for post id ${options.postId}`)
    return {
      id: entry.id,
      keyword: entry.keyword,
      articleType: options.type || entry.articleType,
      category: entry.category,
    }
  }
  const pending = candidates.filter((candidate) => candidate.status === 'pending')
  const candidate = options.candidateId
    ? pending.find((item) => item.id === options.candidateId)
    : pending.find((item) => item.articleType === options.type)

  if (!candidate) {
    throw new Error(`pending candidate not found: ${options.candidateId || options.type}`)
  }
  return candidate
}

function countKoreanContentChars(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
    .length
}

function stripHtmlText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countImages(html) {
  return (String(html || '').match(/<img\b/gi) || []).length
}

function assertNoInternalDataSourceWording(article) {
  const publicText = stripHtmlText(`${article.title || ''} ${article.content || ''}`)
  const forbiddenPatterns = [
    /\bAPI\b/i,
    /쿠팡\s*(?:파트너스\s*)?(?:상품\s*)?검색\s*API/i,
    /검색\s*API/i,
    /API\s*응답/i,
    /응답에\s*없으므로/i,
    /product(?:Image|Url|Price)/i,
  ]
  const matchedPattern = forbiddenPatterns.find((pattern) => pattern.test(publicText))
  if (matchedPattern) {
    throw new Error(`public content contains internal data-source wording: ${matchedPattern}`)
  }
}

function validateArticle(article, candidate) {
  if (!article.content.includes(DISCLOSURE)) throw new Error('disclosure missing')
  if (!article.content.includes('loading="lazy" decoding="async"')) throw new Error('lazy images missing')
  assertNoInternalDataSourceWording(article)
  if (/[:：]/.test(article.title || '')) throw new Error('title contains forbidden colon')
  const headingColon = findHeadingTextWithColon(article.content)
  if (headingColon) throw new Error('heading contains forbidden colon')
  const keyword = String(candidate.keyword || '').trim()
  if (keyword && !article.title.includes(keyword)) {
    throw new Error(`article title keyword mismatch: ${keyword}`)
  }
  if (candidate.articleType === 'top_3_5_compare') {
    const productSectionCount = (article.content.match(/class="cp9-top-product"/g) || []).length
    const productFactCount = (article.content.match(/class="cp9-product-facts"/g) || []).length
    if (productSectionCount < 3 || productSectionCount > 5) {
      throw new Error(`top compare product section count invalid: ${productSectionCount}`)
    }
    if (productFactCount < productSectionCount) throw new Error(`top compare product facts too low: ${productFactCount}`)
    for (const required of ['핵심 판단', '좋은 점', '조심할 점', '추천 대상', '구매 전 체크', 'cp9-mobile-compare:start']) {
      if (!article.content.includes(required)) throw new Error(`top compare requirement missing: ${required}`)
    }
  }
  const contentChars = countKoreanContentChars(article.content)
  if (candidate.articleType === 'deepdive' && contentChars < 8000) {
    throw new Error(`deepdive content too short: ${contentChars}`)
  }
  if (candidate.articleType === 'deepdive') {
    const imageCount = countImages(article.content)
    const productFactCount = (article.content.match(/class="cp9-product-facts"/g) || []).length
    const pexelsVisualCount = (article.content.match(/class="cp9-deepdive-visual"/g) || []).length
    const preparedPexelsCount = Array.isArray(article.auxiliaryImages) ? article.auxiliaryImages.length : 0
    if (/pexels\.com|images\.pexels\.com/i.test(article.content)) {
      throw new Error('deepdive public content must not link to or load Pexels directly')
    }
    if (imageCount < 3) {
      throw new Error(`deepdive product image count too low: ${imageCount}`)
    }
    if (productFactCount < 3) throw new Error(`deepdive product facts too low: ${productFactCount}`)
    if (!article.content.includes('cp9-report-brief')) throw new Error('deepdive report brief missing')
    if (Math.max(pexelsVisualCount, preparedPexelsCount) < 3) {
      throw new Error(`deepdive pexels visual count too low: ${Math.max(pexelsVisualCount, preparedPexelsCount)}`)
    }
  }
  if (candidate.articleType === 'curation_20') {
    const cardCount = (article.content.match(/class="cp9-curation-card"/g) || []).length
    const productFactCount = (article.content.match(/class="cp9-product-facts"/g) || []).length
    if (cardCount < 20) throw new Error(`curation card count too low: ${cardCount}`)
    if (productFactCount < 20) throw new Error(`curation product facts too low: ${productFactCount}`)
  }
  return { contentChars }
}

function notify(title, message) {
  const result = spawnSync('osascript', ['-e', `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`], {
    encoding: 'utf8',
  })
  return {
    ok: result.status === 0,
    status: result.status,
    stderr: result.stderr ? result.stderr.trim() : '',
  }
}

async function main() {
  const options = parseArgs(process.argv)
  if (!options.type && !options.candidateId && !options.postId) {
    usage()
    throw new Error('missing --type or --candidate')
  }

  const env = loadEnv('frontend/.env.local')
  requireEnv(env, ['WORDPRESS_SITE_URL', 'WORDPRESS_USERNAME', 'WORDPRESS_APP_PASSWORD', 'COUPANG_ACCESS_KEY', 'COUPANG_SECRET_KEY'])
  const candidate = selectCandidate(options)
  if (candidate.articleType === 'deepdive' && !env.PEXELS_API_KEY) {
    throw new Error('missing env: PEXELS_API_KEY is required for deepdive Pexels editorial images')
  }
  const products = await enrichProductsWithResearch(await collectProducts(env, candidate))
  const article = candidate.articleType === 'top_3_5_compare'
    ? buildTopCompareArticle(candidate, products)
    : candidate.articleType === 'curation_20'
    ? buildCurationArticle(candidate, products)
    : /식기세척기/.test(candidate.keyword || '')
      ? buildDishwasherDeepdiveArticle(candidate, products)
    : /선풍기|서큘레이터|손선풍기|휴대용선풍기|탁상용선풍기/.test(candidate.keyword || '')
      ? buildFanDeepdiveArticle(candidate, products)
    : /청소기/.test(candidate.keyword || '')
      ? buildCleanerDeepdiveArticle(candidate, products)
    : buildDeepdiveArticle(candidate, products)

  if (candidate.articleType === 'deepdive') {
    article.title = sanitizeTitleText(article.title)
    article.content = sanitizeHeadingColons(article.content)
    article.content = enhanceDeepdiveReportFormat(article.content, {
      title: article.title,
      keyword: candidate.keyword,
    }).html
    const pexels = await fetchDeepdivePexelsImages({
      apiKey: env.PEXELS_API_KEY,
      title: article.title,
      keyword: candidate.keyword,
      html: article.content,
    })
    article.auxiliaryImages = pexels.images
  }
  article.title = sanitizeTitleText(article.title)
  article.content = sanitizeHeadingColons(article.content)

  const validation = validateArticle(article, candidate)

  if (options.postId) {
    const post = await updatePost(env, article, options.postId)
    markHistoryUpdated({ postId: options.postId, article, products, candidate })
    const notification = notify('쿠팡 자동 발행', `WordPress 글 업데이트 완료: ${article.title}`)
    console.log(JSON.stringify({
      candidateId: candidate.id,
      articleType: candidate.articleType,
      postId: post.id,
      url: post.link,
      productCount: products.length,
      contentChars: validation.contentChars,
      notification,
      mode: 'updated',
    }, null, 2))
    return
  }

  const { post, media } = await publishPost(env, article, products, candidate)
  updateRecords({ candidate, article, products, post, media })
  const notification = notify('쿠팡 자동 발행', `WordPress 공개 발행 완료: ${article.title}`)
  console.log(JSON.stringify({
    candidateId: candidate.id,
    articleType: candidate.articleType,
    postId: post.id,
    url: post.link,
    mediaId: media.id,
    productCount: products.length,
    contentChars: validation.contentChars,
    notification,
    mode: 'published',
  }, null, 2))
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  const notification = notify('쿠팡 자동 발행 실패', message.slice(0, 180))
  console.error(message)
  if (!notification.ok) {
    console.error(`notification failed: ${notification.status} ${notification.stderr}`)
  }
  process.exit(1)
})
