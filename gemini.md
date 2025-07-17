# Gemini 대화 및 프로젝트 규칙

## 1. 일반 대화 규칙

- 앞으로의 대화는 한국어로 진행합니다.

---

## 2. 프로젝트 개발 규칙 (.cursor/rules)

### 2.1. Commit Message Rules (`commit-message.mdc`)

**형식:**
```
<type>(<scope>): <subject>

<body>          # 선택
<footer>        # 선택 (BREAKING CHANGE, Closes #123)
```

| type     | 용도              |
| -------- | --------------- |
| feat     | 새로운 기능          |
| fix      | 버그 수정           |
| chore    | 빌드, 의존성, 설정 변경  |
| docs     | 문서 수정           |
| refactor | 리팩터링 (기능 변화 없음) |

**예시:** `feat(ui): add ProductCard component`

---

### 2.2. Context Injection (`context7.mdc`)

- **조건:** 프롬프트에 다음 키워드 중 하나가 포함될 때:
  - Next.js, React, Tailwind, YouTube, Firebase, Prisma
  - 넥스트, 리액트, 테일윈드, 유튜브, 파이어베이스, 프리즈마
- **동작:** 프롬프트에 "use context7" 텍스트를 추가합니다.

---

### 2.3. Documentation Comments (`docs-comment.mdc`)

- **public 함수·클래스·컴포넌트** 상단에 JSDoc 삽입합니다.
- `@param`, `@returns`는 필수입니다.
- 예제 코드 블록을 포함합니다.
- 비동기 함수는 `@async` 태그를 사용합니다.
- 한국어 설명과 영어 타입을 병기합니다.

**예시:**
```ts
/**
 * 사용자의 장바구니 합계를 계산한다.
 *
 * @async
 * @param items - 장바구니 항목 배열
 * @returns 총액(number, VAT 포함)
 * @example
 * const total = await calcCartTotal(items);
 */
export async function calcCartTotal(items: CartItem[]): Promise<number> {
  // ...
}
```

---

### 2.4. Import Order (`import-order.mdc`)

**순서 및 그룹 간 공백 라인:**

1.  **Node / Polyfill**
2.  **외부 패키지** (`react`, `@radix-ui/*`)
3.  **절대 경로 alias** (`@/lib/*`, `@/components/*`)
4.  **상대 경로** (`./Button`, `../utils`)
5.  **스타일 파일** (`"./index.scss"`)

---

### 2.5. Naming Conventions (`naming.mdc`)

- **폴더 / 파일:** `kebab-case` (e.g., `order-summary.tsx`)
- **환경 변수:** `SCREAMING_SNAKE_CASE`
- **DB 테이블:** `snake_case`, 복수형 (e.g., `order_items`)

---

### 2.6. Project TODO (`project-todo.mdc`)

#### 🛠️ Coupang Partners Auto-Blog SaaS

- **목표:** 키워드 입력만으로 쿠팡 상품 검색, 딥링크 변환, LLM 요약, 워드프레스 초안 저장까지 원-클릭으로 완료되는 서비스 구축.
- **스택:** Next.js 15, TypeScript, Tailwind CSS v4, TanStack Query, Zustand, Supabase, GitHub Actions, Jest/Vitest, Playwright.
- **체크리스트:** 환경 세팅 → MVP 기능 구현 → 품질/테스트 → 배포/모니터링 → 리팩토링/확장 순으로 진행.

---

### 2.7. General Rules (`rules.mdc`)

- 규칙은 명확하고, 실행 가능하며, 범위가 지정되어야 합니다.
- 규칙 파일은 500줄 미만으로 유지하고, 필요시 여러 파일로 분리합니다.
- 모호한 지침 대신 구체적인 예시를 제공합니다.

---

### 2.8. Test-Driven Development (TDD) (`tdd.mdc`)

1.  **테스트 우선:** Given-When-Then 시나리오를 Jest/Vitest로 먼저 작성합니다.
2.  **커버리지:** 80% 미만일 경우 파이프라인을 실패시킵니다.
3.  **도구:** Unit 테스트는 Jest/Vitest, E2E 테스트는 Playwright를 사용합니다.
4.  **자동화:** `npm run test --watch` 스크립트 사용을 권장합니다.
5.  **순서:** 새 기능 요청 시, **테스트 코드 → 구현 코드** 순서로 제시합니다.

---

### 2.9. AI Interaction (`use-rule.mdc`)

- 모든 명령 이후 커밋 생성을 제안합니다. ("커밋을 만들까요?")
- 모든 명령 이후 README 업데이트를 제안합니다. ("리드미를 업데이트 할까요?")

---

## 3. Frontend Rules (`frontend/.cursor/rules`)

### 3.1. Code Style (`code-style.mdc`)

- **언어/프레임워크:** TypeScript, 함수형 컴포넌트, Hooks 사용.
- **스타일:** `eslint-config-next` + Prettier 포매팅 준수.
- **타입:** `interface` 대신 `type` 사용, `any` 타입 사용 금지.
- **비동기:** `async/await` 사용.
- **상태/데이터:** 간단한 상태는 `useState`, 복잡하면 `Zustand`, 서버 데이터는 `TanStack Query` 사용.
- **모듈:** 절대 경로 alias (`@/components/*`) 사용.

### 3.2. CSS/Styling (`css-style.mdc`, `globalCSS-rules.mdc`, `tailwindCSS-rule.mdc`)

- **Tailwind CSS 우선:** 대부분의 스타일은 유틸리티 클래스로 직접 적용합니다.
- **`@apply` 최소화:** 반복적인 스타일에만 제한적으로 사용합니다.
- **`globals.css` 최소화:** 전역 스타일은 폰트, 배경색 등 초기화 목적으로만 사용합니다.
- **`prettier-plugin-tailwindcss`:** 클래스 순서를 자동으로 정렬합니다.
- **`clsx` / `cva`:** 조건부 스타일링에 사용하여 가독성을 높입니다.
- **`!important` 사용 금지.**

---

## 4. Backend Rules (`backend/.cursor/rules`)

### 4.1. Code Style (`code-style-backend.mdc`)

- **언어/런타임:** TypeScript + Deno.
- **프레임워크:** Oak 프레임워크 사용.
- **DB:** `deno-postgres` 클라이언트 사용, ORM 대신 SQL 템플릿 리터럴 권장.
- **스타일:** `deno fmt` 기본 포맷터 준수.
- **API:** RESTful 원칙을 따릅니다.
- **의존성:** `deps.ts` 파일에서 중앙 관리합니다.
- **보안:** `bcrypt`로 비밀번호 해싱, 명시적 CORS 설정.
