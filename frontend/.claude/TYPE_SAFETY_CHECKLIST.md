# TypeScript 타입 안전성 체크리스트

> 개발자를 위한 필수 타입 안전성 검증 가이드

## 🔍 코딩 중 실시간 체크

### ✅ 변수 선언 시
- [ ] 모든 변수에 명시적 타입 지정
- [ ] `let data: any` 대신 구체적 타입 사용
- [ ] 초기값으로 타입 추론 가능한 경우에도 명시적 타입 권장

```typescript
// ✅ Good
const userId: string = '12345';
const userCount: number = users.length;
const isValid: boolean = checkValidation(data);

// ❌ Avoid
let someData; // 암시적 any
const result: any = apiCall(); // 명시적 any 금지
```

### ✅ 함수 정의 시
- [ ] 모든 매개변수에 타입 지정
- [ ] 반환 타입 명시적 지정
- [ ] Generic 사용 시 constraints 고려
- [ ] Optional 매개변수 적절히 활용

```typescript
// ✅ Good
function processUser(
  user: UserProfile, 
  options: ProcessOptions = {}
): Promise<ProcessedUser> {
  // 구현
}

// ✅ Generic with constraints
function updateEntity<T extends BaseEntity>(
  entity: T, 
  updates: Partial<T>
): Promise<T> {
  // 구현
}
```

### ✅ 객체 및 배열 처리 시
- [ ] 인터페이스로 객체 구조 정의
- [ ] 배열 요소 타입 명시
- [ ] 중첩 객체도 타입 정의
- [ ] Optional 속성 적절히 표시

```typescript
// ✅ Good
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

const users: UserProfile[] = await fetchUsers();
const response: ApiResponse<UserProfile[]> = await api.getUsers();
```

## 🚨 커밋 전 필수 검증

### 1. 타입 체크 실행
```bash
# 전체 프로젝트 타입 검사
pnpm type-check

# 에러 발생 시 수정 후 재실행
# ✅ 0 errors 확인 필수
```

### 2. any 타입 사용 검색
```bash
# any 타입 사용 여부 확인
pnpm verify:any

# 출력 결과가 비어있어야 함
# 발견 시 즉시 수정 필요
```

### 3. 엄격 린팅 검사
```bash
# any 타입 에러를 포함한 엄격 검사
pnpm lint:strict

# 모든 에러 및 경고 해결 필수
# 특히 @typescript-eslint/no-explicit-any 오류
```

### 4. 통합 검증
```bash
# 타입 체크 + 엄격 린팅 한 번에
pnpm verify

# ✅ 모든 검사 통과 필수
```

## 📝 Pull Request 체크리스트

### 코드 변경사항 검토
- [ ] **새로 추가된 모든 코드에 적절한 타입 정의**
- [ ] **수정된 기존 코드의 타입 일관성 유지**
- [ ] **삭제된 타입 정의로 인한 영향 검토**
- [ ] **API 응답 타입 정의 및 검증 로직 확인**

### 타입 안전성 검증
- [ ] **any 타입 사용하지 않음**
- [ ] **unknown 타입 사용 시 적절한 타입 가드 구현**
- [ ] **타입 단언 사용 시 안전성 확보**
- [ ] **외부 라이브러리 타입 정의 적절성**

### 테스트 및 문서화
- [ ] **타입 변경으로 인한 기존 테스트 영향 확인**
- [ ] **새로운 타입에 대한 테스트 케이스 작성**
- [ ] **복잡한 타입의 경우 주석으로 설명 추가**
- [ ] **Public API 변경 시 문서 업데이트**

## 🛠️ IDE 실시간 검증 설정

### VSCode 필수 확장
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode"
  ]
}
```

### VSCode 설정
```json
// .vscode/settings.json
{
  "typescript.preferences.strictMode": true,
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.addMissingImports": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### 타입 오류 우선순위 설정
```json
// tsconfig.json 확인사항
{
  "compilerOptions": {
    "strict": true,                    // ✅ 반드시 true
    "noImplicitAny": true,            // ✅ 반드시 true  
    "strictNullChecks": true,         // ✅ 반드시 true
    "strictFunctionTypes": true,      // ✅ 반드시 true
    "noImplicitReturns": true,        // ✅ 반드시 true
    "noImplicitThis": true            // ✅ 반드시 true
  }
}
```

## 🚀 CI/CD 파이프라인 검증

### GitHub Actions 워크플로우 체크
```yaml
# .github/workflows/type-check.yml
name: Type Safety Check
on: [push, pull_request]
jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check    # TypeScript 검사
      - run: npm run verify:any    # any 타입 검색
      - run: npm run lint:strict   # 엄격 린팅
```

### 빌드 실패 조건
- `pnpm type-check` 실패 시
- `pnpm lint:strict` 에서 any 타입 오류 발견 시
- TypeScript 컴파일 에러 발생 시
- 암시적 any 타입 사용 감지 시

## ⚡ 빠른 문제 해결

### 자주 발생하는 타입 오류

#### 1. Parameter implicitly has an 'any' type
```typescript
// ❌ 문제
function handle(data) { } // Parameter 'data' implicitly has an 'any' type

// ✅ 해결
function handle(data: UserData) { }
function handle<T>(data: T) { }
function handle(data: unknown) { } // 타입 미확정 시
```

#### 2. Object is of type 'unknown'
```typescript
// ❌ 문제
function process(data: unknown) {
  return data.id; // Object is of type 'unknown'
}

// ✅ 해결 - 타입 가드 사용
function process(data: unknown) {
  if (isUserData(data)) {
    return data.id; // 이제 data는 UserData 타입
  }
}

function isUserData(data: unknown): data is UserData {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

#### 3. Type assertion vs Type guard
```typescript
// ❌ 위험한 타입 단언
const user = response as User;

// ✅ 안전한 타입 검증
function parseUser(response: unknown): User {
  if (!isUser(response)) {
    throw new Error('Invalid user response');
  }
  return response;
}
```

### 응급 처치 명령어
```bash
# 1. 모든 any 타입 찾기
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# 2. 암시적 any 찾기 (TypeScript 컴파일러)
npx tsc --noEmit --strict

# 3. ESLint any 타입 오류만 보기
npx eslint src/ --ext .ts,.tsx | grep "no-explicit-any"

# 4. 특정 파일 타입 검사
npx tsc --noEmit src/specific/file.ts
```

## 📊 품질 측정 지표

### 매일 확인사항
- [ ] **CI/CD 빌드 성공률**: 100%
- [ ] **타입 체크 통과율**: 100%
- [ ] **any 타입 사용 건수**: 0건
- [ ] **새로운 타입 오류 발생**: 0건

### 주간 리뷰 항목
- [ ] **타입 관련 버그 발생 현황**
- [ ] **API 타입 정의 정확성**
- [ ] **타입 가드 커버리지**
- [ ] **External library 타입 정의 상태**

### 월간 개선 계획
- [ ] **복잡한 타입 리팩토링**
- [ ] **타입 유틸리티 함수 개선**
- [ ] **타입 안전성 교육 및 가이드 업데이트**
- [ ] **새로운 TypeScript 기능 도입 검토**

---

**⚠️ 중요**: 이 체크리스트의 모든 항목은 **필수사항**입니다. 타입 안전성은 타협할 수 없는 품질 기준입니다.