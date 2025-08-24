# TypeScript any 타입 엄격 규칙

> CP9 프로젝트의 완전한 타입 안전성을 위한 엄격한 TypeScript 규칙

## 🚫 절대 금지 사항

### 1. any 타입 사용 완전 금지

```typescript
// ❌ 절대 금지
let data: any = getData();
function process(input: any): any { }
const users: any[] = [];

// ✅ 올바른 방법
let data: UserProfile = getData();
function process(input: ProductData): ProcessedResult { }
const users: UserProfile[] = [];
```

**적용 범위**: 모든 프로덕션 코드, 타입 정의, 인터페이스

**예외 없음**: 외부 라이브러리, 레거시 코드, 임시 코드 등 어떤 경우에도 any 사용 금지

### 2. 암시적 any 방지

```typescript
// ❌ 암시적 any 발생
function handleData(data) { // Parameter 'data' implicitly has an 'any' type
  return data.map(item => item.process()); // item도 any
}

// ✅ 명시적 타입 정의
function handleData<T extends ProcessableItem>(data: T[]): ProcessedItem[] {
  return data.map(item => item.process());
}
```

## ✅ 필수 준수 원칙

### 1. 명시적 타입 정의 원칙

**모든 변수, 함수 매개변수, 반환값에 명시적 타입 지정**

```typescript
// 변수
const productCount: number = 42;
const userName: string = "사용자";
const isActive: boolean = true;

// 함수
function calculateTotal(
  items: CartItem[], 
  discountRate: number = 0
): CalculationResult {
  // 구현...
  return {
    subtotal: 0,
    discount: 0,
    total: 0,
    currency: 'KRW'
  };
}

// 객체
interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  notifications: boolean;
}
```

### 2. unknown 타입 활용 원칙

**타입을 알 수 없는 경우 unknown 사용 후 타입 가드로 검증**

```typescript
// ✅ unknown 사용
function processApiResponse(response: unknown): ProcessedData {
  // 타입 가드로 검증
  if (isValidApiResponse(response)) {
    return transformResponse(response);
  }
  throw new Error('Invalid API response format');
}

// 타입 가드 정의
function isValidApiResponse(data: unknown): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'data' in data
  );
}
```

### 3. Generic 타입 적극 활용

```typescript
// ✅ 재사용 가능한 Generic 함수
function createApiClient<TConfig, TResponse>(
  config: TConfig
): ApiClient<TResponse> {
  return new ApiClient<TResponse>(config);
}

// ✅ Generic 인터페이스
interface Repository<T> {
  find(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## 🛡️ 타입 안전성 패턴

### 1. 유니온 타입 활용

```typescript
// 상태 타입
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type SortOrder = 'asc' | 'desc' | 'none';

// 조건부 타입
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  errorCode: number;
};
```

### 2. 브랜드 타입 패턴

```typescript
// ID 타입 안전성 보장
type UserId = string & { readonly brand: unique symbol };
type ProductId = string & { readonly brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function getUser(id: UserId): Promise<User> {
  // UserId만 받을 수 있음
}
```

### 3. 타입 가드와 Discriminated Union

```typescript
// Discriminated Union
type NetworkState = 
  | { type: 'loading' }
  | { type: 'success'; data: ApiData }
  | { type: 'error'; error: string };

// 타입 가드
function isSuccessState(state: NetworkState): state is { type: 'success'; data: ApiData } {
  return state.type === 'success';
}

// 사용
function handleNetworkState(state: NetworkState) {
  if (isSuccessState(state)) {
    // state.data는 자동으로 ApiData 타입
    console.log(state.data);
  }
}
```

## ⚠️ 위험한 패턴과 대안

### 1. 타입 단언 남용 방지

```typescript
// ❌ 위험한 타입 단언
const user = apiResponse as User; // 런타임 오류 가능성

// ✅ 안전한 타입 검증
function parseUser(data: unknown): User {
  if (isUserData(data)) {
    return data;
  }
  throw new Error('Invalid user data');
}

function isUserData(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string'
  );
}
```

### 2. Object.keys 타입 안전성

```typescript
// ❌ 타입 안전하지 않음
const user: User = { id: '1', name: 'John', email: 'john@example.com' };
Object.keys(user).forEach(key => {
  console.log(user[key]); // key는 string이지만 User의 키가 아닐 수 있음
});

// ✅ 타입 안전한 방법
function getObjectKeys<T extends Record<string, unknown>>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

getObjectKeys(user).forEach(key => {
  console.log(user[key]); // 타입 안전
});
```

### 3. 외부 라이브러리 타입 처리

```typescript
// ❌ any로 처리
declare module 'some-library' {
  export function someFunction(data: any): any;
}

// ✅ 구체적인 타입 정의
declare module 'some-library' {
  export interface SomeLibraryOptions {
    apiKey: string;
    timeout?: number;
  }
  
  export interface SomeLibraryResponse<T = unknown> {
    success: boolean;
    data: T;
  }
  
  export function someFunction<T = unknown>(
    options: SomeLibraryOptions
  ): Promise<SomeLibraryResponse<T>>;
}
```

## 🔍 검증 및 도구

### 1. 타입 검사 명령어

```bash
# 전체 타입 검사
pnpm type-check

# any 타입 사용 검색
pnpm verify:any

# 엄격한 린팅 (any 타입 시 빌드 실패)
pnpm lint:strict

# 전체 검증 (타입 + 린팅)
pnpm verify
```

### 2. IDE 설정 권장사항

```json
// .vscode/settings.json
{
  "typescript.preferences.strictMode": true,
  "typescript.preferences.noImplicitAny": true,
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🎯 성과 측정

### 타입 안전성 KPI
- **any 타입 사용률**: 0% (절대 목표)
- **타입 커버리지**: 100%
- **TypeScript 엄격 모드**: 모든 옵션 활성화
- **빌드 시 타입 오류**: 0건

### 품질 지표
- 런타임 타입 오류 감소율: 95% 이상
- API 응답 처리 오류 감소: 90% 이상
- 코드 리뷰 시 타입 관련 이슈: 5% 미만

## 📚 학습 자료

### 필수 TypeScript 개념
1. **Union Types & Intersection Types**
2. **Generic Types & Constraints**
3. **Conditional Types**
4. **Mapped Types**
5. **Type Guards & Type Predicates**
6. **Utility Types (Pick, Omit, Record, etc.)**

### 권장 리소스
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TS Best Practices](https://typescript-eslint.io/rules/)

---

**💡 기억하세요**: 타입 안전성은 코드 품질의 기초입니다. any 타입은 TypeScript의 모든 이점을 무효화시킵니다.