# ESLint TypeScript 규칙 상세 가이드

> CP9 프로젝트의 TypeScript 코드 품질 보장을 위한 ESLint 규칙 완벽 가이드

## 🔧 현재 ESLint 설정

### eslint.config.mjs 분석

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",  // ✅ any 타입 완전 차단
      "@typescript-eslint/no-unused-vars": "warn",    // 미사용 변수 경고
      "react-hooks/exhaustive-deps": "warn",          // Hook 의존성 경고
    }
  }
];

export default eslintConfig;
```

## 🚫 TypeScript 엄격 규칙 상세

### 1. `@typescript-eslint/no-explicit-any`

**설정**: `"error"` (빌드 실패)
**목적**: any 타입 사용 완전 차단

#### 차단되는 패턴
```typescript
// ❌ 모든 any 사용이 오류 발생
let data: any = {};
function process(input: any): any { }
const items: any[] = [];
const config = {} as any;

// ❌ 함수 매개변수의 암시적 any도 오류
function handle(data) {  // Parameter 'data' implicitly has an 'any' type
  return data;
}

// ❌ 객체 인덱스 시그니처의 any
interface Config {
  [key: string]: any;  // 오류 발생
}
```

#### 허용되는 대안
```typescript
// ✅ 구체적인 타입 정의
interface UserData {
  id: string;
  name: string;
  email: string;
}

let data: UserData = {};

// ✅ unknown 타입 사용 후 타입 가드
function process(input: unknown): ProcessedResult {
  if (isValidInput(input)) {
    return transformInput(input);
  }
  throw new Error('Invalid input');
}

// ✅ Generic 타입 활용
function handle<T>(data: T): ProcessedData<T> {
  return processData(data);
}

// ✅ 유니온 타입 활용
interface Config {
  [key: string]: string | number | boolean | null;
}
```

#### 오류 해결 방법
```typescript
// ESLint 오류 메시지
// error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

// 해결 단계
1. any 타입을 구체적인 타입으로 변경
2. 타입을 알 수 없는 경우 unknown 사용
3. 타입 가드 함수로 안전하게 변환
4. Generic을 활용한 재사용 가능한 타입
```

### 2. `@typescript-eslint/no-unused-vars`

**설정**: `"warn"` (경고 표시)
**목적**: 미사용 변수 및 import 정리

#### 경고가 발생하는 경우
```typescript
// ❌ 미사용 변수
import { useState, useEffect } from 'react'; // useEffect 미사용 시 경고
const unusedVariable = 'test';  // 경고 발생

// ❌ 미사용 매개변수
function handleClick(event, unusedParam) {  // unusedParam 경고
  console.log('clicked');
}

// ❌ 미사용 타입 import
import { UserData, UnusedType } from './types';  // UnusedType 경고
```

#### 해결 방법
```typescript
// ✅ 사용하지 않는 변수/import 제거
import { useState } from 'react';

// ✅ 의도적으로 미사용인 매개변수는 underscore 접두사
function handleClick(event, _unusedParam) {
  console.log('clicked');
}

// ✅ 필요한 import만 유지
import { UserData } from './types';
```

### 3. `react-hooks/exhaustive-deps`

**설정**: `"warn"` (경고 표시)
**목적**: React Hook 의존성 배열 완성도 검사

#### 경고가 발생하는 경우
```typescript
// ❌ 의존성 누락
function MyComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);  // userId가 deps에 없음
  }, []);  // 경고: React Hook useEffect has a missing dependency: 'userId'

  const memoizedValue = useMemo(() => {
    return computeExpensiveValue(userId, user);
  }, [user]);  // 경고: 'userId' 누락
}
```

#### 해결 방법
```typescript
// ✅ 모든 의존성 포함
function MyComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);  // 의존성 포함

  const memoizedValue = useMemo(() => {
    return computeExpensiveValue(userId, user);
  }, [userId, user]);  // 모든 의존성 포함
}

// ✅ 함수를 useCallback으로 래핑하여 의존성 안정화
function MyComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  const fetchUserData = useCallback(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
}
```

## 📦 Next.js 기본 규칙

### `next/core-web-vitals`

프로덕션 성능과 접근성을 위한 필수 규칙들:

- `@next/next/no-html-link-for-pages`: `<Link>` 컴포넌트 사용 강제
- `@next/next/no-sync-scripts`: 동기 스크립트 금지
- `jsx-a11y/*`: 접근성 규칙들
- `react-hooks/rules-of-hooks`: Hook 사용 규칙

### `next/typescript`

Next.js TypeScript 통합을 위한 규칙들:

- TypeScript 파일 (.ts, .tsx)에 대한 특별한 처리
- Next.js API 라우트의 타입 안전성
- 서버 컴포넌트와 클라이언트 컴포넌트 구분

## 🛠️ 추가 권장 규칙

### 현재 설정에 추가할 수 있는 유용한 규칙들

```javascript
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 현재 설정
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn", 
      "react-hooks/exhaustive-deps": "warn",

      // 추가 권장 규칙들
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    }
  }
];
```

#### 추가 규칙 설명

**`@typescript-eslint/no-unsafe-assignment`**
```typescript
// ❌ any에서 할당 금지
const data: string = anyValue;  // 오류

// ✅ 타입 검증 후 할당
const data: string = isString(anyValue) ? anyValue : '';
```

**`@typescript-eslint/no-unsafe-call`**
```typescript
// ❌ any 타입 함수 호출 금지
anyFunction();  // 오류

// ✅ 타입 가드 사용
if (typeof anyFunction === 'function') {
  anyFunction();
}
```

**`@typescript-eslint/prefer-as-const`**
```typescript
// ❌ 문자열 리터럴 타입 대신 const assertion 권장
const direction = 'left' as 'left';  // 경고

// ✅ as const 사용
const direction = 'left' as const;
```

## 🔍 린팅 명령어

### 기본 명령어
```bash
# 전체 린팅 검사
pnpm lint

# 자동 수정 가능한 문제들 수정
pnpm lint --fix

# 경고도 오류로 처리 (엄격 모드)
pnpm lint:strict  # = pnpm lint --max-warnings 0
```

### 특정 파일 검사
```bash
# 특정 파일만 검사
npx eslint src/components/MyComponent.tsx

# 특정 디렉토리 검사
npx eslint src/features/auth/

# 특정 패턴 파일들 검사
npx eslint "src/**/*.{ts,tsx}"
```

### any 타입 전용 검사
```bash
# any 타입 사용 검색 (우리 커스텀 스크립트)
pnpm verify:any

# ESLint로 any 타입 오류만 보기
npx eslint . --ext .ts,.tsx | grep "no-explicit-any"
```

## 🚨 오류 해결 가이드

### 일반적인 오류와 해결책

#### 1. no-explicit-any 오류
```bash
error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

해결 방법:
1. 구체적인 타입으로 변경
2. unknown 타입 사용 후 타입 가드
3. Generic 타입 활용
4. 유니온 타입 사용
```

#### 2. no-unused-vars 경고
```bash
warning  'unusedVariable' is defined but never used  @typescript-eslint/no-unused-vars

해결 방법:
1. 사용하지 않는 변수 제거
2. 의도적 미사용은 _ 접두사 추가
3. 불필요한 import 제거
```

#### 3. exhaustive-deps 경고
```bash
warning  React Hook useEffect has a missing dependency: 'userId'  react-hooks/exhaustive-deps

해결 방법:
1. 누락된 의존성을 배열에 추가
2. useCallback으로 함수 메모이제이션
3. 의존성이 변경되어서는 안 되는 경우 ref 사용
```

## 📊 CI/CD 통합

### GitHub Actions 워크플로우
```yaml
name: Lint Check
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - name: Run ESLint
        run: |
          npm run lint:strict  # 경고도 실패로 처리
          npm run verify:any   # any 타입 검증
```

### Pre-commit Hook
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

## 🎯 베스트 프랙티스

### 1. 개발 중 실시간 검사
- **VSCode ESLint 확장 설치**: 실시간 오류 표시
- **자동 수정 설정**: 저장 시 자동으로 수정 가능한 문제들 해결
- **문제 패널 활용**: VSCode 하단 문제 패널에서 모든 ESLint 오류 확인

### 2. 커밋 전 검증
```bash
# 커밋 전 필수 체크리스트
pnpm type-check      # TypeScript 컴파일 오류 확인
pnpm lint:strict     # ESLint 오류 및 경고 모두 해결
pnpm verify:any      # any 타입 사용 여부 재확인
pnpm build           # 빌드 성공 확인
```

### 3. 팀 협업 규칙
- **경고도 해결**: `warn` 설정이라도 무시하지 말고 해결
- **일관된 스타일**: ESLint 규칙은 팀의 코딩 스타일 통일
- **점진적 적용**: 기존 프로젝트에서는 단계적으로 규칙 강화

## 🔄 규칙 업그레이드 계획

### 단계별 규칙 강화 로드맵

#### Phase 1 (현재 - 완료)
- ✅ `@typescript-eslint/no-explicit-any`: "error"
- ✅ 기본 TypeScript 규칙 활성화
- ✅ React Hooks 규칙 활성화

#### Phase 2 (다음 단계)
- `@typescript-eslint/no-unsafe-*` 규칙들 추가
- `@typescript-eslint/explicit-function-return-type` 추가
- 접근성 규칙 강화

#### Phase 3 (미래)
- 성능 최적화 규칙 추가
- 보안 관련 규칙 강화
- 커스텀 규칙 개발

---

**⚠️ 중요**: 모든 ESLint 오류는 **빌드 실패**를 의미합니다. 개발 중 실시간으로 문제를 해결하여 CI/CD 파이프라인에서 실패하지 않도록 주의하세요.