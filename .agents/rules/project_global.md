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
