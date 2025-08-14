# Doppler 환경변수 관리 설정 가이드

## 🔐 중요: 보안 안내
이 문서의 API 키들은 모두 예시값입니다. 실제 값들은 Doppler에 안전하게 저장되어 있습니다.

## 0. Doppler CLI 설치 (새 PC 설정)

### Windows 설치
```bash
# 방법 1: winget 사용 (Windows 11/10 권장)
winget install --id Doppler.doppler

# 방법 2: Scoop 패키지 매니저 사용
# Scoop이 없다면 먼저 설치: https://scoop.sh
scoop bucket add dopplerhq https://github.com/DopplerHQ/scoop-bucket.git
scoop install doppler

# 방법 3: PowerShell 스크립트
# 관리자 권한 PowerShell에서 실행
$url = "https://cli.doppler.com/download?os=windows&arch=amd64&format=zip"
$output = "$env:TEMP\doppler.zip"
Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive -Path $output -DestinationPath "C:\Program Files\Doppler"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Doppler", [EnvironmentVariableTarget]::Machine)

# 방법 4: 수동 설치
# https://cli.doppler.com/download 에서 Windows용 바이너리 다운로드
# C:\Program Files\Doppler 폴더에 압축 해제
# 시스템 환경변수 PATH에 추가
```

### macOS 설치
```bash
# 방법 1: Homebrew 사용 (권장)
brew install dopplerhq/cli/doppler

# 방법 2: 직접 다운로드 (Apple Silicon)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/download?os=macos&arch=arm64 | tar xz
sudo mv ./doppler /usr/local/bin

# 방법 3: 직접 다운로드 (Intel)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/download?os=macos&arch=amd64 | tar xz
sudo mv ./doppler /usr/local/bin
```

### Linux 설치
```bash
# Ubuntu/Debian
# APT 저장소 추가
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt-get update && sudo apt-get install doppler

# RedHat/CentOS/Fedora
# YUM 저장소 추가
sudo rpm --import 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key'
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/config.rpm.txt' | sudo tee /etc/yum.repos.d/doppler-cli.repo
sudo yum install doppler

# Arch Linux
yay -S doppler-cli

# 범용 설치 스크립트
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sudo sh
```

### 설치 확인 및 PATH 설정
```bash
# 설치 확인
doppler --version

# PATH 문제 해결 (Windows)
# PowerShell에서 실행
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Doppler", [EnvironmentVariableTarget]::User)

# PATH 문제 해결 (macOS/Linux)
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 1. Doppler 계정 및 프로젝트 설정

### 1.1 Doppler 회원가입 및 로그인
```bash
# CLI로 로그인 (브라우저가 열림)
./doppler.bat login
```

### 1.2 프로젝트 생성
```bash
# 프로젝트 생성
./doppler.bat projects create cp9-frontend --description "CP9 Coupang Partners Frontend"

# 환경 생성
./doppler.bat environments create Development dev --project cp9-frontend
./doppler.bat environments create Staging stg --project cp9-frontend
./doppler.bat environments create Production prd --project cp9-frontend

# 설정 생성
./doppler.bat configs create dev --project cp9-frontend --environment dev
./doppler.bat configs create stg --project cp9-frontend --environment stg
./doppler.bat configs create prd --project cp9-frontend --environment prd
```

## 2. 환경변수 마이그레이션

### 2.1 기존 .env.local 파일 업로드 (권장)
```bash
# 가장 간단한 방법: 기존 파일을 통째로 업로드
./doppler.bat secrets upload .env.local --config dev
```

### 2.2 수동 환경변수 설정

#### 개발 환경 (dev)
```bash
# 기본 설정
./doppler.bat secrets set NODE_ENV=development --config dev
./doppler.bat secrets set NEXT_PUBLIC_ENV=local --config dev
./doppler.bat secrets set NEXT_PUBLIC_BASE_URL=http://localhost:3000 --config dev

# Supabase - 로컬 개발용
./doppler.bat secrets set NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 --config dev
./doppler.bat secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_supabase_anon_key --config dev
./doppler.bat secrets set SUPABASE_SERVICE_ROLE_KEY=your_local_supabase_service_role_key --config dev

# API Keys (실제 값으로 설정하세요)
./doppler.bat secrets set COUPANG_ACCESS_KEY=your_coupang_access_key --config dev
./doppler.bat secrets set COUPANG_SECRET_KEY=your_coupang_secret_key --config dev
./doppler.bat secrets set OPENAI_API_KEY=your_openai_api_key --config dev
./doppler.bat secrets set PERPLEXITY_API_KEY=your_perplexity_api_key --config dev

# Google OAuth (실제 값으로 설정하세요)
./doppler.bat secrets set GOOGLE_CLIENT_ID=your_google_client_id --config dev
./doppler.bat secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret --config dev

# WordPress (실제 값으로 설정하세요)
./doppler.bat secrets set WORDPRESS_API_KEY="your_wordpress_api_key" --config dev
./doppler.bat secrets set WORDPRESS_SITE_URL=your_wordpress_site_url --config dev
```

#### 스테이징 환경 (stg)
```bash
# 기본 설정
./doppler.bat secrets set NODE_ENV=staging --config stg
./doppler.bat secrets set NEXT_PUBLIC_ENV=staging --config stg
./doppler.bat secrets set NEXT_PUBLIC_BASE_URL=https://cp9-staging.vercel.app --config stg

# Supabase - 프로덕션 인스턴스 사용
./doppler.bat secrets set NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url --config stg
./doppler.bat secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key --config stg
./doppler.bat secrets set SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key --config stg

# 같은 API 키들 사용 (개발환경과 동일)
./doppler.bat secrets set COUPANG_ACCESS_KEY=your_coupang_access_key --config stg
./doppler.bat secrets set COUPANG_SECRET_KEY=your_coupang_secret_key --config stg
./doppler.bat secrets set OPENAI_API_KEY=your_openai_api_key --config stg
./doppler.bat secrets set PERPLEXITY_API_KEY=your_perplexity_api_key --config stg
./doppler.bat secrets set GOOGLE_CLIENT_ID=your_google_client_id --config stg
./doppler.bat secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret --config stg
./doppler.bat secrets set WORDPRESS_API_KEY="your_wordpress_api_key" --config stg
./doppler.bat secrets set WORDPRESS_SITE_URL=your_wordpress_site_url --config stg
```

#### 프로덕션 환경 (prd)
```bash
# 기본 설정
./doppler.bat secrets set NODE_ENV=production --config prd
./doppler.bat secrets set NEXT_PUBLIC_ENV=production --config prd
./doppler.bat secrets set NEXT_PUBLIC_BASE_URL=https://cp9.vercel.app --config prd

# Supabase - 프로덕션 인스턴스
./doppler.bat secrets set NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url --config prd
./doppler.bat secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key --config prd
./doppler.bat secrets set SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key --config prd

# API 키들 (프로덕션용으로 업데이트 필요시 변경)
./doppler.bat secrets set COUPANG_ACCESS_KEY=your_coupang_access_key --config prd
./doppler.bat secrets set COUPANG_SECRET_KEY=your_coupang_secret_key --config prd
./doppler.bat secrets set OPENAI_API_KEY=your_openai_api_key --config prd
./doppler.bat secrets set PERPLEXITY_API_KEY=your_perplexity_api_key --config prd
./doppler.bat secrets set GOOGLE_CLIENT_ID=your_google_client_id --config prd
./doppler.bat secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret --config prd
./doppler.bat secrets set WORDPRESS_API_KEY="your_wordpress_api_key" --config prd
./doppler.bat secrets set WORDPRESS_SITE_URL=your_wordpress_site_url --config prd
```

## 3. 로컬 개발 설정

### 3.1 프로젝트 설정
```bash
# 프로젝트 디렉토리에서 Doppler 설정
./doppler.bat setup --project cp9-frontend --config dev
```

### 3.2 환경변수 확인
```bash
# 현재 설정 확인
./doppler.bat secrets

# 특정 환경변수 확인
./doppler.bat secrets get NEXT_PUBLIC_SUPABASE_URL

# 모든 환경변수를 .env 형식으로 출력
./doppler.bat secrets download --format env
```

## 4. 개발 워크플로우

### 4.1 로컬 개발 실행
```bash
# Doppler와 함께 개발 서버 실행
npm run dev

# 또는 로컬 .env.local 사용 (Doppler 없이)
npm run dev:local
```

### 4.2 빌드 및 테스트
```bash
# Doppler 환경변수로 빌드
npm run build

# 테스트 실행
npm run test
```

## 5. CI/CD 통합

### 5.1 GitHub Actions 설정
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Doppler CLI
        uses: dopplerhq/cli-action@v3
        
      - name: Deploy to staging
        run: doppler run --token=${{ secrets.DOPPLER_STAGING_TOKEN }} -- npm run build
        
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: doppler run --token=${{ secrets.DOPPLER_PRODUCTION_TOKEN }} -- npm run build
```

### 5.2 Vercel 통합
```bash
# Vercel에서 사용할 환경변수 내보내기
./doppler.bat secrets download --format vercel --config prd > vercel-env.txt
```

## 6. 보안 권장사항

### 6.1 서비스 토큰 관리
- 각 환경별로 별도의 서비스 토큰 생성
- 최소 권한 원칙 적용
- CI/CD에서는 읽기 전용 토큰 사용

### 6.2 액세스 제어
- 프로덕션 환경은 제한된 사용자에게만 접근 허용
- 감사 로그 활성화
- 정기적인 토큰 로테이션

## 7. 문제해결

### 7.1 일반적인 문제들
```bash
# 프로젝트 설정 재설정
./doppler.bat setup --project cp9-frontend --config dev

# 환경변수 재확인
./doppler.bat secrets
```

### 7.2 환경변수 동기화
```bash
# .env 파일에서 Doppler로 일괄 업로드
./doppler.bat secrets upload .env.local --config dev

# Doppler에서 .env 파일로 다운로드
./doppler.bat secrets download --format env > .env.local
```

## 8. 빠른 참조

### 주요 명령어
```bash
# 환경변수 확인
npm run doppler:secrets

# 환경변수 다운로드
npm run doppler:download

# 환경변수 업로드
npm run doppler:upload

# 개발 서버 실행 (Doppler)
npm run dev

# 개발 서버 실행 (로컬)
npm run dev:local
```