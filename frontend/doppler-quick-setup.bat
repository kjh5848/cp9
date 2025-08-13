@echo off
echo 🔐 Doppler 빠른 설정 스크립트

echo 1. Doppler에 로그인하세요...
doppler login

echo 2. cp9-frontend 프로젝트 생성 중...
doppler projects create cp9-frontend --description "CP9 Coupang Partners Frontend"

echo 3. 환경 생성 중...
doppler environments create dev --project cp9-frontend --name "Development"
doppler environments create stg --project cp9-frontend --name "Staging"
doppler environments create prd --project cp9-frontend --name "Production"

echo 4. 설정 생성 중...
doppler configs create dev --project cp9-frontend --environment dev --name "dev"
doppler configs create stg --project cp9-frontend --environment stg --name "stg"
doppler configs create prd --project cp9-frontend --environment prd --name "prd"

echo 5. 로컬 프로젝트 설정 중...
doppler setup --project cp9-frontend --config dev

echo 6. 기존 .env.local 업로드 중...
if exist ".env.local" (
    doppler secrets upload .env.local --config dev
    echo ✅ 환경변수 업로드 완료
) else (
    echo ⚠️ .env.local 파일을 찾을 수 없습니다.
)

echo 7. 환경변수 확인...
doppler secrets

echo 🎉 Doppler 설정 완료!
echo 이제 npm run dev 로 개발 서버를 실행하세요.

pause