@echo off
REM Doppler 초기 설정 스크립트 (Windows)
REM 사용법: scripts\doppler-init.bat

echo 🔐 Doppler 환경변수 관리 시스템 설정 시작

REM Doppler CLI 설치 확인
where doppler >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Doppler CLI가 설치되지 않았습니다.
    echo 다음 명령어로 설치하세요: winget install --id Doppler.doppler
    echo 또는 직접 실행: "C:\Users\kjh58\AppData\Local\Microsoft\WinGet\Packages\Doppler.doppler_Microsoft.Winget.Source_8wekyb3d8bbwe\doppler.exe"
    pause
    exit /b 1
)

echo ✅ Doppler CLI 설치 확인됨

REM 로그인 확인
doppler auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔑 Doppler에 로그인이 필요합니다.
    echo 브라우저에서 로그인을 완료하세요.
    doppler login
)

echo ✅ Doppler 로그인 확인됨

REM 프로젝트 설정
set PROJECT_NAME=cp9-frontend

doppler projects get %PROJECT_NAME% >nul 2>nul
if %errorlevel% neq 0 (
    echo 📁 Doppler 프로젝트 생성 중: %PROJECT_NAME%
    doppler projects create %PROJECT_NAME% --description "CP9 Coupang Partners Frontend"
    
    REM 환경 생성
    echo 🌍 환경 생성 중...
    doppler environments create dev --project %PROJECT_NAME% --name "Development"
    doppler environments create stg --project %PROJECT_NAME% --name "Staging"
    doppler environments create prd --project %PROJECT_NAME% --name "Production"
    
    REM 설정 생성
    echo ⚙️ 설정 생성 중...
    doppler configs create dev --project %PROJECT_NAME% --environment dev --name "dev"
    doppler configs create stg --project %PROJECT_NAME% --environment stg --name "stg"
    doppler configs create prd --project %PROJECT_NAME% --environment prd --name "prd"
) else (
    echo ✅ Doppler 프로젝트 확인됨: %PROJECT_NAME%
)

REM 로컬 프로젝트 설정
echo 🔗 로컬 프로젝트 Doppler 설정 중...
doppler setup --project %PROJECT_NAME% --config dev --silent

REM 기존 .env.local이 있는 경우 처리
if exist ".env.local" (
    echo 📤 기존 .env.local 파일을 Doppler dev 환경으로 업로드 중...
    doppler secrets upload .env.local --config dev
    echo ✅ 환경변수 업로드 완료
    
    echo 🔒 보안을 위해 .env.local 파일을 백업 후 삭제할까요? (y/N)
    set /p response=
    if /i "%response%"=="y" (
        move .env.local .env.local.backup
        echo ✅ .env.local을 .env.local.backup으로 백업했습니다.
    )
) else (
    echo ⚠️ .env.local 파일을 찾을 수 없습니다.
    echo doppler-setup.md 파일의 지침에 따라 수동으로 환경변수를 설정하세요.
)

echo.
echo 🎉 Doppler 설정 완료!
echo.
echo 📋 다음 단계:
echo 1. 환경변수 확인: npm run doppler:secrets
echo 2. 개발 서버 실행: npm run dev
echo 3. 빌드 테스트: npm run build
echo.
echo 📚 자세한 사용법은 doppler-setup.md 파일을 참조하세요.

pause