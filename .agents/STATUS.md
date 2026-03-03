# CP9 프로젝트 진행 상태

> 마지막 업데이트: 2026-02-26

## 최근 완료된 작업

### ✅ API 통합 (2026-02-25)
- `/api/write`와 `/api/item-research`를 **단일 파이프라인으로 통합**

### ✅ CTA 템플릿 시스템 Level 1 (2026-02-26)
- 인라인 HTML 하드코딩 → 페르소나별 CTA 템플릿 파일 기반 전환
- 6개 템플릿 + `seo-cta-builder.ts` 유틸리티 + UTM 자동 추가

### ✅ CTA 전환율 최적화 Level 2 (2026-02-26)
- 가격 블록(원화 포맷 + 로켓배송 뱃지), 긴급성 트리거(시간대별 4종)
- 사회적 증거(페르소나별 5종), 본문 중간 CTA 삽입

### ✅ CTA 데이터 기반 최적화 Level 3 (2026-02-26)
- **A/B 테스트**: 페르소나별 2개 문구 변형 랜덤 선택 (총 10종)
- **클릭 추적**: `CtaClick` DB 테이블 + `/api/cta-click` API
- **통계 조회**: `/api/cta-stats` — 페르소나별/변형별/위치별/교차 분석
- **추적 스크립트**: CTA 클릭 시 `/api/cta-click`으로 자동 비동기 전송

## 현재 이슈

- Claude/Gemini 클라이언트에 `maxTokens` 미설정
- 생성 이미지 로컬 저장 (배포 시 S3 등 영구 스토리지 필요)

## 다음 할 일

- [ ] CTA 통계 대시보드 UI (클릭률 시각화)
- [ ] 검수 레이어 구현 (approve/re-research/rewrite 분기)
- [ ] WordPress 자동 발행
- [ ] Claude/Gemini maxTokens 설정
