# 프론트엔드 요청 추적 시스템 가이드

이 문서는 프론트엔드에서 보내는 요청의 전체 흐름을 추적할 수 있는 종합 로깅 시스템에 대해 설명합니다.

## 🎯 개요

백엔드에서 프론트엔드 요청을 단계별로 추적하고 모니터링할 수 있는 시스템이 구현되었습니다. 각 요청마다 고유한 `request_id`가 생성되며, 요청 처리의 전 과정을 단계별로 로그로 남깁니다.

## 📊 요청 흐름 및 로깅 단계

### Step 1: API 요청 수신
**위치**: `app/api/v1/endpoints/product_research.py`
- 프론트엔드에서 요청이 도착하면 고유한 `request_id` 생성
- 요청 기본 정보 로깅 (엔드포인트, 아이템 수, 옵션들)

```log
[INFO] [Step 1] 📥 API 요청 수신 | request_id=abc-123 | endpoint=/research/products | items_count=3 | celery=false | coupang_preview=true
```

### Step 2: 요청 검증
**위치**: `app/api/v1/endpoints/product_research.py`
- 배치 크기 검증 (최대 10개)
- 입력 데이터 유효성 검사

```log
[INFO] [Step 2] 🔍 요청 검증 시작 | request_id=abc-123 | validating_items_count=3
[INFO] [Step 2] ✅ 요청 검증 완료 | request_id=abc-123 | validation=passed
```

### Step 3: 서비스 인스턴스 생성
**위치**: `app/api/v1/endpoints/product_research.py`
- ProductResearchService 인스턴스 생성

```log
[INFO] [Step 3] 🔧 서비스 인스턴스 생성 | request_id=abc-123
```

### Step 4: 도메인 엔티티 변환
**위치**: `app/api/v1/endpoints/product_research.py`
- 요청 데이터를 도메인 엔티티로 변환

```log
[INFO] [Step 4] 🔄 도메인 엔티티 변환 | request_id=abc-123 | converting_items=3
[INFO] [Step 4] ✅ 도메인 엔티티 변환 완료 | request_id=abc-123 | converted_items=3
```

### Step 5: 작업 생성 (분기별)
**위치**: `app/api/v1/endpoints/product_research.py` → `app/services/product_research_service.py`

#### Step 5A: Celery 백그라운드 작업 (해당시)
```log
[INFO] [Step 5A] ⚡ Celery 백그라운드 작업 생성 | request_id=abc-123 | priority=5
[INFO] [Step 5A] ✅ Celery 작업 생성 완료 | request_id=abc-123 | task_id=celery-456
```

#### Step 5B: 쿠팡 미리보기 작업 (해당시)
```log
[INFO] [Step 5B] 🛒 쿠팡 미리보기 작업 생성 | request_id=abc-123 | preview=enabled
[INFO] [Step 5B-1] 🛒 오케스트레이터 쿠팡 미리보기 작업 호출 | request_id=abc-123 | items_count=3
[INFO] [Step 5B-2] ✅ 오케스트레이터 쿠팡 미리보기 작업 완료 | request_id=abc-123 | job_id=xyz-789 | coupang_results=2
[INFO] [Step 5B] ✅ 쿠팡 미리보기 작업 생성 완료 | request_id=abc-123 | job_id=xyz-789 | coupang_results=2
```

#### Step 5C: 일반 비동기 작업 (해당시)
```log
[INFO] [Step 5C] 🔄 일반 비동기 작업 생성 | request_id=abc-123 | preview=disabled
[INFO] [Step 5C-1] 🎯 오케스트레이터 작업 생성 호출 | request_id=abc-123 | items_count=3
[INFO] [Step 5C-2] ✅ 오케스트레이터 작업 생성 완료 | request_id=abc-123 | job_id=xyz-789
[INFO] [Step 5C] ✅ 일반 비동기 작업 생성 완료 | request_id=abc-123 | job_id=xyz-789
```

### Step 6: 응답 데이터 변환
**위치**: `app/api/v1/endpoints/product_research.py`
- 작업 결과를 API 응답 형식으로 변환

```log
[INFO] [Step 6] 📦 응답 데이터 변환 시작 | request_id=abc-123 | job_results=2
```

### Step 7: 최종 응답 생성
**위치**: `app/api/v1/endpoints/product_research.py`
- API 가이드 형식으로 최종 응답 반환

```log
[INFO] [Step 7] ✅ 요청 처리 완료 | request_id=abc-123 | job_id=xyz-789 | status=completed | results_count=2
```

### Step 8: 데이터베이스 저장
**위치**: `app/infra/db/repositories.py`
- 작업 및 아이템 데이터 데이터베이스 저장

```log
[INFO] [Step 8] 💾 데이터베이스 작업 저장 시작 | request_id=abc-123 | job_id=xyz-789 | items_count=3
[INFO] [Step 8] ✅ 데이터베이스 작업 저장 완료 | request_id=abc-123 | job_id=xyz-789 | items_saved=3
```

## 🔧 구현된 파일별 역할

### 1. API 계층 (`app/api/v1/endpoints/product_research.py`)
- **역할**: HTTP 요청 수신 및 응답 처리
- **로깅**: Step 1-4, Step 6-7
- **주요 기능**:
  - 고유 request_id 생성
  - 요청 검증 및 엔티티 변환
  - 최종 응답 형식 변환

### 2. 서비스 계층 (`app/services/product_research_service.py`)
- **역할**: 비즈니스 로직 파사드 및 오케스트레이터 위임
- **로깅**: Step 5B-1/5C-1, Step 5B-2/5C-2
- **주요 기능**:
  - 오케스트레이터 호출 및 결과 처리
  - 하위 호환성 유지
  - Celery 작업 관리

### 3. 리포지토리 계층 (`app/infra/db/repositories.py`)
- **역할**: 데이터베이스 영속성 처리
- **로깅**: Step 8
- **주요 기능**:
  - 도메인 엔티티를 데이터베이스 모델로 변환
  - 트랜잭션 관리 및 데이터 저장

## 📋 로그 포맷 및 구조

### 로그 메시지 형식
```
[로그레벨] [Step N] 이모지 작업설명 | request_id=값 | 추가_정보=값
```

### Extra 필드 구조
```python
extra={
    "step": "단계번호",
    "request_id": "요청고유ID",
    "file_location": "파일위치:메서드명",
    # 기타 컨텍스트별 정보들...
}
```

### 이모지 별 의미
- 📥 **API 요청 수신**
- 🔍 **검증 작업**
- 🔧 **서비스 생성**
- 🔄 **데이터 변환**
- ⚡ **Celery 백그라운드**
- 🛒 **쿠팡 미리보기**
- 🎯 **오케스트레이터 호출**
- 📦 **응답 변환**
- 💾 **데이터베이스 저장**
- ✅ **완료**
- ❌ **실패**
- ⚠️ **경고**

## 🔍 요청 추적 방법

### 1. 로그 검색으로 특정 요청 추적
```bash
# 특정 request_id의 전체 흐름 확인
grep "request_id=abc-123" /var/log/app.log

# 단계별 진행상황 확인
grep "\[Step" /var/log/app.log | grep "request_id=abc-123"
```

### 2. 실시간 로그 모니터링
```bash
# 실시간으로 요청 처리 과정 관찰
tail -f /var/log/app.log | grep "\[Step"
```

### 3. 요청 성능 분석
각 단계별 타임스탬프를 통해 병목 구간 식별 가능:
- Step 1-2: 요청 수신 및 검증 시간
- Step 3-5: 서비스 처리 시간
- Step 8: 데이터베이스 저장 시간

## 🛠 설정 및 활용

### 로그 레벨 설정
```python
# app/core/logging.py에서 INFO 레벨 이상 로그 활성화
logging.basicConfig(level=logging.INFO)
```

### 개발/운영 환경별 활용
- **개발**: 디버그 목적으로 모든 단계 로그 확인
- **스테이징**: 성능 병목 구간 분석
- **운영**: 에러 발생시 request_id로 전체 흐름 추적

## 📈 성능 및 모니터링

### 성능 지표
- 평균 응답 시간: Step 1 → Step 7 소요 시간
- 데이터베이스 저장 시간: Step 8 소요 시간
- 성공/실패 비율: ✅/❌ 로그 통계

### 알람 설정 가능 지점
- Step 2에서 검증 실패 ❌ 로그 증가
- Step 8에서 데이터베이스 저장 실패
- 전체 처리 시간이 임계값 초과

## 🔧 문제 해결

### 일반적인 문제 패턴
1. **요청이 Step 2에서 멈춤**: 검증 실패, 입력 데이터 문제
2. **Step 8이 누락**: 데이터베이스 연결 문제
3. **request_id가 중간에 끊김**: 비동기 처리 과정에서 컨텍스트 손실

### 디버깅 팁
- 동일한 request_id로 모든 단계가 완료되었는지 확인
- 각 단계별 처리 시간이 정상 범위인지 점검
- 에러 로그와 request_id 매핑으로 근본 원인 추적

---

## 🚀 향후 확장 계획

1. **Grafana 대시보드 연동**: 시각적 요청 흐름 모니터링
2. **분산 추적 시스템**: OpenTelemetry 연동
3. **자동 알람**: 임계값 기반 슬랙/이메일 알림
4. **성능 메트릭**: 각 단계별 응답 시간 히스토그램

---

이 로깅 시스템을 통해 프론트엔드 요청의 전체 생명주기를 완벽하게 추적하고 디버깅할 수 있습니다.