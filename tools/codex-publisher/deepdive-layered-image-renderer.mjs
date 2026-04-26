import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function splitTitle(value) {
  const text = String(value || '').replace(/[:：]/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= 26) return [text]
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > 23 && line) {
      lines.push(line)
      line = word
    } else {
      line = `${line} ${word}`.trim()
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

function renderLayerHtml({ imageUrl, label, title, subtitle }) {
  const titleLines = splitTitle(title).map((line) => `<span>${escapeHtml(line)}</span>`).join('')
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<style>
*{box-sizing:border-box}
body{margin:0;width:1200px;height:700px;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;background:#111827}
.frame{position:relative;width:1200px;height:700px;overflow:hidden;background:#111827}
.photo{position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(3,7,18,.86) 0%,rgba(15,23,42,.68) 42%,rgba(15,23,42,.18) 100%),url("${escapeHtml(imageUrl)}");background-size:cover;background-position:center}
.grain{position:absolute;inset:0;background:radial-gradient(circle at 24% 28%,rgba(255,255,255,.12),transparent 30%),linear-gradient(180deg,rgba(255,255,255,.08),transparent 40%);mix-blend-mode:screen}
.content{position:absolute;left:70px;right:70px;bottom:64px;color:#fff}
.label{display:inline-flex;align-items:center;gap:10px;min-height:34px;padding:0 13px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(10px);font-size:16px;font-weight:900;letter-spacing:-.03em}
.title{display:flex;flex-direction:column;gap:4px;margin:18px 0 14px;font-size:48px;line-height:1.09;font-weight:930;letter-spacing:-.065em;text-shadow:0 6px 22px rgba(0,0,0,.34)}
.title span{display:block}
.subtitle{max-width:780px;margin:0;color:#e5e7eb;font-size:22px;line-height:1.5;font-weight:720;letter-spacing:-.04em;text-shadow:0 4px 16px rgba(0,0,0,.3)}
.bar{width:64px;height:6px;border-radius:999px;background:#ff5a00;margin-top:24px;box-shadow:0 0 0 7px rgba(255,90,0,.14)}
</style>
</head>
<body>
<div class="frame">
  <div class="photo"></div>
  <div class="grain"></div>
  <div class="content">
    <div class="label">${escapeHtml(label || 'DEEP DIVE REPORT')}</div>
    <div class="title">${titleLines}</div>
    <p class="subtitle">${escapeHtml(subtitle || '')}</p>
    <div class="bar"></div>
  </div>
</div>
</body>
</html>`
}

export async function renderLayeredPexelsImage(image, options = {}) {
  const requireFromFrontend = createRequire(path.join(process.cwd(), 'frontend/package.json'))
  const { chromium } = requireFromFrontend('playwright')
  const html = renderLayerHtml({
    imageUrl: image.imageUrl,
    label: options.label || 'DEEP DIVE REPORT',
    title: options.title || image.layerTitle || image.caption || image.alt,
    subtitle: options.subtitle || image.layerSubtitle || image.caption,
  })
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const htmlPath = path.join(os.tmpdir(), `cp9-deepdive-layer-${stamp}.html`)
  const outputPath = path.join(os.tmpdir(), `cp9-deepdive-layer-${stamp}.jpg`)
  fs.writeFileSync(htmlPath, html)

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, deviceScaleFactor: 1 })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }))
  if (metrics.scrollWidth > 1200 || metrics.scrollHeight > 700) {
    await browser.close()
    throw new Error(`deepdive layered image overflow: ${metrics.scrollWidth}x${metrics.scrollHeight}`)
  }
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 88 })
  await browser.close()
  fs.unlinkSync(htmlPath)
  return outputPath
}
