# TypeScript 타입 패턴 라이브러리

> CP9 프로젝트에서 자주 사용되는 TypeScript 타입 패턴과 템플릿 모음

## 🎯 패턴 사용 가이드

이 문서의 모든 패턴은 **any 타입 금지 규칙**을 준수하며, 실제 프로덕션 환경에서 검증된 패턴들입니다.

## 📦 API 응답 패턴

### 1. Generic API Response

```typescript
// 기본 API 응답 인터페이스
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// 페이지네이션 응답
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message?: string;
}

// 사용 예시
type UserListResponse = PaginatedResponse<UserProfile>;
type ProductResponse = ApiResponse<ProductItem>;
```

### 2. Error Response 패턴

```typescript
// 에러 응답 타입
interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// 성공/실패 구분되는 유니온 타입
type ApiResult<T> = 
  | { success: true; data: T; message?: string; }
  | { success: false; error: string; errorCode: string; };

// 사용 예시
async function fetchUser(id: string): Promise<ApiResult<UserProfile>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to fetch user', 
      errorCode: 'FETCH_ERROR' 
    };
  }
}
```

### 3. 타입 가드 패턴

```typescript
// API 응답 타입 검증
function isSuccessResponse<T>(
  response: ApiResult<T>
): response is { success: true; data: T; message?: string; } {
  return response.success === true;
}

function isErrorResponse<T>(
  response: ApiResult<T>
): response is { success: false; error: string; errorCode: string; } {
  return response.success === false;
}

// 사용 예시
const userResult = await fetchUser('123');
if (isSuccessResponse(userResult)) {
  // userResult.data는 자동으로 UserProfile 타입
  console.log(userResult.data.name);
} else {
  // userResult는 자동으로 ErrorResponse 타입
  console.error(userResult.error);
}
```

## 🎨 React 컴포넌트 패턴

### 1. Props 인터페이스 패턴

```typescript
// 기본 컴포넌트 Props
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

// 확장 가능한 Props
interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Generic 컴포넌트 Props
interface SelectProps<T> extends BaseComponentProps {
  options: Array<{
    value: T;
    label: string;
    disabled?: boolean;
  }>;
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
}

// 사용 예시
function UserRoleSelect() {
  const [role, setRole] = useState<'admin' | 'user' | 'guest'>('user');
  
  return (
    <Select<'admin' | 'user' | 'guest'>
      value={role}
      onChange={setRole}
      options={[
        { value: 'admin', label: '관리자' },
        { value: 'user', label: '일반 사용자' },
        { value: 'guest', label: '게스트' }
      ]}
    />
  );
}
```

### 2. Hook 패턴

```typescript
// Hook 반환 타입 정의
interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Generic Hook
function useApiData<T>(url: string): UseApiDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  };
}

// 사용 예시
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useApiData<UserProfile>(`/api/users/${userId}`);
  
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!user) return <div>사용자를 찾을 수 없습니다</div>;
  
  return <div>{user.name}</div>;
}
```

### 3. Context 패턴

```typescript
// Context 상태 타입 정의
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Context 액션 타입 정의
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: UserProfile }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

// Context 타입 정의
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Context 생성 (기본값 필수)
const AuthContext = createContext<AuthContextType | null>(null);

// Provider 컴포넌트
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout: () => dispatch({ type: 'LOGOUT' }),
    refreshUser: async () => {
      // 구현...
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook 사용 패턴
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## 🔧 유틸리티 타입 패턴

### 1. 조건부 타입 패턴

```typescript
// 키에 따른 값 타입 추출
type ExtractValueType<T, K extends keyof T> = T[K];

// 함수 타입에서 매개변수 추출
type ExtractParams<T> = T extends (...args: infer P) => unknown ? P : never;

// 배열에서 요소 타입 추출
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Promise에서 결과 타입 추출
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// 사용 예시
type ButtonClickHandler = (event: React.MouseEvent) => void;
type ClickParams = ExtractParams<ButtonClickHandler>; // [React.MouseEvent]

type UserArray = UserProfile[];
type User = ArrayElement<UserArray>; // UserProfile

type AsyncUserData = Promise<UserProfile>;
type UserData = UnwrapPromise<AsyncUserData>; // UserProfile
```

### 2. 브랜드 타입 패턴

```typescript
// ID 타입 안전성을 위한 브랜드 타입
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };
type OrderId = string & { readonly __brand: 'OrderId' };

// 브랜드 타입 생성 함수
function createUserId(id: string): UserId {
  return id as UserId;
}

function createProductId(id: string): ProductId {
  return id as ProductId;
}

// 타입 안전한 함수
function getUserById(id: UserId): Promise<UserProfile> {
  return fetch(`/api/users/${id}`).then(res => res.json());
}

function getProductById(id: ProductId): Promise<ProductItem> {
  return fetch(`/api/products/${id}`).then(res => res.json());
}

// 사용 예시
const userId = createUserId('user_123');
const productId = createProductId('product_456');

getUserById(userId);        // ✅ 올바름
getUserById(productId);     // ❌ 타입 오류 - ProductId를 UserId로 사용할 수 없음
```

### 3. 유니온 및 매핑 타입 패턴

```typescript
// 상태 기반 유니온 타입
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// 매핑 타입으로 Optional 만들기
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 매핑 타입으로 Readonly 만들기
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 사용 예시
interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
  avatar?: string;
}

// age를 선택적으로 만들기
type CreateUserOptionalAge = Optional<CreateUserRequest, 'age'>;
// { name: string; email: string; age?: number; avatar?: string; }

// 전체를 읽기 전용으로 만들기
type ReadonlyUserRequest = DeepReadonly<CreateUserRequest>;
```

## 📊 상태 관리 패턴

### 1. Reducer 패턴

```typescript
// 상태 타입 정의
interface TodoState {
  items: TodoItem[];
  filter: 'all' | 'active' | 'completed';
  loading: boolean;
  error: string | null;
}

// 액션 타입 정의
type TodoAction = 
  | { type: 'ADD_TODO'; payload: { text: string; id: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'SET_FILTER'; payload: TodoState['filter'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Reducer 함수
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        items: [...state.items, {
          id: action.payload.id,
          text: action.payload.text,
          completed: false,
          createdAt: new Date().toISOString()
        }]
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, completed: !item.completed }
            : item
        )
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    default:
      // TypeScript는 여기에 도달할 수 없음을 보장
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled action: ${exhaustiveCheck}`);
  }
}
```

### 2. Custom Hook State 패턴

```typescript
// Hook 상태 관리 패턴
interface UseToggleReturn {
  isOn: boolean;
  toggle: () => void;
  turnOn: () => void;
  turnOff: () => void;
}

function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [isOn, setIsOn] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setIsOn(prev => !prev);
  }, []);

  const turnOn = useCallback(() => {
    setIsOn(true);
  }, []);

  const turnOff = useCallback(() => {
    setIsOn(false);
  }, []);

  return {
    isOn,
    toggle,
    turnOn,
    turnOff
  };
}

// 복잡한 상태 관리 Hook
interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

function useAsyncOperation<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>
): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (...args: unknown[]): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args);
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw err;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}
```

## 🔍 Form 처리 패턴

### 1. 타입 안전한 Form 패턴

```typescript
// Form 데이터 인터페이스
interface ContactFormData {
  name: string;
  email: string;
  message: string;
  agreeToTerms: boolean;
}

// Form 오류 타입
type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Form 상태 인터페이스
interface FormState<T> {
  data: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Form Hook
function useForm<T>(
  initialData: T,
  validate: (data: T) => FormErrors<T>
) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isValid: false
  });

  const setFieldValue = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: undefined }
    }));
  }, []);

  const setFieldError = useCallback(<K extends keyof T>(
    field: K,
    error: string
  ) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = validate(state.data);
    const isValid = Object.keys(errors).length === 0;
    
    setState(prev => ({
      ...prev,
      errors,
      isValid
    }));
    
    return isValid;
  }, [state.data, validate]);

  const handleSubmit = useCallback(async (
    onSubmit: (data: T) => Promise<void>
  ) => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(state.data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.data, validateForm]);

  return {
    data: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setFieldValue,
    setFieldError,
    handleSubmit,
    validateForm
  };
}

// 사용 예시
function ContactForm() {
  const validateContactForm = (data: ContactFormData): FormErrors<ContactFormData> => {
    const errors: FormErrors<ContactFormData> = {};
    
    if (!data.name.trim()) {
      errors.name = '이름을 입력해주세요';
    }
    
    if (!data.email.trim()) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    if (!data.agreeToTerms) {
      errors.agreeToTerms = '약관에 동의해주세요';
    }
    
    return errors;
  };

  const form = useForm<ContactFormData>(
    {
      name: '',
      email: '',
      message: '',
      agreeToTerms: false
    },
    validateContactForm
  );

  const handleSubmit = async (data: ContactFormData) => {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit(handleSubmit);
    }}>
      <input
        type="text"
        value={form.data.name}
        onChange={(e) => form.setFieldValue('name', e.target.value)}
        placeholder="이름"
      />
      {form.errors.name && <span className="error">{form.errors.name}</span>}
      
      {/* 다른 필드들... */}
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? '전송 중...' : '전송'}
      </button>
    </form>
  );
}
```

## 🌐 환경 변수 패턴

```typescript
// 환경 변수 타입 정의
interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  DATABASE_URL: string;
}

// 환경 변수 검증 함수
function validateEnvVariable<K extends keyof EnvironmentVariables>(
  key: K,
  value: string | undefined
): EnvironmentVariables[K] {
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  
  // NODE_ENV에 대한 특별 처리
  if (key === 'NODE_ENV') {
    if (!['development', 'production', 'test'].includes(value)) {
      throw new Error(`Invalid NODE_ENV: ${value}`);
    }
    return value as EnvironmentVariables[K];
  }
  
  return value as EnvironmentVariables[K];
}

// 타입 안전한 환경 변수 접근
export const env: EnvironmentVariables = {
  NODE_ENV: validateEnvVariable('NODE_ENV', process.env.NODE_ENV),
  NEXT_PUBLIC_API_URL: validateEnvVariable('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
  NEXT_PUBLIC_SUPABASE_URL: validateEnvVariable('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: validateEnvVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  DATABASE_URL: validateEnvVariable('DATABASE_URL', process.env.DATABASE_URL),
};

// 사용 예시
console.log('API URL:', env.NEXT_PUBLIC_API_URL); // 타입 안전
```

---

**💡 사용 팁**: 새로운 컴포넌트나 기능을 만들 때 이 패턴들을 참고하여 일관된 타입 안전한 코드를 작성하세요. 모든 패턴은 `any` 타입을 사용하지 않으며, 런타임 안전성을 보장합니다.