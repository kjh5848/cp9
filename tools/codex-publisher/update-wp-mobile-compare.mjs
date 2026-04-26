import fs from 'node:fs'
import path from 'node:path'
import { enhanceFirstComparisonTable } from './mobile-compare-table.mjs'

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
    return explicitPostIds.map((postId) => ({ postId, label: String(postId) }))
  }

  const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'))
  const entries = Array.isArray(history) ? history : history.history || history.items || []

  return entries
    .map((entry) => ({
      postId: entry.wordpress?.postId,
      label: entry.id || entry.title || entry.wordpress?.url || String(entry.wordpress?.postId),
    }))
    .filter((entry) => entry.postId)
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

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`WordPress API ${response.status}: ${text}`)
  }

  return response.json()
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

  if (!siteUrl || !username || !appPassword) {
    throw new Error('Missing WordPress environment values')
  }

  const authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`
  const posts = getHistoryPosts(path.join(cwd, 'data/codex-publisher-history.json'), explicitPostIds)
  const results = []

  for (const post of posts) {
    const current = await wpFetch({
      siteUrl,
      authHeader,
      endpoint: `/posts/${post.postId}?context=edit`,
    })

    const raw = current.content?.raw || ''
    const enhanced = enhanceFirstComparisonTable(raw, { force })
    if (!enhanced.changed) {
      results.push({ postId: post.postId, label: post.label, status: 'skipped', reason: enhanced.reason })
      continue
    }

    if (!dryRun) {
      await wpFetch({
        siteUrl,
        authHeader,
        endpoint: `/posts/${post.postId}`,
        options: {
          method: 'POST',
          body: JSON.stringify({ content: enhanced.html }),
        },
      })
    }

    results.push({
      postId: post.postId,
      label: post.label,
      status: dryRun ? 'dry-run' : 'updated',
      rowCount: enhanced.rowCount,
    })
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
