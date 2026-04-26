#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const REQUIRED_ENV = [
  'WORDPRESS_SITE_URL',
  'WORDPRESS_USERNAME',
  'WORDPRESS_APP_PASSWORD',
  'COUPANG_ACCESS_KEY',
  'COUPANG_SECRET_KEY',
]

const OPTIONAL_ENV = [
  'COUPANG_PARTNER_ID',
  'PEXELS_API_KEY',
  'NAVER_CAFE_ID',
  'NAVER_CAFE_MENU_ID',
  'NAVER_CAFE_ACCESS_TOKEN',
]

function usage() {
  console.log(`Usage:
  node tools/codex-publisher/autopublish-cli.mjs preflight
  node tools/codex-publisher/autopublish-cli.mjs preview
  node tools/codex-publisher/autopublish-cli.mjs batch [--count N] [--bypass-sandbox]
  node tools/codex-publisher/autopublish-cli.mjs prompt --mode preview|batch
`)
}

function parseArgs(argv) {
  const command = argv[2] || 'help'
  const args = argv.slice(3)
  const options = { count: 1, mode: null, bypassSandbox: process.env.CODEX_AUTOPUBLISH_BYPASS_SANDBOX === 'true' }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--count') {
      options.count = Number(args[index + 1])
      index += 1
    } else if (arg === '--mode') {
      options.mode = args[index + 1]
      index += 1
    } else if (arg === '--bypass-sandbox') {
      options.bypassSandbox = true
    }
  }

  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error('--count must be a positive integer')
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

function getPendingCandidates(candidatesPath) {
  if (!fs.existsSync(candidatesPath)) return []
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'))
  if (!Array.isArray(candidates)) {
    throw new Error('data/keyword-candidates.json must be a JSON array')
  }
  return candidates.filter((candidate) => candidate.status === 'pending')
}

function preflight(cwd) {
  const envPath = path.join(cwd, 'frontend/.env.local')
  const candidatesPath = path.join(cwd, 'data/keyword-candidates.json')
  const historyPath = path.join(cwd, 'data/codex-publisher-history.json')
  const designPath = path.join(cwd, 'docs/automation/codex-coupang-publisher.md')
  const env = loadEnv(envPath)
  const pending = getPendingCandidates(candidatesPath)

  const result = {
    files: {
      design: fs.existsSync(designPath) ? 'present' : 'missing',
      env: fs.existsSync(envPath) ? 'present' : 'missing',
      candidates: fs.existsSync(candidatesPath) ? 'present' : 'missing',
      history: fs.existsSync(historyPath) ? 'present' : 'missing',
    },
    env: Object.fromEntries(
      [...REQUIRED_ENV, ...OPTIONAL_ENV].map((key) => [key, env[key] ? 'set' : 'empty']),
    ),
    pendingCandidates: pending.length,
    nextCandidate: pending[0]
      ? {
          id: pending[0].id,
          keyword: pending[0].keyword,
          articleType: pending[0].articleType,
          priorityScore: pending[0].priorityScore,
        }
      : null,
  }

  console.log(JSON.stringify(result, null, 2))

  const missingRequiredEnv = REQUIRED_ENV.filter((key) => !env[key])
  const missingRequiredFiles = Object.entries(result.files)
    .filter(([, status]) => status !== 'present')
    .map(([key]) => key)

  if (missingRequiredEnv.length || missingRequiredFiles.length || pending.length === 0) {
    process.exitCode = 1
  }
}

function buildPrompt(mode, iteration, total) {
  const preview = mode === 'preview'
  const batchSuffix = total > 1 ? ` 이번 배치의 ${iteration}/${total}번째 실행이다.` : ''
  const statusInstruction = preview
    ? '이번 실행은 디자인 검증용 1건이다. WordPress에는 공개 발행하지 말고 draft 상태로 임시 발행한다. 발행 후 URL, post id, 디자인 검증 포인트를 보고한다. 검증용 산출물은 사람이 확인할 수 있을 만큼만 남기고, 공개 배치로 오인되지 않게 history 상태를 preview 또는 draft로 기록한다.'
    : '이번 실행은 공개 배치 발행이다. WordPress REST API로 publish 상태 공개 발행한다. 발행 성공 후 로컬 Markdown/HTML/JPEG 원본은 보관하지 말고 삭제한다.'

  return `Automation: A - 쿠팡 WordPress 30분 공개 발행
Automation ID: a-wordpress-draft

\`docs/automation/codex-coupang-publisher.md\` 설계서를 기준으로 A 자동화만 수행한다.${batchSuffix} CP9 내부 오토파일럿 파이프라인이나 프로젝트 LLM API 키를 사용하지 않는다. 비밀값은 \`frontend/.env.local\`에서만 읽고, 값을 출력하지 않는다. \`data/keyword-candidates.json\`에서 \`pending\` 후보 1개를 선택하고, 쿠팡 파트너스 상품 후보를 조회해 가격대, 배송, 브랜드, 상품 차별점, 글 유형 적합도로 선별한다. 리뷰 수와 평점은 필수 게이트로 사용하지 말고, 별도 검증 가능한 출처가 있을 때만 추가 가점으로 사용한다. 공개되는 WordPress 본문과 네이버 카페 요약에는 API, 검색 API, 응답, productImage, productUrl, productPrice 같은 데이터 수집 방식이나 내부 필드명을 절대 쓰지 않는다. 공개 본문에서는 “작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 배송 조건”처럼 독자 관점 표현만 쓴다. 제목과 h1~h6에는 콜론(: 또는 ：)을 절대 쓰지 않고 발견되면 발행하지 않는다. GEO와 AI 스니펫 대응을 위해 모든 상품 설명에는 확인 팩트, 해석 문장, 구매 전 질문을 포함하고, 확인되지 않은 스펙·리뷰·평점·판매량은 만들지 않는다. 상품 리스트는 ItemList, Product, Offer 구조화 데이터와 본문 표시 정보가 서로 어긋나지 않게 작성한다. 글 유형은 TOP 3~5 비교, 딥다이브, 20가지 큐레이션 비율을 설계서 기준으로 섞는다. Codex 자체 모델로 한국어 SEO 글을 작성한다. TOP 3~5 비교 글의 상품별 설명은 핵심 판단, 장점, 단점, 추천 대상, 구매 전 체크를 포함한다. 딥다이브는 공백 제외 8,000자 이상으로 작성하고 리포트/보고서형 서식으로 핵심 판단, 읽어야 할 사람, 가장 큰 리스크를 상단에 요약하되 글 제목을 반복하지 않는다. 딥다이브 본문은 문단만 나열하지 말고 목록, 인용, 잡지형 체크 카드, 짧은 위트 문장을 섞는다. 딥다이브 본문은 유명 브랜드, 대표 아이템, 브랜드 철학, 브랜드 이미지, 사용자가 얻는 의미를 중심으로 다루며 상품 링크는 구매 확인용 보조 영역으로만 둔다. 딥다이브 구매 확인 영역에는 쿠팡 파트너스 상품 이미지를 최소 3개 이상 넣고, 상품 이미지는 각 상품명 바로 아래에 배치한다. 딥다이브 설명 이미지는 Pexels 사진 위에 HTML 텍스트 레이어를 합성한 960x560 JPEG를 WordPress 미디어로 업로드해 본문 h2 아래에 최소 3개 이상 배치한다. 공개 본문 이미지는 Pexels 원본 URL로 링크하거나 Pexels 외부 이미지를 직접 로드하지 않는다. 본문에는 Photo by 작가명 on Pexels 문구를 노출하지 않고 sourceUrl, photographer, license는 history에만 남긴다. 일반 블로그, 뉴스, 리뷰 사이트, 쇼핑몰 상세페이지 이미지는 명시적 사용 허가가 없으면 사용하지 않는다. 20가지 큐레이션은 표를 쓰지 말고 모바일 우선 카드형 섹션으로 만들며 각 아이템마다 300자 내외 설명, 이미지, 상품명, 역할, 가격, 가격 확인 버튼을 포함한다. 대표 썸네일은 \`tools/codex-publisher/thumbnail-title.mjs\` 규칙을 사용하고, 원문 제목을 한 줄로 넣지 말며, 1200x630 overflow를 검증한 뒤 업로드한다. ${statusInstruction} \`COUPANG_ACCESS_KEY\`와 \`COUPANG_SECRET_KEY\`는 필수지만, \`COUPANG_PARTNER_ID\`는 선택값이므로 비어 있어도 발행을 막지 않는다. 딥다이브 발행에는 \`PEXELS_API_KEY\`가 필요하며 비어 있으면 딥다이브 회차는 발행하지 말고 누락을 보고한다. 네이버 카페 환경변수가 모두 있으면 WordPress 원문 링크와 쿠팡 파트너스 고지 포함 요약 글을 카페에도 업로드한다. \`data/codex-publisher-history.json\`에는 키워드, 글 유형, 상품 id, WordPress post id, URL, 상태, 플랫폼별 결과, 딥다이브 Pexels 이미지 출처 메타데이터만 최소 기록한다. 필수 환경변수나 입력 파일이 없거나 품질 점수, 쿠팡 고지, 이미지, 링크, 표 구조가 미달이면 발행하지 말고 누락/오류를 보고한다. 성공 또는 실패 시 macOS 로컬 알림을 표시한다.`
}

function runCodex(cwd, prompt, options = {}) {
  const codexArgs = options.bypassSandbox
    ? ['exec', '--dangerously-bypass-approvals-and-sandbox', '-C', cwd, '-']
    : ['exec', '--full-auto', '-C', cwd, '-']

  const result = spawnSync(
    'codex',
    codexArgs,
    {
      input: prompt,
      stdio: ['pipe', 'inherit', 'inherit'],
      encoding: 'utf8',
    },
  )

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`codex exec failed with exit code ${result.status}`)
  }
}

function main() {
  const cwd = process.env.CODEX_AUTOPUBLISH_CWD || process.cwd()
  const { command, options } = parseArgs(process.argv)

  if (command === 'help' || command === '--help' || command === '-h') {
    usage()
    return
  }

  if (command === 'preflight') {
    preflight(cwd)
    return
  }

  if (command === 'prompt') {
    const mode = options.mode || 'preview'
    if (!['preview', 'batch'].includes(mode)) {
      throw new Error('--mode must be preview or batch')
    }
    console.log(buildPrompt(mode, 1, 1))
    return
  }

  if (command === 'preview') {
    runCodex(cwd, buildPrompt('preview', 1, 1), options)
    return
  }

  if (command === 'batch') {
    for (let index = 1; index <= options.count; index += 1) {
      runCodex(cwd, buildPrompt('batch', index, options.count), options)
    }
    return
  }

  usage()
  throw new Error(`Unknown command: ${command}`)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
