---
description: 프로젝트 전역 에이전트 규칙 (Global Agent Rules)
---

이 프로젝트(`cp9`) 내에서 작업하는 AI 에이전트는 다음 규칙들을 최우선으로 준수해야 합니다.

## 1. 글로벌 필수 준수 규칙 (Global User Rules)
- **언어 및 출력:** 모든 산출물 및 대화는 반드시 **한국어**로 출력해야 합니다.
- **Python 터미널 룰:** Python 작업 시 터미널에서 **가상환경을 활성화**한 뒤 명령어를 실행해야 합니다.
- **Mermaid 다이어그램 문법:** Mermaid 작성 시 괄호 `()` 사용 구문은 반드시 쌍따옴표 `""`로 감싸야 합니다. (예: `A["설명(예시)"]`)
- **마크다운 띄어쓰기 규격:** 마크다운 볼드체(`**`)를 사용할 때 괄호나 따옴표 구문 뒤에는 **반드시 공백**을 넣어야 합니다. (예: `**"강조"** 함`)
- **주석:** 모든 코드의 주석은 **한국어**로 작성합니다.

## 2. 세부 개발 룰 (Specific Domain Rules)
에이전트는 프론트엔드 또는 백엔드 작업을 진행할 때, 기능 설계 및 코드 작성 전 이 파일들을 우선적으로 참고해야 합니다.
- `.agents/rules/rule-backend-dev.md`: 백엔드 개발 시 필수 준수 사항 (Pydantic, 로깅, 권한 등)
- `.agents/rules/rule-frontend-dev.md`: 프론트엔드 개발 시 필수 준수 사항 (SWR, 상태관리, UI/UX 등)

## 3. 프로젝트 및 워크플로우 가이드
특정 작업을 자동화하거나 가이드받기 위해 워크플로우를 사용할 수 있습니다. (`.agents/workflows` 폴더 참조)
- `/api-integration`: 외부 API 연동 시 따라야 할 단계별 지침
- `/implement-fsd-feature`: 새로운 기능 개발 시 사용하는 FSD(Feature-Sliced Design) 아키텍처 규칙
- `/seo-pipeline`: SEO 블로그 포스팅 파이프라인 프로세스
- `/keyword-debug`: 구체적인 기능 디버깅 프로세스

## 4. 공식 슈퍼파워 스킬 (Claude Code Superpowers)
에이전트는 확장 기능이나 추가 도구가 필요할 때 아래 경로의 공식 슈퍼파워 스킬을 직접 설치 및 호출하여 활용할 수 있습니다.
- **스킬 경로**: `obra/superpowers`
  - (예: `obra/superpowers@using-superpowers`, `obra/superpowers@systematic-debugging` 등)
- 실행 방법: `npx skills find obra/superpowers`로 검색하거나 `npx skills add obra/superpowers@<스킬명>`으로 설치 후 해당 스킬을 호출하여 사용하세요.

## 5. 방어적 프롬프트 및 정규식 규칙 (Defensive Programming for LLM)
- **금칙어 및 기호 규제:** 시스템 및 유저 프롬프트 작성 시, LLM의 본능적 포맷(예: '결론:', '특징:') 생성을 차단하려면 단순히 가볍게 사용하지 말라고 하는 것보다 "어떠한 경우에도 '결론' 단어 및 쌍점(`:`) 기호의 사용을 절대 금지한다"와 같이 명확하고 독립적인 네거티브 프롬프트 룰을 명시적으로 갖춰야 합니다.
- **관대한 파싱(Tolerant Parsing):** 매크로 치환 정규식(Regex)을 작성할 때는 LLM이 포맷을 미세하게 틀릴 확률을 방어해야 합니다. 예를 들어 `[[[CTA_BUTTON]]]` 3개의 대괄호를 기대하더라도, LLM이 2개만 생성하는 실수를 포용할 수 있도록 정규식을 `\[{2,3}...\]{2,3}` 형태로 유연하고 관대하게 작성해야 합니다.
