import fs from 'node:fs'
import path from 'node:path'
import { enhanceFirstComparisonTable } from './mobile-compare-table.mjs'
import { enhanceDeepdiveWithLayeredImages, fetchDeepdivePexelsImages } from './deepdive-pexels-images.mjs'
import { enhanceDeepdiveReportFormat } from './deepdive-report-format.mjs'
import { renderLayeredPexelsImage } from './deepdive-layered-image-renderer.mjs'

function loadEnv(filePath) {
  const env = {}
  const text = fs.readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

function getHistoryPosts(historyPath, explicitPostIds) {
  if (explicitPostIds.length) {
    return explicitPostIds.map((postId) => ({ postId, label: String(postId), articleType: '' }))
  }

  const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'))
  const entries = Array.isArray(history) ? history : history.history || history.items || []
  const seen = new Set()
  const posts = []

  for (const entry of entries) {
    const postId = entry.platforms?.wordpress?.postId || entry.wordpress?.postId || entry.wordpressPostId || entry.postId
    if (!postId || seen.has(postId)) continue
    seen.add(postId)
    posts.push({
      postId,
      label: entry.id || entry.keyword || entry.platforms?.wordpress?.url || String(postId),
      articleType: entry.articleType || '',
    })
  }

  return posts
}

function stripHtmlText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getAttribute(html, name) {
  return html.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))?.[1] || ''
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

function sanitizePublicWording(html) {
  let next = String(html || '')

  next = next.replace(
    /쿠팡 상품 검색 API에서 확인 가능한 상품명, 가격, 이미지, 링크, 배송 신호를 기준으로 선별했고, 리뷰 수와 평점은 검색 응답에 없으므로 필수 게이트로 사용하지 않았습니다\./g,
    '작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 배송 조건을 기준으로 선별했고, 리뷰 수와 평점은 공개 본문에서 확인되지 않은 수치로 과장하지 않았습니다.',
  )
  next = next.replace(
    /이번 선별은 쿠팡 상품 검색 API에서 확인 가능한 상품명, 가격, 이미지, 파트너스 링크, 배송 신호를 기준으로 했고, 리뷰 수와 평점은 검색 응답에 없으므로 필수 게이트로 사용하지 않았습니다\./g,
    '이번 선별은 작성 시점에 확인 가능한 상품명, 가격, 이미지, 파트너스 링크, 배송 조건을 기준으로 했고, 리뷰 수와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않았습니다.',
  )
  next = next.replace(
    /쿠팡 상품 검색 API에서 확인 가능한 가격, 이미지, 파트너스 링크, 카테고리, 로켓배송 및 무료배송 표시를 기준으로 걸러낸 후보입니다\. 쿠팡 검색 API 응답에는 리뷰 수와 평점 필드가 없으므로, 이번 비교에서는 리뷰\/평점을 필수 게이트로 쓰지 않았습니다\./g,
    '작성 시점에 확인 가능한 가격, 이미지, 파트너스 링크, 카테고리, 로켓배송 및 무료배송 표시를 기준으로 걸러낸 후보입니다. 리뷰와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않고, 상세 페이지의 최신 후기와 스펙 확인으로 보완해야 합니다.',
  )
  next = next.replace(
    /아래 제품들은 쿠팡 상품 검색 API에서 확인 가능한 [^.。]+?후보입니다\.\s*쿠팡 검색 API 응답에는 [^.。]+?\./g,
    '아래 제품들은 작성 시점에 확인 가능한 가격, 이미지, 파트너스 링크, 카테고리, 로켓배송 및 무료배송 표시를 기준으로 걸러낸 후보입니다. 리뷰와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않고, 상세 페이지의 최신 후기와 스펙 확인으로 보완해야 합니다.',
  )
  next = next.replace(
    /쿠팡 파트너스 상품 검색 API에서 확인 가능한 상품명, 가격, 상품 이미지, 파트너스 링크, 로켓배송과 무료배송 신호를 기준으로 선별했습니다\. 리뷰 수와 평점은 이 API 응답에 없으므로 필수 (?:게이트로|조건으로) 쓰지 않았고,/g,
    '작성 시점에 확인 가능한 상품명, 가격, 상품 이미지, 파트너스 링크, 로켓배송과 무료배송 조건을 기준으로 선별했습니다. 리뷰 수와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않았고,',
  )
  next = next.replace(
    /쿠팡 파트너스 상품 검색 API에서 확인 가능한 상품명, 가격, 상품 이미지, 파트너스 링크, 로켓배송과 무료배송 신호를 기준으로 선별했습니다\./g,
    '작성 시점에 확인 가능한 상품명, 가격, 상품 이미지, 파트너스 링크, 로켓배송과 무료배송 조건을 기준으로 선별했습니다.',
  )
  next = next.replace(
    /쿠팡 검색 API에서 확인 가능한 상품명, 가격, 이미지, 링크, 배송 신호를 바탕으로 20개를 선별했습니다\. 리뷰와 평점은 검색 응답에 없으므로 과장된 만족도 표현은 배제했습니다\./g,
    '작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 배송 조건을 바탕으로 20개를 선별했습니다. 리뷰와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않고, 과장된 만족도 표현은 배제했습니다.',
  )
  next = next.replace(
    /다만 이번 자동화는 쿠팡 상품 검색 API 기준으로 상품명, 가격, 이미지, 링크, 배송 신호만 확인하므로 리뷰 수와 평점을 필수 게이트로 쓰지 않았습니다\. 건조 만족도는 별도 검증 가능한 출처가 있을 때만 추가 판단으로 삼아야 합니다\./g,
    '작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 배송 조건을 기본 기준으로 삼고, 확인되지 않은 리뷰 수와 평점은 본문에서 단정하지 않습니다. 건조 만족도는 상세 페이지와 최신 후기를 함께 보며 판단해야 합니다.',
  )
  next = next.replace(
    /리뷰 수와 평점은 쿠팡 상품 검색 API 응답에 없으므로 이 자동화에서는 필수 게이트로 사용하지 않았습니다\./g,
    '리뷰 수와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않고, 최신 후기와 상세 스펙을 함께 확인하는 방식으로 보완해야 합니다.',
  )
  next = next.replace(
    /쿠팡 검색 API 응답에는 리뷰 수와 평점 필드가 없으므로,?[^.。]*\./g,
    '리뷰와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않고, 상세 페이지의 최신 후기와 스펙 확인으로 보완해야 합니다.',
  )
  next = next.replace(
    /리뷰 수와 평점은 이 API 응답에 없으므로[^.。]*,/g,
    '리뷰 수와 평점은 공개 본문에서 확인되지 않은 수치로 단정하지 않았고,',
  )
  next = next.replace(/쿠팡 검색 API만으로는/g, '온라인 상품 정보만으로는')
  next = next.replace(/검색 API만으로는/g, '온라인 상품 정보만으로는')

  return next
}

function extractProductCards(html, limit = 4) {
  const cards = []
  const seen = new Set()
  const imagePattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>\s*<img\b[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi

  for (const match of html.matchAll(imagePattern)) {
    const url = match[1]
    const image = match[2]
    const name = match[3]
    if (!url || !image || !name || seen.has(image)) continue
    seen.add(image)
    cards.push({ url, image, name })
    if (cards.length >= limit) break
  }

  if (cards.length >= 3) return cards

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const image = getAttribute(tag, 'src')
    const name = getAttribute(tag, 'alt') || '대표 상품 이미지'
    if (!image || seen.has(image)) continue
    seen.add(image)
    cards.push({ url: '', image, name })
    if (cards.length >= limit) break
  }

  return cards
}

function buildDeepdiveGallery(cards) {
  const items = cards.map((card, index) => {
    const image = `<img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}" loading="lazy" style="display:block;width:100%;height:150px;object-fit:contain;border:1px solid #edf0f5;border-radius:16px;padding:10px;background:#fff;margin:0 0 10px;" />`
    const imageBlock = card.url
      ? `<a href="${escapeHtml(card.url)}" target="_blank" rel="noopener sponsored" style="display:block;text-decoration:none;">${image}</a>`
      : image
    const link = card.url
      ? `<a href="${escapeHtml(card.url)}" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0 14px;border-radius:999px;background:#ff5a00;color:#fff;text-decoration:none;font-size:13px;font-weight:900;">가격 확인</a>`
      : ''

    return `<article style="border:1px solid #e5e7eb;border-radius:18px;padding:14px;background:#fff;">
${imageBlock}
<strong style="display:block;font-size:15px;line-height:1.45;color:#111;margin:0 0 10px;word-break:keep-all;overflow-wrap:anywhere;">${index + 1}. ${escapeHtml(card.name)}</strong>
${link}
</article>`
  }).join('\n')

  return `<section class="cp9-deepdive-product-gallery" style="border:1px solid #e5e7eb;border-radius:20px;padding:18px;background:#f8fafc;margin:28px 0;">
<h2 style="font-size:22px;line-height:1.35;margin:0 0 14px;color:#111;">대표 상품 이미지로 빠르게 보기</h2>
<p style="margin:0 0 16px;color:#475467;">딥다이브 본문은 브랜드와 사용 맥락을 중심으로 읽고, 아래 이미지는 실제 구매 후보의 크기감과 디자인을 빠르게 확인하는 용도로 보세요.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;">${items}</div>
</section>`
}

function ensureDeepdiveImages(html, articleType) {
  if (articleType !== 'deepdive' && !/딥다이브|브랜드 철학|브랜드 이미지|대표 아이템/.test(stripHtmlText(html))) {
    return { html, changed: false, imageCount: (html.match(/<img\b/gi) || []).length }
  }

  const imageCount = (html.match(/<img\b/gi) || []).length
  if (html.includes('cp9-deepdive-product-gallery')) {
    return { html, changed: false, imageCount }
  }

  const cards = extractProductCards(html)
  if (cards.length < 3) {
    return { html, changed: false, imageCount, reason: `not_enough_images:${cards.length}` }
  }

  const gallery = buildDeepdiveGallery(cards)
  const insertionPoint = html.indexOf('<h2')
  if (insertionPoint === -1) {
    return { html: `${gallery}\n${html}`, changed: true, imageCount: imageCount + cards.length }
  }

  return {
    html: `${html.slice(0, insertionPoint)}${gallery}\n${html.slice(insertionPoint)}`,
    changed: true,
    imageCount: imageCount + cards.length,
  }
}

async function ensureDeepdiveVisuals(html, articleType, env, title, keyword, authHeader, force = false) {
  if (articleType !== 'deepdive' && !/딥다이브|브랜드 철학|브랜드 이미지|대표 아이템|주방 루틴|사용 맥락/.test(stripHtmlText(html))) {
    return { html, changed: false, count: 0 }
  }

  let next = enhanceDeepdiveReportFormat(html, { title, keyword }).html
  const visuals = await fetchDeepdivePexelsImages({
    apiKey: env.PEXELS_API_KEY,
    title,
    keyword,
    html: next,
  })
  if (visuals.images.length < 3) {
    return { html: next, changed: next !== html, count: visuals.images.length, reason: visuals.reason }
  }

  const uploadedImages = []
  for (const [index, image] of visuals.images.entries()) {
    const layeredPath = await renderLayeredPexelsImage(image, {
      label: 'DEEP DIVE REPORT',
      title: layerTitle(title, index),
      subtitle: image.caption,
    })
    try {
      const media = await uploadMedia({
        siteUrl: env.WORDPRESS_SITE_URL,
        authHeader,
        filePath: layeredPath,
        filename: `cp9-deepdive-${slugifyAscii(image.query)}-${index + 1}.jpg`,
        altText: `${title} - ${image.caption}`,
      })
      uploadedImages.push({
        ...image,
        mediaId: media.id,
        renderedUrl: media.source_url,
        layerTitle: layerTitle(title, index),
        layerSubtitle: image.caption,
      })
    } finally {
      if (fs.existsSync(layeredPath)) fs.unlinkSync(layeredPath)
    }
  }
  const layered = enhanceDeepdiveWithLayeredImages(next, uploadedImages, { force })
  return {
    html: layered.html,
    changed: layered.html !== html,
    count: uploadedImages.length,
    reason: '',
  }
}

function assertNoForbiddenPublicText(html) {
  const text = stripHtmlText(html)
  const forbiddenPatterns = [
    /\bAPI\b/i,
    /검색\s*API/i,
    /API\s*응답/i,
    /응답에\s*없으므로/i,
    /product(?:Image|Url|Price)/i,
  ]
  const matchedPattern = forbiddenPatterns.find((pattern) => pattern.test(text))
  if (matchedPattern) {
    const snippet = text.match(new RegExp(`.{0,80}${matchedPattern.source}.{0,120}`, matchedPattern.flags.replace('g', '')))?.[0] || ''
    throw new Error(`forbidden public wording remains: ${matchedPattern}; snippet=${snippet}`)
  }
}

async function wpFetch({ siteUrl, authHeader, endpoint, options = {} }) {
  const response = await fetch(`${siteUrl.replace(/\/+$/, '')}/wp-json/wp/v2${endpoint}`, {
    ...options,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`WordPress ${response.status}: ${text.slice(0, 600)}`)
  return text ? JSON.parse(text) : null
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
  if (!response.ok) throw new Error(`WordPress media ${response.status}: ${text.slice(0, 600)}`)
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

function layerTitle(title, index) {
  if (index === 0) return '세척력보다 먼저 볼 것'
  if (index === 1) return '설치와 동선이 만족도를 바꿉니다'
  if (index === 2) return '브랜드 이미지는 사용 장면에서 완성됩니다'
  return '구매 전 확인할 현실 조건'
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const force = args.includes('--force')
  const explicitPostIds = args.filter((arg) => /^\d+$/.test(arg)).map(Number)

  const cwd = process.cwd()
  const env = loadEnv(path.join(cwd, 'frontend/.env.local'))
  const siteUrl = env.WORDPRESS_SITE_URL
  const username = env.WORDPRESS_USERNAME
  const appPassword = env.WORDPRESS_APP_PASSWORD
  if (!siteUrl || !username || !appPassword) throw new Error('Missing WordPress environment values')

  const authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`
  const posts = getHistoryPosts(path.join(cwd, 'data/codex-publisher-history.json'), explicitPostIds)
  const results = []

  for (const post of posts) {
    const current = await wpFetch({ siteUrl, authHeader, endpoint: `/posts/${post.postId}?context=edit` })
    const raw = current.content?.raw || ''
    let next = sanitizePublicWording(raw)
    next = sanitizeHeadingColons(next)
    const changes = []

    if (next !== raw) changes.push('sanitize_public_wording')

    const enhanced = enhanceFirstComparisonTable(next, { force })
    if (enhanced.changed) {
      next = enhanced.html
      changes.push(`mobile_compare:${enhanced.rowCount}`)
    }

    const deepdive = ensureDeepdiveImages(next, post.articleType)
    if (deepdive.changed) {
      next = deepdive.html
      changes.push(`deepdive_gallery:${deepdive.imageCount}`)
    } else if (deepdive.reason) {
      changes.push(deepdive.reason)
    }

    const title = sanitizeTitleText(current.title?.rendered || post.label)
    const visuals = await ensureDeepdiveVisuals(next, post.articleType, env, title, post.label, authHeader, force)
    if (visuals.changed) {
      next = visuals.html
      changes.push(`deepdive_pexels_report:${visuals.count}`)
    } else if (visuals.reason) {
      changes.push(visuals.reason)
    }

    try {
      assertNoForbiddenPublicText(next)
    } catch (error) {
      throw new Error(`post ${post.postId} ${post.label}: ${error instanceof Error ? error.message : String(error)}`)
    }

    if (changes.length && !dryRun) {
      await wpFetch({
        siteUrl,
        authHeader,
        endpoint: `/posts/${post.postId}`,
        options: { method: 'POST', body: JSON.stringify({ title, content: next }) },
      })
    }

    results.push({
      postId: post.postId,
      label: post.label,
      articleType: post.articleType,
      status: changes.length ? (dryRun ? 'dry-run' : 'updated') : 'skipped',
      changes,
    })
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
