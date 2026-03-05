---
description: 키워드 글쓰기 기능 검증 및 디버깅 워크플로우
---

# 키워드 글쓰기 검증 & 디버깅

## 1. 빌드 에러 확인
// turbo
```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/cp9/frontend && npx tsc --noEmit --pretty 2>&1 | head -50
```

## 2. 개발 서버 실행 확인
- 터미널에서 `npm run dev`가 정상 실행 중인지 확인
- 에러 로그가 있으면 수정

## 3. 브라우저 렌더링 테스트
- http://localhost:3001/keyword 페이지 접속
- **모드 A (키워드 먼저) 탭** 이 기본 선택되어 있는지 확인
- **모드 B (상품 먼저) 탭** 클릭 시 전환되는지 확인
- 5-스텝 인디케이터가 모드별로 다른 라벨을 표시하는지 확인

## 4. 모드 A 기능 테스트
1. 키워드 입력 필드에 "로봇청소기 추천" 입력
2. "다음: 제목 생성" 클릭 → 제목 후보 표시 확인
3. 제목 선택 후 "다음: 상품 연결" → 쿠팡 검색 결과 확인
4. 쿠팡 검색어가 "로봇청소기" 로 자동 추출되었는지 확인

## 5. 모드 B 기능 테스트
1. "상품 먼저" 탭 클릭
2. 쿠팡에서 "냉장고" 검색
3. 상품 2~3개 선택
4. "AI 키워드 + 제목 자동 추출" 클릭
5. 메인 키워드와 제목 후보 5개가 표시되는지 확인

## 6. 에러 핸들링 테스트
- 키워드 없이 "다음" 버튼 비활성화 확인
- 쿠팡 검색 결과 0개일 때 "건너뛰기" 표시 확인

## 7. API 직접 테스트 (디버깅용)
// turbo
```bash
curl -s -X POST http://localhost:3001/api/keyword-extract \
  -H 'Content-Type: application/json' \
  -d '{"productNames": ["삼성 비스포크 냉장고 RF85B96H1AP", "LG 디오스 오브제컬렉션"], "articleType": "compare"}' | python3 -m json.tool 2>/dev/null | head -30
```
