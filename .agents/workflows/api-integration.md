---
description: 워크플로우 - 외부 API 연동 가이드 및 체크리스트
---

# API 연동 워크플로우 (API Integration Workflow)

이 워크플로우는 CP9 프로젝트에서 외부 API(Coupang Partners, Supabase, Google OAuth 등)를 연동할 때 필수적으로 진행해야 하는 작업 순서를 정의합니다. API 연동 작업을 시작하기 전/후에 이 단계를 따르십시오.

1. **환경 변수 구성 파악 및 `.env.local` 셋팅 가이드 제공**
   - 필요한 외부 API 발급 가이드라인(Access Key, Secret, Anon Key 등)을 파악합니다.
   - 사용자에게 `.env.local`에 추가해야 할 환경 변수 목록을 공유합니다.
   - 테스트를 위해 임시 값(`test_access_key` 등)을 사용하도록 구성합니다.

2. **환경 변수 검증(Validation) 로직 작성**
   - `process.env` 값을 불러오는 초기화 지점에서 반드시 필수 값이 누락되었는지 체크합니다.
   - 누락 시 명확한 메시지와 함께 `throw new Error()`를 발생시킵니다.

3. **TypeScript 인터페이스/타입 정의**
   - API 명세에 따른 요청(Input) 및 응답(Output) 데이터 타입을 최우선으로 정의합니다.
   - Supabase의 경우 Database 스키마 타입을 정의하여 일관성을 확보합니다.

4. **API 클라이언트 및 인증 모듈 구현**
   - API 호출 함수 또는 클라이언트를 캡슐화합니다.
   - Coupang Partners와 같이 HMAC SHA256 서명 등 특수한 인증 방식을 제공해야 하는 경우, 유틸리티 함수(예: `generateCoupangSignature`)를 구현합니다.

5. **일관된 에러 핸들링 (Error Handling) 구현**
   - 모든 외부 API 호출부에서 `try-catch`를 구현합니다.
   - `e instanceof Error` 패턴이나 Unknown 처리를 통해 `NextResponse.json({ error: errorMessage }, { status: 500 })` 형태로 균일한 에러 반환을 작성합니다.

6. **체크리스트 점검 (최종 검토)**
   - [ ] 환경 변수 선언 및 Null 체크
   - [ ] TS 타입 명시
   - [ ] 인증 서명 검증/클라이언트 연결 로직 검토
   - [ ] 일관된 에러 포맷