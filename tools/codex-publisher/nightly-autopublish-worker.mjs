#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const LOCK_STALE_MS = 2 * 60 * 60 * 1000
const CHILD_TIMEOUT_MS = 25 * 60 * 1000

function parseArgs(argv) {
  const options = {
    bypassSandbox: argv.includes('--bypass-sandbox') || process.env.CODEX_AUTOPUBLISH_BYPASS_SANDBOX === 'true',
    dryRun: argv.includes('--dry-run'),
  }
  return options
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

function loadCandidates(cwd) {
  const candidatesPath = path.join(cwd, 'data/keyword-candidates.json')
  if (!fs.existsSync(candidatesPath)) {
    throw new Error('missing data/keyword-candidates.json')
  }
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'))
  if (!Array.isArray(candidates)) {
    throw new Error('data/keyword-candidates.json must be a JSON array')
  }
  return candidates
}

function pendingCount(cwd) {
  return loadCandidates(cwd).filter((candidate) => candidate.status === 'pending').length
}

function acquireLock(cwd) {
  const lockPath = path.join(cwd, 'data/codex-publisher-nightly.lock')
  try {
    return { fd: fs.openSync(lockPath, 'wx'), lockPath }
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    const stat = fs.statSync(lockPath)
    if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
      fs.unlinkSync(lockPath)
      return { fd: fs.openSync(lockPath, 'wx'), lockPath }
    }
    throw new Error(`worker already running: ${lockPath}`)
  }
}

function releaseLock(lock) {
  if (!lock) return
  fs.closeSync(lock.fd)
  fs.unlinkSync(lock.lockPath)
}

function runCommand(command, args, options = {}) {
  log(`run: ${command} ${args.join(' ')}`)
  if (options.dryRun) return

  const result = spawnSync(command, args, {
    cwd: options.cwd,
    input: options.input,
    stdio: options.input ? ['pipe', 'inherit', 'inherit'] : 'inherit',
    encoding: 'utf8',
    timeout: CHILD_TIMEOUT_MS,
    killSignal: 'SIGTERM',
  })

  if (result.error) throw result.error
  if (result.signal) {
    throw new Error(`${command} terminated by signal ${result.signal}`)
  }
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}`)
  }
}

function codexArgs(cwd, bypassSandbox) {
  return bypassSandbox
    ? ['exec', '--dangerously-bypass-approvals-and-sandbox', '-C', cwd, '-']
    : ['exec', '--full-auto', '-C', cwd, '-']
}

function buildKeywordDiscoveryPrompt() {
  return `Automation: C - 쿠팡 키워드 발굴

\`docs/automation/codex-coupang-publisher.md\` 설계서를 기준으로 C 자동화만 수행한다. CP9 내부 오토파일럿 파이프라인이나 프로젝트 LLM API 키를 사용하지 않는다. 비밀값은 \`frontend/.env.local\`에서만 읽고, 값을 출력하지 않는다.

\`docs/coupang-seed-keywords.md\` 인덱스와 \`docs/coupang-seed-keywords/*.md\` 카테고리별 시드 파일을 모두 읽고 네이버 연관검색어, 데이터랩, 쇼핑인사이트, 검색광고 키워드 도구를 활용해 쿠팡 파트너스 발행 후보 키워드를 발굴한다. 각 카테고리 파일 제목은 후보의 기본 \`category\`로 사용하고, 목록 항목은 기본 \`keyword\` 또는 \`coupangSearchTerm\` 후보로 사용한다. 기념일/선물 추천 시드는 독립 발행 카테고리로 관리하고 후보의 \`category\`는 \`기념일/선물\`로 둔다. 10대·20대·30대·40대·50대·60대 같은 나이대, 엄마·아빠·부모님·아내·남편·여자친구·남자친구·직장동료·선생님 같은 상대, 생일·생신·결혼기념일·집들이·어버이날·스승의날·크리스마스·명절·퇴사·취업·입학·졸업 같은 상황, 1만원대·3만원대·5만원대·10만원대·20만원대 같은 가격대, 센스있는·실용적인·부담없는·고급·가성비 같은 의도 접두어, 건강가전·마사지기·커피머신·공기청정기·가습기·로봇청소기·무선청소기·주방용품·생활용품 같은 상품군을 조합한다. 기념일 후보의 \`keyword\`에는 검색 의도 문구를 넣고, \`coupangSearchTerm\`에는 실제 쿠팡 상품 조회에 적합한 상품군을 넣는다. 네이버 검색광고 키워드 도구는 \`NAVER_API_KEY\`, \`NAVER_SECRET_KEY\`, \`NAVER_SEARCHAD_CUSTOMER_ID\`가 모두 있을 때만 사용한다. 네이버 데이터랩/쇼핑인사이트는 \`NAVER_DATALAB_CLIENT_ID\`, \`NAVER_DATALAB_CLIENT_SECRET\`이 있을 때만 사용한다. 누락된 선택 환경변수는 해당 단계만 건너뛰고 변수명만 보고한다.

회당 최대 20개 후보를 \`data/keyword-candidates.json\`에 추가한다. 기존 후보는 삭제하지 않고 상태값으로 관리한다. 이미 published인 키워드/검색 의도와 중복되는 후보는 추가하지 않는다. 14일 이상 지난 pending 후보는 삭제하지 말고 stale로 전환하고 재점수화한다. 결과 요약과 누락/오류를 보고한다.`
}

function runKeywordDiscovery(cwd, options) {
  runCommand('codex', codexArgs(cwd, options.bypassSandbox), {
    cwd,
    input: buildKeywordDiscoveryPrompt(),
    dryRun: options.dryRun,
  })
}

function runPublishOnce(cwd, options) {
  const args = ['tools/codex-publisher/autopublish-cli.mjs', 'batch', '--count', '1']
  if (options.bypassSandbox) args.push('--bypass-sandbox')
  runCommand('node', args, { cwd, dryRun: options.dryRun })
}

function main() {
  const cwd = process.env.CODEX_AUTOPUBLISH_CWD || process.cwd()
  const options = parseArgs(process.argv)
  let lock

  try {
    lock = acquireLock(cwd)
    log(`worker start; bypassSandbox=${options.bypassSandbox}; dryRun=${options.dryRun}`)

    let count = pendingCount(cwd)
    log(`pending before C=${count}`)

    if (count === 0) {
      log('no pending candidate; running C keyword discovery')
      runKeywordDiscovery(cwd, options)
      count = pendingCount(cwd)
      log(`pending after C=${count}`)
    }

    if (count === 0) {
      log('no pending candidate after C; skip A publish')
      return
    }

    log('running A publish once')
    runPublishOnce(cwd, options)
    log('worker complete')
  } finally {
    releaseLock(lock)
  }
}

try {
  main()
} catch (error) {
  console.error(`[${new Date().toISOString()}] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
