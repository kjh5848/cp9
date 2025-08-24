@echo off
REM Windows 개발 환경 스크립트 - make 명령어 대안

if "%1"=="setup" goto setup
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="logs" goto logs
if "%1"=="shell" goto shell
if "%1"=="test" goto test
if "%1"=="clean" goto clean
if "%1"=="help" goto help
if "%1"=="" goto help

:help
echo.
echo 🚀 Research Backend - Windows 개발 도구
echo.
echo 사용법: dev.bat [command]
echo.
echo 명령어:
echo   setup    - 초기 환경 설정
echo   start    - 개발 환경 시작
echo   stop     - 모든 서비스 정지
echo   logs     - 로그 확인
echo   shell    - 앱 컨테이너 접근
echo   test     - 테스트 실행
echo   clean    - 환경 정리
echo   help     - 이 도움말 표시
echo.
echo 대안:
echo   poetry run dev    - Poetry 스크립트 사용
echo   docker-compose up - Docker Compose 직접 사용
goto end

:setup
echo 🚀 초기 환경 설정 중...
docker-compose build --no-cache
docker-compose run --rm app poetry install
docker-compose up -d postgres redis
timeout /t 10 /nobreak >nul
docker-compose run --rm app poetry run alembic upgrade head
echo ✅ 설정 완료!
echo.
echo 다음 단계: dev.bat start
goto end

:start
echo 🚀 개발 환경 시작 중...
docker-compose up -d
timeout /t 5 /nobreak >nul
echo.
echo 🎉 개발 환경이 시작되었습니다!
echo.
echo 🌐 서비스 주소:
echo   • API 서버:     http://localhost:8000
echo   • API 문서:     http://localhost:8000/docs
echo   • pgAdmin:      http://localhost:5050
echo.
echo 📊 유용한 명령어:
echo   dev.bat logs    - 로그 확인
echo   dev.bat shell   - 컨테이너 접근
echo   dev.bat stop    - 서비스 정지
goto end

:stop
echo 🛑 모든 서비스 정지 중...
docker-compose down
echo ✅ 모든 서비스가 정지되었습니다!
goto end

:logs
echo 📊 실시간 로그 표시 (Ctrl+C로 종료)
docker-compose logs -f
goto end

:shell
echo 🐚 앱 컨테이너 접근 중...
docker-compose exec app bash
goto end

:test
echo 🧪 테스트 실행 중...
docker-compose exec app poetry run pytest --cov=app --cov-report=html
goto end

:clean
echo 🧹 환경 정리 중...
set /p confirm="모든 컨테이너와 볼륨을 삭제합니다. 계속하시겠습니까? (y/N): "
if /i "%confirm%"=="y" (
    docker-compose down -v --rmi all
    echo ✅ 환경이 정리되었습니다!
) else (
    echo 취소되었습니다.
)
goto end

:end