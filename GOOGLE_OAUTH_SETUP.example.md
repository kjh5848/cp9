# Google OAuth Setup Guide

## 1. Google Cloud Console에서 OAuth 2.0 클라이언트 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" > "Credentials" 이동
4. "Create Credentials" > "OAuth client ID" 선택

## 2. OAuth 동의 화면 구성

- **Application type**: Web application
- **Name**: Your App Name
- **Authorized JavaScript origins**: 
  - `http://localhost:3000` (개발용)
  - `https://your-domain.com` (프로덕션용)
- **Authorized redirect URIs**:
  - `http://localhost:54321/auth/v1/callback` (Supabase 로컬)
  - `https://your-project.supabase.co/auth/v1/callback` (Supabase 프로덕션)

## 3. 환경 변수 설정

생성된 OAuth 클라이언트의 정보를 환경 변수에 설정:

```bash
# .env.local 파일에 추가
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 4. Supabase Dashboard 설정

1. Supabase Dashboard > Authentication > Providers
2. Google Provider 활성화
3. Client ID와 Client Secret 입력
4. Redirect URL 확인 및 Google Console에 추가

## 5. 주의사항

- **절대 실제 Client ID/Secret을 커밋하지 마세요**
- 환경 변수 파일은 `.gitignore`에 포함되어야 합니다
- 프로덕션 환경에서는 별도의 OAuth 클라이언트를 사용하세요
- 정기적으로 Secret을 교체하여 보안을 강화하세요