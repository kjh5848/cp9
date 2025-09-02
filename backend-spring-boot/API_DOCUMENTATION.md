# CP9 Backend API Documentation

## 프론트엔드 연동 가이드

Spring Boot 3.5.5 기반 레이어드 아키텍처 백엔드 API의 프론트엔드 연동을 위한 종합 문서입니다.

## 📋 목차
- [인증 시스템](#인증-시스템)
- [API 엔드포인트](#api-엔드포인트)
- [JWT 토큰 관리](#jwt-토큰-관리)
- [역할 기반 접근 제어](#역할-기반-접근-제어)
- [에러 처리](#에러-처리)
- [Swagger UI 활용](#swagger-ui-활용)
- [프론트엔드 예제 코드](#프론트엔드-예제-코드)

---

## 🔐 인증 시스템

### JWT 토큰 기반 인증
- **Access Token**: 15분 유효기간, API 요청 시 사용
- **Refresh Token**: 7일 유효기간, Access Token 갱신용
- **Remember Me Token**: 30일 유효기간, 자동 로그인용

### 인증 헤더 형식
```
Authorization: Bearer {access_token}
```

### 토큰 전송 방법 (우선순위 순)
1. **Authorization 헤더** (권장)
2. **Query Parameter**: `?token={jwt_token}` (WebSocket 연결용)
3. **Cookie**: `accessToken={jwt_token}` (Remember Me 기능용)

---

## 🛡️ 역할 기반 접근 제어 (RBAC)

### 역할 계층 구조
```
ROLE_SUPER_ADMIN > ROLE_ADMIN > ROLE_MANAGER > ROLE_USER > ROLE_GUEST
```

### 역할별 접근 권한
| 역할 | 접근 가능 경로 | 설명 |
|------|---------------|------|
| `ROLE_GUEST` | `/api/public/**`, `/api/auth/**` | 비인증 사용자 |
| `ROLE_USER` | `GUEST` + `/api/user/**` | 일반 사용자 |
| `ROLE_MANAGER` | `USER` + `/api/manager/**` | 중간 관리자 |
| `ROLE_ADMIN` | `MANAGER` + `/api/admin/**` | 일반 관리자 |
| `ROLE_SUPER_ADMIN` | `ADMIN` + `/api/admin/super/**` | 최고 관리자 |

---

## 📡 API 엔드포인트

### 🔑 인증 API (`/api/auth/*`)

#### 사용자 등록
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**응답**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "roles": ["ROLE_USER"],
    "enabled": true
  }
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "string",
  "password": "string",
  "rememberMe": false
}
```

**응답**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "name": "Test User",
      "roles": ["ROLE_USER"]
    }
  }
}
```

#### 토큰 갱신
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

#### 로그아웃
```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

#### 비밀번호 재설정 요청
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "string"
}
```

#### 비밀번호 재설정
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "string",
  "newPassword": "string"
}
```

#### 이메일 인증
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "string"
}
```

### 👤 사용자 API (`/api/user/*`)

#### 프로필 조회
```http
GET /api/user/profile
Authorization: Bearer {access_token}
```

#### 프로필 수정
```http
PUT /api/user/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "email": "string"
}
```

#### 비밀번호 변경
```http
PUT /api/user/password
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### 👑 관리자 API (`/api/admin/*`)

#### 사용자 목록 조회
```http
GET /api/admin/users?page=0&size=20&sort=createdAt,desc
Authorization: Bearer {access_token}
```

#### 사용자 상세 조회
```http
GET /api/admin/users/{userId}
Authorization: Bearer {access_token}
```

#### 사용자 역할 수정
```http
PUT /api/admin/users/{userId}/roles
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "roles": ["ROLE_USER", "ROLE_MANAGER"]
}
```

#### 사용자 활성화/비활성화
```http
PUT /api/admin/users/{userId}/status
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "enabled": true
}
```

---

## 🎯 JWT 토큰 관리

### 토큰 검증
클라이언트에서 토큰 유효성을 확인할 때 사용할 수 있는 정보:

```javascript
// JWT payload 구조
{
  "sub": "username",           // 사용자명
  "userId": 1,                 // 사용자 ID
  "email": "test@example.com", // 이메일
  "name": "Test User",         // 이름
  "roles": ["ROLE_USER"],      // 역할 목록
  "permissions": [],           // 권한 목록
  "type": "access",            // 토큰 타입
  "iss": "cp9-backend",        // 발행자
  "iat": 1640995200,           // 발행 시간
  "exp": 1640996100            // 만료 시간
}
```

### 토큰 갱신 전략
1. **자동 갱신**: 토큰 만료 5분 전 자동 갱신
2. **요청별 확인**: API 응답에서 토큰 만료 임박 헤더 확인
3. **에러 기반 갱신**: 401 응답 시 refresh token으로 갱신

### 프론트엔드 토큰 관리 예제
```javascript
class TokenManager {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isTokenExpired(token) {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  }

  async refreshAccessToken() {
    if (!this.refreshToken || this.isTokenExpired(this.refreshToken)) {
      this.clearTokens();
      window.location.href = '/login';
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return data.data.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    window.location.href = '/login';
    return null;
  }
}
```

---

## ⚠️ 에러 처리

### HTTP 상태 코드
| 코드 | 의미 | 설명 |
|------|------|------|
| `200` | OK | 요청 성공 |
| `201` | Created | 리소스 생성 성공 |
| `400` | Bad Request | 잘못된 요청 |
| `401` | Unauthorized | 인증 필요 |
| `403` | Forbidden | 권한 부족 |
| `404` | Not Found | 리소스 없음 |
| `409` | Conflict | 데이터 충돌 |
| `500` | Internal Server Error | 서버 오류 |

### 에러 응답 형식
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required to access this resource",
  "path": "/api/user/profile",
  "timestamp": "2024-01-01T12:00:00"
}
```

### 개발 환경 추가 정보
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required to access this resource",
  "path": "/api/user/profile",
  "timestamp": "2024-01-01T12:00:00",
  "detail": "JWT token is missing or invalid",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer invalid_token",
    "Content-Type": "application/json"
  }
}
```

---

## 📚 Swagger UI 활용

### 접속 방법
1. **개발 서버**: `http://localhost:8080/swagger-ui/index.html`
2. **프로덕션**: `https://api.cp9.com/swagger-ui/index.html`

### JWT 인증 설정
1. Swagger UI 우상단의 "Authorize" 버튼 클릭
2. "JWT Authentication" 입력란에 토큰 입력: `Bearer {your_token}`
3. "Authorize" 클릭하여 인증 설정

### API 그룹
- **Auth API**: 인증 관련 엔드포인트
- **User API**: 사용자 기능 엔드포인트  
- **Admin API**: 관리자 기능 엔드포인트

---

## 💻 프론트엔드 예제 코드

### React + Axios 예제
```javascript
import axios from 'axios';

// Axios 인터셉터 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
});

// 요청 인터셉터 - JWT 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 갱신 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API 호출 함수들
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, newPassword: password })
};

export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (profileData) => apiClient.put('/user/profile', profileData),
  changePassword: (passwordData) => apiClient.put('/user/password', passwordData)
};

export const adminAPI = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUser: (userId) => apiClient.get(`/admin/users/${userId}`),
  updateUserRoles: (userId, roles) => apiClient.put(`/admin/users/${userId}/roles`, { roles }),
  updateUserStatus: (userId, enabled) => apiClient.put(`/admin/users/${userId}/status`, { enabled })
};
```

### Vue.js 3 + Composition API 예제
```javascript
// composables/useAuth.js
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export function useAuth() {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken'));
  const refreshToken = ref(localStorage.getItem('refreshToken'));
  const router = useRouter();

  const isAuthenticated = computed(() => {
    return !!accessToken.value && !isTokenExpired(accessToken.value);
  });

  const userRoles = computed(() => {
    if (!user.value) return [];
    return user.value.roles || [];
  });

  const hasRole = (role) => {
    return userRoles.value.includes(role);
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.data.accessToken, data.data.refreshToken);
        user.value = data.data.user;
        router.push('/dashboard');
        return data;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken.value}` }
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearTokens();
      user.value = null;
      router.push('/login');
    }
  };

  const setTokens = (access, refresh) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  };

  const clearTokens = () => {
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    userRoles,
    hasRole,
    login,
    logout,
    setTokens,
    clearTokens
  };
}
```

---

## 🔧 개발 환경 설정

### CORS 설정
현재 모든 오리진에서의 요청을 허용하도록 설정되어 있습니다. 프로덕션 환경에서는 특정 도메인만 허용하도록 수정하세요.

### 개발 서버 실행
```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### API 테스트 도구
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **H2 콘솔**: `http://localhost:8080/h2-console` (개발환경만)
- **Actuator Health**: `http://localhost:8080/management/health`

---

## 📞 문의사항

API 사용 중 문제가 발생하거나 추가 기능이 필요한 경우:
- 이슈 등록: [GitHub Issues](https://github.com/cp9/backend/issues)
- 이메일: dev@cp9.com
- Swagger UI의 "Try it out" 기능을 활용한 실시간 테스트 권장

---

*이 문서는 API 변경사항에 따라 지속적으로 업데이트됩니다.*