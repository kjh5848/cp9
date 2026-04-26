const PURPOSE_MAP = [
  { pattern: /추천\s*TOP\s*\d+/i, label: '구매 전 빠른 비교' },
  { pattern: /고르는 법|가이드|딥다이브/i, label: '구매 기준 가이드' },
  { pattern: /\d+\s*가지|큐레이션/i, label: '필수템 큐레이션' },
]

function normalizeTitle(title) {
  return String(title || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*/g, ': ')
    .trim()
}

function extractBadge(text) {
  const patterns = [
    /TOP\s*\d+/i,
    /\d+\s*가지/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return {
        badge: match[0].replace(/\s+/g, ' ').toUpperCase(),
        text: text.replace(match[0], '').replace(/\s+/g, ' ').trim(),
      }
    }
  }

  return { badge: '', text }
}

function removeTrailingGuideWords(text) {
  return text
    .replace(/\s*기준으로\s*고르는\s*법\s*$/g, ' 기준')
    .replace(/\s*고르는\s*법\s*$/g, '')
    .replace(/\s*추천\s*$/g, ' 추천')
    .trim()
}

function splitByLength(text, maxChars) {
  const normalized = removeTrailingGuideWords(text)
  if (normalized.length <= maxChars) return [normalized]

  const words = normalized.split(' ')
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }

    if (current) lines.push(current)
    if (word.length > maxChars) {
      const chunks = word.match(new RegExp(`.{1,${maxChars}}`, 'g')) || [word]
      lines.push(...chunks.slice(0, -1))
      current = chunks.at(-1) || ''
    } else {
      current = word
    }
  }

  if (current) lines.push(current)
  return lines
}

function prioritizeLines(lines, maxLines) {
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  const overflow = lines.slice(maxLines).join(' ')
  kept[maxLines - 1] = `${kept[maxLines - 1]} ${overflow}`.trim()
  return kept
}

export function buildThumbnailTitle(title) {
  const normalized = normalizeTitle(title)
  const [rawMain, rawSub = ''] = normalized.split(/:\s*/, 2)
  const mainBadge = extractBadge(rawMain)
  const subBadge = extractBadge(rawSub)
  const badge = mainBadge.badge || subBadge.badge

  const main = removeTrailingGuideWords(mainBadge.text)
  const subtitle = removeTrailingGuideWords(subBadge.text || rawSub)
  const eyebrow = PURPOSE_MAP.find((item) => item.pattern.test(normalized))?.label || '구매 전 체크포인트'

  const titleLines = prioritizeLines(splitByLength(main, 13), 2)
  const subtitleLines = prioritizeLines(splitByLength(subtitle, 15), titleLines.length >= 2 ? 1 : 2)
  const mainVisualLength = Math.max(
    ...titleLines.map((line, index) => visualLength(`${line}${index === titleLines.length - 1 ? ` ${badge}` : ''}`)),
    0,
  )
  const subVisualLength = Math.max(...subtitleLines.map(visualLength), 0)
  const maxVisualLength = Math.max(mainVisualLength, subVisualLength)
  const fontSize = maxVisualLength > 28 ? 50 : maxVisualLength > 24 ? 54 : maxVisualLength > 20 ? 58 : 64

  return {
    eyebrow,
    badge,
    titleLines,
    subtitleLines,
    fontSize,
  }
}

function visualLength(value) {
  return [...String(value || '')].reduce((sum, char) => {
    return sum + (/[가-힣·]/.test(char) ? 2 : char === ' ' ? 0.8 : 1)
  }, 0)
}

export function renderThumbnailHtml({
  title,
  imageUrl,
  imageAlt,
  tags = ['가격', '사진', '바로가기'],
}) {
  const model = buildThumbnailTitle(title)
  const subtitleHtml = model.subtitleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join('')
  const tagHtml = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')
  const titleHtml = model.titleLines
    .map((line, index) => {
      const badgeHtml = model.badge && index === model.titleLines.length - 1
        ? `<strong>${escapeHtml(model.badge)}</strong>`
        : ''
      return `<div class="row"><span>${escapeHtml(line)}</span>${badgeHtml}</div>`
    })
    .join('')

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} 썸네일</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:"Pretendard","Noto Sans KR",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f6f7f9;color:#101828}
    .canvas{width:1200px;height:630px;padding:56px 64px;background:#f6f7f9}
    .card{width:100%;height:100%;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:58px;align-items:center;padding:64px 72px;border:2px solid #d8dee8;border-radius:34px;background:#fff;box-shadow:0 18px 60px rgba(15,23,42,.08)}
    .eyebrow{display:inline-block;padding:10px 18px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#344054;font-size:24px;font-weight:850;letter-spacing:-.04em}
    .headline{margin:32px 0 0;display:flex;flex-direction:column;gap:6px;color:#101828;font-weight:950;font-size:${model.fontSize}px;line-height:1.08;letter-spacing:-.065em;word-break:keep-all}
    .headline .row{display:flex;align-items:baseline;gap:18px;min-width:0;white-space:nowrap}
    .headline strong{display:inline-block;white-space:nowrap;color:#ff5a00;font:inherit}
    .headline span{display:block;white-space:nowrap}
    .subtitle{margin-top:12px;display:flex;flex-direction:column;gap:4px;color:#101828;font-weight:950;font-size:${Math.max(model.fontSize - 6, 48)}px;line-height:1.08;letter-spacing:-.065em}
    .subtitle span{display:block;white-space:nowrap}
    .tags{display:flex;gap:12px;margin-top:30px}
    .tags span{padding:11px 16px;border-radius:12px;background:#f1f5f9;color:#111827;font-size:22px;font-weight:850;letter-spacing:-.04em}
    .product{display:grid;place-items:center;width:320px;height:320px;border:1px solid #edf0f5;border-radius:28px;background:#fff}
    .product img{display:block;width:260px;height:260px;object-fit:contain}
  </style>
</head>
<body>
  <main class="canvas">
    <section class="card">
      <div>
        <div class="eyebrow">${escapeHtml(model.eyebrow)}</div>
        <div class="headline">${titleHtml}</div>
        ${subtitleHtml ? `<div class="subtitle">${subtitleHtml}</div>` : ''}
        <div class="tags">${tagHtml}</div>
      </div>
      <div class="product"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt || title)}" /></div>
    </section>
  </main>
</body>
</html>`
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

if ((process.argv[1] || '').endsWith('thumbnail-title.mjs')) {
  const title = process.argv.slice(2).join(' ')
  console.log(JSON.stringify(buildThumbnailTitle(title), null, 2))
}
