# CP9 Frontend - Doppler 환경변수 관리 통합 가이드

Doppler를 사용하여 환경변수를 안전하고 효율적으로 관리합니다.

## 📦 Doppler CLI 설치 (새 PC 설정)

### Windows 설치
```bash
# 방법 1: winget 사용 (Windows 11/10 권장)
winget install --id Doppler.doppler

# 방법 2: Scoop 패키지 매니저 사용
scoop bucket add dopplerhq https://github.com/DopplerHQ/scoop-bucket.git
scoop install doppler

# 방법 3: PowerShell 스크립트 (관리자 권한)
$url = "https://cli.doppler.com/download?os=windows&arch=amd64&format=zip"
$output = "$env:TEMP\doppler.zip"
Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive -Path $output -DestinationPath "C:\Program Files\Doppler"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Doppler", [EnvironmentVariableTarget]::Machine)

# 방법 4: 수동 설치
# https://cli.doppler.com/download 에서 Windows용 바이너리 다운로드
```

### macOS 설치
```bash
# Homebrew 사용 (권장)
brew install dopplerhq/cli/doppler

# 직접 다운로드 (Apple Silicon)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/download?os=macos&arch=arm64 | tar xz
sudo mv ./doppler /usr/local/bin

# 직접 다운로드 (Intel)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/download?os=macos&arch=amd64 | tar xz
sudo mv ./doppler /usr/local/bin
```

### Linux 설치
```bash
# Ubuntu/Debian
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt-get update && sudo apt-get install doppler

# RedHat/CentOS/Fedora
sudo rpm --import 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key'
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/config.rpm.txt' | sudo tee /etc/yum.repos.d/doppler-cli.repo
sudo yum install doppler

# 범용 설치 스크립트
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sudo sh
```

### 설치 확인
```bash
doppler --version

# PATH 문제 해결 (Windows)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Doppler", [EnvironmentVariableTarget]::User)

# PATH 문제 해결 (macOS/Linux)
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 🚀 빠른 시작

### 1. Doppler 초기 설정 (최초 1회)
```bash
# 1. Doppler 로그인 (브라우저가 열림)
doppler login

# 2. 프로젝트 설정 (프로젝트 루트에서 실행)
doppler setup --project cp9 --config dev

# 또는 자동 설정 스크립트 실행 (Windows)
scripts\doppler-init.bat
```

### 2. 개발 서버 실행
```bash
# Doppler 환경변수와 함께 실행 (권장)
npm run dev:doppler

# 또는 직접 실행
doppler run -- npm run dev

# 로컬 .env.local 파일 사용 (Doppler 없이)
npm run dev
```

## 📋 환경변수 설정

### 필수 환경변수
Doppler 대시보드 또는 CLI를 통해 다음 환경변수를 설정해야 합니다:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJxxx...` |
| `COUPANG_ACCESS_KEY` | 쿠팡 파트너스 Access Key | `xxx-xxx-xxx` |
| `COUPANG_SECRET_KEY` | 쿠팡 파트너스 Secret Key | `xxx` |
| `NEXT_PUBLIC_BASE_URL` | 애플리케이션 Base URL | `http://localhost:3000` |

### 선택적 환경변수
| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `PERPLEXITY_API_KEY` | Perplexity AI API 키 | - |
| `OPENAI_API_KEY` | OpenAI API 키 | - |
| `WORDPRESS_API_KEY` | WordPress API 키 | - |
| `WORDPRESS_SITE_URL` | WordPress 사이트 URL | - |
| `NEXT_PUBLIC_LANGGRAPH_API_URL` | LangGraph API URL | `/api/langgraph` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | - |

### CLI를 통한 환경변수 설정
```bash
# 개별 환경변수 설정
doppler secrets set NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co --config dev
doppler secrets set COUPANG_ACCESS_KEY=your_key --config dev

# 기존 .env.local 파일 업로드 (권장)
doppler secrets upload .env.local --config dev

# 환경변수 확인
doppler secrets

# 특정 환경변수 값 확인
doppler secrets get NEXT_PUBLIC_SUPABASE_URL
```

## 🌍 환경별 설정

### 개발 환경 (dev)
```bash
# 개발 환경으로 전환
doppler setup --project cp9 --config dev

# 로컬 Supabase 사용 시
doppler secrets set NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 --config dev
```

### 스테이징 환경 (staging)
```bash
# 스테이징 환경으로 전환
doppler setup --project cp9 --config staging

# 스테이징 URL 설정
doppler secrets set NEXT_PUBLIC_BASE_URL=https://cp9-staging.vercel.app --config staging
```

### 프로덕션 환경 (production)
```bash
# 프로덕션 환경으로 전환
doppler setup --project cp9 --config production

# 프로덕션 URL 설정
doppler secrets set NEXT_PUBLIC_BASE_URL=https://cp9.vercel.app --config production
```

## 📜 NPM 스크립트

### 개발 명령어
```bash
# Doppler를 사용한 개발 서버
npm run dev:doppler           # doppler run -- next dev

# Doppler를 사용한 빌드
npm run build:doppler          # doppler run -- next build

# Doppler를 사용한 프로덕션 서버
npm run start:doppler          # doppler run -- next start

# 일반 명령어 (로컬 .env.local 사용)
npm run dev                    # next dev
npm run build                  # next build
npm run start                  # next start
```

### Doppler 관리 명령어
```bash
# 현재 환경변수 확인
npm run doppler:secrets        # doppler secrets

# 환경변수를 .env 형식으로 다운로드
npm run doppler:download       # doppler secrets download --format env

# .env.local을 Doppler로 업로드
npm run doppler:upload         # doppler secrets upload .env.local

# Doppler 설정 초기화
npm run doppler:setup          # doppler setup --project cp9 --config dev
```

## 🔐 보안 모범 사례

### 1. 환경변수 암호화
- 모든 환경변수는 Doppler 서버에서 암호화 저장
- 로컬에는 설정 정보만 저장 (`.doppler.yaml`)
- API 키와 시크릿은 절대 코드에 하드코딩하지 않음

### 2. 접근 제어
```bash
# 환경별 접근 권한 설정
# 개발: 모든 개발자 접근 가능
# 스테이징: 팀 리드 이상 접근
# 프로덕션: 관리자만 접근

# 서비스 토큰 생성 (CI/CD용)
doppler service-tokens create ci-token --config production --access read
```

### 3. 비밀 키 회전
```bash
# 새로운 API 키로 업데이트
doppler secrets set COUPANG_ACCESS_KEY=new_key --config dev

# 여러 환경에 동시 적용
for config in dev staging production; do
  doppler secrets set COUPANG_ACCESS_KEY=new_key --config $config
done
```

## 🚀 CI/CD 통합

### GitHub Actions
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
        
      - name: Build with Doppler
        run: doppler run --token=${{ secrets.DOPPLER_TOKEN }} -- npm run build
        
      - name: Deploy to Vercel
        run: vercel deploy --prod
```

### Vercel 통합
1. Vercel 대시보드에서 Doppler 통합 설치
2. 프로젝트와 환경 연결
3. 자동으로 환경변수 동기화

또는 수동으로:
```bash
# Vercel용 환경변수 내보내기
doppler secrets download --format vercel --config production > vercel-env.txt
# Vercel 대시보드에서 수동으로 추가
```

## 🛠️ 문제 해결

### "doppler: command not found" 오류
```bash
# Windows: PATH 새로고침 후 재시도
refreshenv

# 또는 직접 경로로 실행
"C:\Program Files\Doppler\doppler.exe" --version
```

### 로그인 문제
```bash
# 인증 정보 초기화
doppler auth clean
doppler login
```

### 환경변수가 로드되지 않는 경우
```bash
# Doppler 설정 확인
doppler configure

# 프로젝트 재설정
doppler setup --project cp9 --config dev

# 환경변수 확인
doppler run -- node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### 프로젝트 설정 확인
```bash
# 현재 Doppler 설정 조회
doppler configure get

# 프로젝트 목록 확인
doppler projects

# 사용 가능한 환경 확인
doppler configs --project cp9
```

## 🔄 로컬 개발 (Doppler 없이)

Doppler를 사용하지 않고 로컬에서 개발하려면:

### 1. .env.local 파일 생성
```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local

# .env.local 파일 편집하여 실제 값 입력
```

### 2. 환경변수 검증
```bash
# src/lib/config.ts가 자동으로 환경변수 검증
npm run dev

# 환경변수 정보 출력 (개발 모드에서만)
# 콘솔에서 환경변수 설정 상태 확인 가능
```

## 📚 추가 자료

- [Doppler 공식 문서](https://docs.doppler.com/)
- [Doppler Next.js 가이드](https://docs.doppler.com/docs/nextjs)
- [Doppler CLI 명령어](https://docs.doppler.com/docs/cli)
- [프로젝트 설정 파일](./doppler.yaml)

## 🔄 마이그레이션 가이드

### 기존 .env.local에서 Doppler로 마이그레이션
```bash
# 1. 기존 환경변수 백업
cp .env.local .env.local.backup

# 2. Doppler로 업로드
doppler secrets upload .env.local --config dev

# 3. 정상 작동 확인
npm run dev:doppler

# 4. 백업 파일 안전한 곳에 보관 후 삭제
rm .env.local
```

### Doppler에서 .env.local로 복원
```bash
# 환경변수 다운로드
doppler secrets download --format env > .env.local

# 정상 작동 확인
npm run dev
```

## 📋 체크리스트

### 초기 설정 체크리스트
- [ ] Doppler CLI 설치 완료
- [ ] Doppler 계정 생성 및 로그인
- [ ] 프로젝트 설정 (`doppler setup`)
- [ ] 필수 환경변수 설정
- [ ] 개발 서버 정상 실행 확인

### 배포 전 체크리스트
- [ ] 프로덕션 환경변수 설정
- [ ] CI/CD 서비스 토큰 생성
- [ ] Vercel/GitHub Actions 통합
- [ ] 환경별 접근 권한 설정
- [ ] 비밀 키 회전 정책 수립