#!/bin/zsh
set -euo pipefail

PROJECT_DIR="/Users/nomadlab/codex-work/cp9"
NODE_BIN="/opt/homebrew/bin/node"
LOG_DIR="${HOME}/Library/Logs/cp9-codex-publisher"
LOCK_DIR="/tmp/cp9-codex-publisher.lock"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export CODEX_AUTOPUBLISH_CWD="${PROJECT_DIR}"
export CODEX_AUTOPUBLISH_BYPASS_SANDBOX="true"

mkdir -p "${LOG_DIR}"

timestamp() {
  date '+%Y-%m-%dT%H:%M:%S%z'
}

if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  printf '[%s] another cp9 autopublish run is active; skipping\n' "$(timestamp)" >> "${LOG_DIR}/runner.log"
  exit 0
fi

cleanup() {
  rmdir "${LOCK_DIR}" 2>/dev/null || true
}
trap cleanup EXIT

cd "${PROJECT_DIR}"

{
  printf '\n[%s] cp9 autopublish start\n' "$(timestamp)"
  worker_args=(tools/codex-publisher/nightly-autopublish-worker.mjs --bypass-sandbox)

  if command -v caffeinate >/dev/null 2>&1; then
    caffeinate -i -t 2400 "${NODE_BIN}" "${worker_args[@]}"
  else
    "${NODE_BIN}" "${worker_args[@]}"
  fi

  printf '[%s] cp9 autopublish complete\n' "$(timestamp)"
} >> "${LOG_DIR}/runner.log" 2>&1
