---
description: FSD 아키텍처 기반 프론트엔드 기능 개발 워크플로우
---

# FSD 아키텍처 기능 구현 워크플로우 (FSD Feature Implementation Workflow)

이 워크플로우는 사용자 요구사항이나 기존 레거시 코드를 `FSD (Feature-Sliced Design)` 기반으로 개발/마이그레이션할 때 따라야 하는 표준 절차입니다.
작업 시 **Sequential Thinking MCP 서버** 도구를 활용하여 단계별로 검증하며 진행하십시오.

## 1. 요구사항 및 아키텍처 구조 기획 (Sequential Thinking - Thought 1)
- 변경 대상(새로운 기능 혹은 `legacy` 마이그레이션 대상)을 분석합니다.
- `<appDataDir>/knowledge` 혹은 기존 레퍼런스(예: `.agents/skills/implement-fsd-feature/references`) 리소스를 `view_file`로 먼저 읽어들입니다.
- FSD 계층에 따른 구조체 설계(`entities`, `features`, `widgets`, `shared`)를 먼저 기획하고, 이 논리를 Sequential Thinking의 Thought 단위로 검증합니다.

## 2. 순수 시각 도메인(Entities) 구축 (Sequential Thinking - Thought 2)
- API 통신이나 전역 상태 등 외부 부수 효과(Side-effect)가 없는 **Dumb Component**를 `entities/[domain]/ui` 로 분리하여 구현합니다.
- 조건부 렌더링 작성 시 **`&&` 대신 `? : null` 삼항 연산자**를 우선 사용합니다 (ex: `value ? <Component /> : null`). 이를 통해 `0`이나 `NaN` 등의 Falsy 값이 화면에 노출되는 UI 렌더링 버그를 차단합니다.
- 백엔드 명세와 1:1 대응되는 DTO 타입 가이드를 `entities/[domain]/model/types.ts` 에 정의합니다. `any` 타입의 사용을 완전히 배제합니다.

## 3. 비즈니스 액션 로직(Features) 분리 (Sequential Thinking - Thought 3)
- 분리된 View가 동작하기 위해 필요한 상태 선언 및 백엔드 통신(API Hook) 로직을 `features/[feature]/model/use[Feature]ViewModel.ts` 형태로 작성합니다.
- 클라이언트 측 데이터 페칭이 필요한 경우, 직접적인 `useEffect` + `fetch` 조합 대신 **SWR (`useSWR`) 라이브러리**를 기본으로 사용하여 캐싱 및 포커스 기반 재검증(`Stale-While-Revalidate`) 패턴을 강력 권장합니다.
- `useViewModel` 내에서 Zustand 기반 전역 상태를 사용하거나, 로컬 상태 매니지먼트를 진행합니다. 

## 4. UI/UX 계층 결합 및 다크 모드(Deep Tech) 적용 
- `features/[feature]/ui`의 스마트 컴포넌트(위젯) 내에서 `useViewModel`을 호출한 후 결괏값을 `Entities.UI` 컴포넌트로 주입합니다.
- 조건부 평가 렌더링 시 UI 깨짐을 방지하고자 위젯 단에서도 `&&`보다 `? : null` 패턴 검증을 병행합니다.
- **하이퍼 딥 테크 (Hyper-Deep Tech) 디자인 원칙:**
  1. **타이포그래피:** `Space Grotesk` 등 제네릭 폰트를 지양하고 `Syne`, `Plus Jakarta Sans` 기반의 파격적인 디스플레이 폰트를 전역 사용합니다 (`@theme` 폰트 클래스 참조).
  2. **마이크로 인터랙션 버튼:** `shared/ui/button.tsx`의 `tech`, `glass` Variant를 활용하여 1px 이너 보더(Inner Highlight), 다중 컬러 그림자 깊이 활성화 및 버튼 탭 시 축소되는 액티브 스케일(`active:scale-[0.98]`)을 적용합니다.
  3. **레이아웃 비대칭 및 노이즈 오버레이:** 각 뷰 최상단 혹은 백그라운드에 SVG 필터 노이즈(`mix-blend-soft-light`)를 삽입해 텍스처를 부여하며, 타이포그래피 여백 대비를 활용한 비대칭 디자인을 권장합니다.
- 렌더링 시 **Glassmorphism(유리 효과)** 등을 담은 `shared/ui` (`GlassCard` 등)과 `framer-motion`을 함께 결합하여 UI의 완성도를 극대화합니다.

## 5. 서버 최적화 패턴 통합 (Vercel Best Practices)
- **서버 컴포넌트 & API 유틸리티**: 내부 모듈이나 서비스단에서 외부 DB나 동일한 API를 여러 단계를 거쳐 페칭한다면 페칭 유틸리티 함수에 **`React.cache()`** 래핑을 적용합니다. 
- **병렬 페칭 가속화**: API 라우트 또는 백엔드 컴포넌트에서 순차적으로 데이터를 가져오는 `await a; await b;` 형태를 식별하고, 서로 종속성이 없다면 즉각적으로 **`Promise.all([a, b])`** 로 전환하여 실행 속도를 높입니다.

## 6. 검증 및 테스트 진행
- 구현된 FSD 코드를 라우트(`app/[page]/page.tsx`)에 임포트 후 `npm run dev` 서버 상에서 렌더링이 문제 없는지 점검합니다. 
- Sequential Thinking 도구에 `needsMoreThoughts: false` 및 최종 솔루션을 회신하며 워크플로우를 완수합니다.
