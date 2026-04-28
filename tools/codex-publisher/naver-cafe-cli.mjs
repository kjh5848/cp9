#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const DEFAULT_ENV_PATH = 'frontend/.env.local'
const DEFAULT_REDIRECT_URI = 'http://localhost:8080/oauth/naver/callback'
const DEFAULT_MENU_KEY = 'livingGoods'

const MENU_ENV_KEYS = {
  livingAppliance: ['NAVER_CAFE_MENU_LIVING_APPLIANCE_ID'],
  kitchenAppliance: ['NAVER_CAFE_MENU_KITCHEN_APPLIANCE_ID'],
  cleaningLiving: ['NAVER_CAFE_MENU_CLEANING_LIVING_ID'],
  gift: ['NAVER_CAFE_MENU_GIFT_ID', 'NAVER_CAFE_MENU_GIFT_ANNIVERSARY_ID'],
  electronicsDigital: ['NAVER_CAFE_MENU_ELECTRONICS_DIGITAL_ID'],
  foodFresh: ['NAVER_CAFE_MENU_FOOD_FRESH_ID'],
  livingGoods: ['NAVER_CAFE_MENU_LIVING_GOODS_ID'],
  homeInterior: ['NAVER_CAFE_MENU_HOME_INTERIOR_ID'],
  beauty: ['NAVER_CAFE_MENU_BEAUTY_ID'],
  fashion: ['NAVER_CAFE_MENU_FASHION_ID'],
  kitchenGoods: ['NAVER_CAFE_MENU_KITCHEN_GOODS_ID'],
  pet: ['NAVER_CAFE_MENU_PET_ID'],
  babyKids: ['NAVER_CAFE_MENU_BABY_KIDS_ID'],
  sportsLeisure: ['NAVER_CAFE_MENU_SPORTS_LEISURE_ID'],
  officeStationery: ['NAVER_CAFE_MENU_OFFICE_STATIONERY_ID'],
  carGoods: ['NAVER_CAFE_MENU_CAR_GOODS_ID'],
  toysHobbies: ['NAVER_CAFE_MENU_TOYS_HOBBIES_ID'],
  books: ['NAVER_CAFE_MENU_BOOKS_ID'],
  healthMedical: ['NAVER_CAFE_MENU_HEALTH_MEDICAL_ID'],
}

function usage() {
  console.log(`Usage:
  node tools/codex-publisher/naver-cafe-cli.mjs status
  node tools/codex-publisher/naver-cafe-cli.mjs auth-url [--redirect-uri URL]
  node tools/codex-publisher/naver-cafe-cli.mjs auth-url --auth-type reprompt [--redirect-uri URL]
  node tools/codex-publisher/naver-cafe-cli.mjs listen [--redirect-uri URL] [--auth-type reprompt|reauthenticate]
  node tools/codex-publisher/naver-cafe-cli.mjs exchange --code CODE --state STATE [--redirect-uri URL]
  node tools/codex-publisher/naver-cafe-cli.mjs test-post [--menu KEY] [--openyn true|false]

Notes:
  - Client ID/Secret은 NAVER_CAFE_CLIENT_ID/NAVER_CAFE_CLIENT_SECRET을 우선 사용합니다.
  - 없으면 NAVER_DATALAB_CLIENT_ID/NAVER_DATALAB_CLIENT_SECRET을 fallback으로 사용합니다.
  - 실제 카페 글쓰기는 NAVER_CAFE_ACCESS_TOKEN이 있어야 가능합니다.
`)
}

function parseArgs(argv) {
  const command = argv[2] || 'help'
  const options = {
    envPath: DEFAULT_ENV_PATH,
    redirectUri: DEFAULT_REDIRECT_URI,
    code: '',
    state: '',
    menu: DEFAULT_MENU_KEY,
    openyn: 'false',
    authType: '',
  }
  const args = argv.slice(3)
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--env') {
      options.envPath = args[index + 1]
      index += 1
    } else if (arg === '--redirect-uri') {
      options.redirectUri = args[index + 1]
      index += 1
    } else if (arg === '--code') {
      options.code = args[index + 1]
      index += 1
    } else if (arg === '--state') {
      options.state = args[index + 1]
      index += 1
    } else if (arg === '--menu') {
      options.menu = args[index + 1]
      index += 1
    } else if (arg === '--openyn') {
      options.openyn = args[index + 1]
      index += 1
    } else if (arg === '--auth-type') {
      options.authType = args[index + 1]
      index += 1
    }
  }
  return { command, options }
}

function loadEnv(envPath) {
  const env = {}
  if (!fs.existsSync(envPath)) return env

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }

  return env
}

function updateEnv(envPath, updates) {
  let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
  for (const [key, value] of Object.entries(updates)) {
    if (!value) continue
    const line = `${key}=${value}`
    const pattern = new RegExp(`^${key}=.*$`, 'm')
    if (pattern.test(text)) {
      text = text.replace(pattern, line)
    } else {
      text += `${text.endsWith('\n') || text.length === 0 ? '' : '\n'}${line}\n`
    }
  }
  fs.writeFileSync(envPath, text)
}

function getClientCredentials(env) {
  const source = env.NAVER_CAFE_CLIENT_ID && env.NAVER_CAFE_CLIENT_SECRET
    ? 'NAVER_CAFE_CLIENT'
    : env.NAVER_DATALAB_CLIENT_ID && env.NAVER_DATALAB_CLIENT_SECRET
      ? 'NAVER_SHARED_CLIENT_FROM_DATALAB_KEYS'
      : 'NAVER_CLIENT'
  const clientId = env.NAVER_CAFE_CLIENT_ID || env.NAVER_DATALAB_CLIENT_ID || env.NAVER_CLIENT_ID
  const clientSecret = env.NAVER_CAFE_CLIENT_SECRET || env.NAVER_DATALAB_CLIENT_SECRET || env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('NAVER_CAFE_CLIENT_ID/NAVER_CAFE_CLIENT_SECRET 또는 NAVER_DATALAB_CLIENT_ID/NAVER_DATALAB_CLIENT_SECRET이 필요합니다.')
  }
  return { clientId, clientSecret, source }
}

function printStatus(env, redirectUri) {
  const credentialSource = (() => {
    try {
      return getClientCredentials(env).source
    } catch {
      return 'missing'
    }
  })()
  const keys = [
    'NAVER_CAFE_ID',
    'NAVER_CAFE_CLIENT_ID',
    'NAVER_CAFE_CLIENT_SECRET',
    'NAVER_DATALAB_CLIENT_ID',
    'NAVER_DATALAB_CLIENT_SECRET',
    'NAVER_CAFE_ACCESS_TOKEN',
    'NAVER_CAFE_REFRESH_TOKEN',
    'NAVER_CAFE_MENU_LIVING_GOODS_ID',
  ]
  console.log(`credentialSource:${credentialSource}`)
  console.log(`redirectUri:${redirectUri}`)
  for (const key of keys) {
    console.log(`${key}:${String(env[key] || '').trim() ? 'set' : 'empty'}`)
  }
}

function buildAuthorizeUrl(clientId, redirectUri, state, authType = '') {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  })
  if (authType) {
    if (!['reprompt', 'reauthenticate'].includes(authType)) {
      throw new Error('--auth-type은 reprompt 또는 reauthenticate만 허용합니다.')
    }
    params.set('auth_type', authType)
  }
  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
}

function formEncodeUtf8(value) {
  return new URLSearchParams({ value: String(value) }).toString().slice('value='.length)
}

function naverCafeEncode(value) {
  return formEncodeUtf8(formEncodeUtf8(value))
}

function buildNaverCafeForm(fields) {
  return Object.entries(fields)
    .map(([key, value]) => `${encodeURIComponent(key)}=${naverCafeEncode(value)}`)
    .join('&')
}

function appendNaverCafeMultipartField(form, key, value) {
  form.append(key, String(value))
}

async function exchangeToken(env, envPath, code, state, redirectUri) {
  const { clientId, clientSecret } = getClientCredentials(env)
  if (!code || !state) {
    throw new Error('--code와 --state가 필요합니다.')
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    state,
    redirect_uri: redirectUri,
  })
  const response = await fetch(`https://nid.naver.com/oauth2.0/token?${params.toString()}`, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.access_token) {
    throw new Error(`네이버 토큰 발급 실패: HTTP ${response.status} ${JSON.stringify(result)}`)
  }

  updateEnv(envPath, {
    NAVER_CAFE_ACCESS_TOKEN: result.access_token,
    NAVER_CAFE_REFRESH_TOKEN: result.refresh_token,
    NAVER_CAFE_TOKEN_TYPE: result.token_type,
    NAVER_CAFE_TOKEN_EXPIRES_IN: result.expires_in ? String(result.expires_in) : '',
    NAVER_CAFE_TOKEN_ISSUED_AT: new Date().toISOString(),
  })

  return {
    tokenType: result.token_type || 'bearer',
    expiresIn: result.expires_in || null,
  }
}

function resolveMenuId(env, menuKey) {
  const keys = MENU_ENV_KEYS[menuKey]
  if (!keys) {
    throw new Error(`알 수 없는 menu key입니다: ${menuKey}`)
  }
  for (const key of keys) {
    if (env[key]) return env[key]
  }
  if (env.NAVER_CAFE_MENU_ID) return env.NAVER_CAFE_MENU_ID
  throw new Error(`${keys.join(' 또는 ')} 또는 NAVER_CAFE_MENU_ID가 필요합니다.`)
}

async function testPost(env, menuKey, openyn) {
  const clubId = String(env.NAVER_CAFE_ID || '').trim()
  const accessToken = String(env.NAVER_CAFE_ACCESS_TOKEN || '').trim()
  const menuId = resolveMenuId(env, menuKey)
  const { clientId, clientSecret } = getClientCredentials(env)
  if (!clubId) throw new Error('NAVER_CAFE_ID가 필요합니다.')
  if (!accessToken) throw new Error('NAVER_CAFE_ACCESS_TOKEN이 필요합니다. 먼저 listen 또는 exchange를 실행하세요.')

  const subject = '[테스트] CP9 카페 API 글쓰기 확인'
  const content = [
    'CP9 자동화 카페 API 연결 테스트입니다.',
    '이 글은 메뉴 ID, OAuth 토큰, 글쓰기 권한 확인용입니다.',
    '확인 후 삭제해도 됩니다.',
  ].join('<br>')
  const body = buildNaverCafeForm({
    subject,
    content,
    openyn: String(openyn === 'true'),
    searchopen: String(openyn === 'true'),
    replyyn: 'false',
    scrapyn: 'false',
    metoo: 'false',
    autosourcing: 'false',
    rclick: 'true',
    ccl: 'false',
  })

  const response = await fetch(`https://openapi.naver.com/v1/cafe/${encodeURIComponent(clubId)}/menu/${encodeURIComponent(menuId)}/articles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
      'Content-Type': 'application/x-www-form-urlencoded; charset=ms949',
    },
    body,
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`카페 테스트 글쓰기 실패: HTTP ${response.status} ${text.slice(0, 500)}`)
  }
  return JSON.parse(text)
}

async function listenForCallback(env, envPath, redirectUri, authType = '') {
  const redirect = new URL(redirectUri)
  const port = Number(redirect.port || 80)
  const state = crypto.randomBytes(16).toString('hex')
  const { clientId } = getClientCredentials(env)
  const authUrl = buildAuthorizeUrl(clientId, redirectUri, state, authType)

  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', redirectUri)
      if (requestUrl.pathname !== redirect.pathname) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('not found')
        return
      }
      const code = requestUrl.searchParams.get('code')
      const returnedState = requestUrl.searchParams.get('state')
      const error = requestUrl.searchParams.get('error')
      if (error) throw new Error(`네이버 인증 오류: ${error}`)
      if (returnedState !== state) throw new Error('state 값이 일치하지 않습니다.')

      const result = await exchangeToken(env, envPath, code, returnedState, redirectUri)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<h1>네이버 카페 토큰 저장 완료</h1><p>이 창은 닫아도 됩니다.</p>')
      console.log(`token:saved expiresIn=${result.expiresIn || 'unknown'}`)
      server.close()
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end(error instanceof Error ? error.message : String(error))
      console.error(error instanceof Error ? error.message : String(error))
      server.close()
    }
  })

  await new Promise((resolve) => server.listen(port, redirect.hostname, resolve))
  console.log(`callback:listening ${redirectUri}`)
  console.log(`authUrl:${authUrl}`)
}

async function main() {
  const { command, options } = parseArgs(process.argv)
  if (command === 'help' || command === '--help' || command === '-h') {
    usage()
    return
  }

  const envPath = path.resolve(options.envPath)
  const env = loadEnv(envPath)

  if (command === 'status') {
    printStatus(env, options.redirectUri)
    return
  }

  if (command === 'auth-url') {
    const { clientId, source } = getClientCredentials(env)
    const state = crypto.randomBytes(16).toString('hex')
    console.log(`credentialSource:${source}`)
    console.log(`state:${state}`)
    console.log(`authUrl:${buildAuthorizeUrl(clientId, options.redirectUri, state, options.authType)}`)
    return
  }

  if (command === 'listen') {
    await listenForCallback(env, envPath, options.redirectUri, options.authType)
    return
  }

  if (command === 'exchange') {
    const result = await exchangeToken(env, envPath, options.code, options.state, options.redirectUri)
    console.log(`token:saved expiresIn=${result.expiresIn || 'unknown'}`)
    return
  }

  if (command === 'test-post') {
    const result = await testPost(env, options.menu, options.openyn)
    const articleUrl = result.message?.result?.articleUrl || result.result?.articleUrl || ''
    console.log(`cafePost:published ${articleUrl}`)
    return
  }

  usage()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
