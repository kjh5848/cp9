import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { renderThumbnailHtml } from './thumbnail-title.mjs'

function loadEnv(filePath) {
  const env = {}
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
  }
  return env
}

function stripTags(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
}

function getAttribute(html, name) {
  return html.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))?.[1] || ''
}

function getRepresentativeImage(content) {
  const imageTag = content.match(/<img\b[^>]*>/i)?.[0] || ''
  const src = getAttribute(imageTag, 'src')
  const dataSrc = getAttribute(imageTag, 'data-src')
  const imageUrl = src && !src.startsWith('data:') ? src : dataSrc
  const alt = getAttribute(imageTag, 'alt')
  if (!imageUrl) throw new Error('representative image not found')
  return { imageUrl, alt }
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
  if (!response.ok) throw new Error(`WordPress API ${response.status}: ${text.slice(0, 600)}`)
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
  if (altText) {
    await wpFetch({
      siteUrl,
      authHeader,
      endpoint: `/media/${media.id}`,
      options: { method: 'POST', body: JSON.stringify({ alt_text: altText }) },
    })
  }
  return media
}

async function renderJpeg({ html, outputPath }) {
  const requireFromFrontend = createRequire(path.join(process.cwd(), 'frontend/package.json'))
  const { chromium } = requireFromFrontend('playwright')
  const htmlPath = path.join(os.tmpdir(), `cp9-thumbnail-${Date.now()}.html`)
  fs.writeFileSync(htmlPath, html)

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }))
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 88 })
  await browser.close()
  fs.unlinkSync(htmlPath)

  if (metrics.scrollWidth > 1200 || metrics.scrollHeight > 630) {
    throw new Error(`thumbnail overflow: ${metrics.scrollWidth}x${metrics.scrollHeight}`)
  }
}

async function main() {
  const postId = Number(process.argv[2])
  if (!Number.isInteger(postId) || postId <= 0) {
    throw new Error('Usage: node tools/codex-publisher/update-wp-thumbnail.mjs <postId>')
  }

  const env = loadEnv('frontend/.env.local')
  const siteUrl = env.WORDPRESS_SITE_URL
  const authHeader = `Basic ${Buffer.from(`${env.WORDPRESS_USERNAME}:${env.WORDPRESS_APP_PASSWORD}`).toString('base64')}`
  const post = await wpFetch({ siteUrl, authHeader, endpoint: `/posts/${postId}?context=edit` })
  const title = stripTags(post.title?.raw || post.title?.rendered)
  const { imageUrl, alt } = getRepresentativeImage(post.content?.raw || '')
  const html = renderThumbnailHtml({ title, imageUrl, imageAlt: alt || title })
  const outputPath = path.join(os.tmpdir(), `cp9-thumbnail-${postId}-${Date.now()}.jpg`)

  await renderJpeg({ html, outputPath })
  const media = await uploadMedia({
    siteUrl,
    authHeader,
    filePath: outputPath,
    filename: `cp9-thumbnail-${postId}.jpg`,
    altText: title,
  })
  await wpFetch({
    siteUrl,
    authHeader,
    endpoint: `/posts/${postId}`,
    options: { method: 'POST', body: JSON.stringify({ featured_media: media.id }) },
  })
  fs.unlinkSync(outputPath)

  console.log(JSON.stringify({ postId, mediaId: media.id, source_url: media.source_url }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
