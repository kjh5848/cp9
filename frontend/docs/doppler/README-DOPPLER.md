# CP9 Frontend - Doppler 환경변수 관리

Doppler를 사용하여 환경변수를 안전하고 효율적으로 관리합니다.

## 📦 새 PC에 Doppler 설치

### Windows
```bash
# 방법 1: winget 사용 (권장)
winget install --id Doppler.doppler

# 방법 2: Scoop 사용
scoop bucket add dopplerhq https://github.com/DopplerHQ/scoop-bucket.git
scoop install doppler

# 방법 3: 수동 다운로드
# https://cli.doppler.com/download 에서 Windows 설치 파일 다운로드
```

### macOS
```bash
# Homebrew 사용
brew install dopplerhq/cli/doppler
```

### Linux
```bash
# APT (Debian/Ubuntu)
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt-get update && sudo apt-get install doppler

# YUM (RedHat/CentOS)
sudo rpm --import 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key'
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/config.rpm.txt' | sudo tee /etc/yum.repos.d/doppler-cli.repo
sudo yum install doppler
```

### 설치 확인
```bash
doppler --version
```

## 🚀 빠른 시작

### 1. Doppler 설정 (최초 1회)
```bash
# Windows 자동 설정 스크립트 실행
scripts\doppler-init.bat

# 또는 수동 설정
doppler login
npm run doppler:setup
```

### 2. 개발 서버 실행
```bash
# Doppler 환경변수와 함께 실행 (권장)
npm run dev

# 또는 로컬 .env.local 파일 사용
npm run dev:local
```

## 📋 주요 명령어

### 개발 명령어
```bash
npm run dev              # Doppler + Next.js 개발 서버
npm run build            # Doppler + 프로덕션 빌드
npm run test             # Doppler + 테스트 실행
```

### Doppler 관리 명령어
```bash
npm run doppler:secrets    # 현재 환경변수 확인
npm run doppler:download   # .env 형식으로 다운로드
npm run doppler:upload     # .env.local을 Doppler로 업로드
```

### 로컬 전용 명령어 (Doppler 없이)
```bash
npm run dev:local          # 로컬 .env.local 사용
npm run build:local        # 로컬 .env.local 사용
npm run test:local         # 로컬 .env.local 사용
```

## 🌍 환경 관리

### 개발 환경 (dev)
- 로컬 Supabase (http://127.0.0.1:54321)
- 개발용 API 키
- 디버그 모드 활성화

### 스테이징 환경 (stg)
- 프로덕션 Supabase
- 스테이징 도메인
- 프로덕션과 동일한 API 키

### 프로덕션 환경 (prd)
- 프로덕션 Supabase
- 프로덕션 도메인
- 프로덕션 API 키

### 환경 전환
```bash
# 스테이징으로 전환
doppler setup --config stg

# 프로덕션으로 전환
doppler setup --config prd

# 개발환경으로 복귀
doppler setup --config dev
```

## 🔐 보안 기능

### 환경변수 암호화
- 모든 환경변수는 Doppler에서 암호화 저장
- 로컬에는 설정 정보만 저장 (.doppler.yaml)
- API 키와 시크릿은 Doppler 서버에만 존재

### 접근 제어
- 환경별 접근 권한 관리
- 감사 로그 자동 생성
- 서비스 토큰으로 CI/CD 연동

### 비밀 키 회전
```bash
# 새로운 API 키 업데이트
doppler secrets set OPENAI_API_KEY=new_key_here --config dev

# 여러 환경에 동일한 키 설정
doppler secrets set COUPANG_ACCESS_KEY=new_key --config dev
doppler secrets set COUPANG_ACCESS_KEY=new_key --config stg
doppler secrets set COUPANG_ACCESS_KEY=new_key --config prd
```

## 🚀 CI/CD 통합

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
- name: Install Doppler CLI
  uses: dopplerhq/cli-action@v3

- name: Deploy with Doppler
  run: doppler run --token=${{ secrets.DOPPLER_TOKEN }} -- npm run build
```

### Vercel 통합
```bash
# Vercel 환경변수 내보내기
npm run doppler:download > .env.production
```

## 🛠️ 문제해결

### 일반적인 문제

**Q: "doppler: command not found" 오류**
```bash
# Windows PATH 새로고침 후 재시도
# 또는 직접 경로로 실행
"C:\Users\kjh58\AppData\Local\Microsoft\WinGet\Packages\Doppler.doppler_Microsoft.Winget.Source_8wekyb3d8bbwe\doppler.exe" --version
```

**Q: 로그인이 안 될 때**
```bash
doppler auth clean
doppler login
```

**Q: 환경변수가 업데이트되지 않을 때**
```bash
doppler setup --project cp9-frontend --config dev
npm run doppler:secrets
```

### 디버깅
```bash
# 현재 Doppler 설정 확인
doppler configure get

# 특정 환경변수 값 확인
doppler secrets get NEXT_PUBLIC_SUPABASE_URL

# 모든 환경변수 출력
doppler run -- env | grep NEXT_PUBLIC
```

## 📚 추가 자료

- [Doppler 공식 문서](https://docs.doppler.com/)
- [doppler-setup.md](./doppler-setup.md) - 상세 설정 가이드
- [.doppler.yaml](./.doppler.yaml) - 프로젝트 설정 파일

## 🔄 마이그레이션

기존 .env.local에서 Doppler로 마이그레이션하는 경우:

```bash
# 1. 기존 환경변수 백업
cp .env.local .env.local.backup

# 2. Doppler로 업로드
npm run doppler:upload

# 3. 정상 작동 확인
npm run dev

# 4. 백업 파일 안전한 곳에 보관 후 삭제
rm .env.local
```