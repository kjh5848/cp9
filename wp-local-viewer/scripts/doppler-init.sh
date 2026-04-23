#!/bin/bash

# Doppler 초기 설정 스크립트
# 사용법: ./scripts/doppler-init.sh

echo "🔐 Doppler 환경변수 관리 시스템 설정 시작"

# Doppler CLI 설치 확인
if ! command -v doppler &> /dev/null; then
    echo "❌ Doppler CLI가 설치되지 않았습니다."
    echo "다음 명령어로 설치하세요: winget install --id Doppler.doppler"
    exit 1
fi

echo "✅ Doppler CLI 설치 확인됨"

# 로그인 확인
if ! doppler auth status &> /dev/null; then
    echo "🔑 Doppler에 로그인이 필요합니다."
    echo "브라우저에서 로그인을 완료하세요."
    doppler login
fi

echo "✅ Doppler 로그인 확인됨"

# 프로젝트 존재 확인 및 생성
PROJECT_NAME="cp9-frontend"
if ! doppler projects get $PROJECT_NAME &> /dev/null; then
    echo "📁 Doppler 프로젝트 생성 중: $PROJECT_NAME"
    doppler projects create $PROJECT_NAME --description "CP9 Coupang Partners Frontend"
    
    # 환경 생성
    echo "🌍 환경 생성 중..."
    doppler environments create dev --project $PROJECT_NAME --name "Development"
    doppler environments create stg --project $PROJECT_NAME --name "Staging"
    doppler environments create prd --project $PROJECT_NAME --name "Production"
    
    # 설정 생성
    echo "⚙️ 설정 생성 중..."
    doppler configs create dev --project $PROJECT_NAME --environment dev --name "dev"
    doppler configs create stg --project $PROJECT_NAME --environment stg --name "stg" 
    doppler configs create prd --project $PROJECT_NAME --environment prd --name "prd"
else
    echo "✅ Doppler 프로젝트 확인됨: $PROJECT_NAME"
fi

# 로컬 프로젝트 설정
echo "🔗 로컬 프로젝트 Doppler 설정 중..."
doppler setup --project $PROJECT_NAME --config dev --silent

# 기존 .env.local이 있는 경우 Doppler로 업로드
if [ -f ".env.local" ]; then
    echo "📤 기존 .env.local 파일을 Doppler dev 환경으로 업로드 중..."
    doppler secrets upload .env.local --config dev
    echo "✅ 환경변수 업로드 완료"
    
    echo "🔒 보안을 위해 .env.local 파일을 백업 후 삭제할까요? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        mv .env.local .env.local.backup
        echo "✅ .env.local을 .env.local.backup으로 백업했습니다."
    fi
else
    echo "⚠️ .env.local 파일을 찾을 수 없습니다."
    echo "doppler-setup.md 파일의 지침에 따라 수동으로 환경변수를 설정하세요."
fi

echo ""
echo "🎉 Doppler 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. 환경변수 확인: npm run doppler:secrets"
echo "2. 개발 서버 실행: npm run dev"
echo "3. 빌드 테스트: npm run build"
echo ""
echo "📚 자세한 사용법은 doppler-setup.md 파일을 참조하세요."