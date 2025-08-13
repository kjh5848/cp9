# 5장: 작성 레이어 테스트 예시

## 1. 환경 준비

### Supabase 마이그레이션 실행
```bash
cd backend
supabase db reset
# 또는 마이그레이션만 적용
supabase db push
```

### Edge Function 배포
```bash
supabase functions deploy write
```

## 2. 테스트 시나리오

### 기본 테스트 (프로젝트 전체 아이템)
```bash
curl -X POST "http://localhost:54321/functions/v1/write" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "promptVersion": "v1",
    "force": false
  }'
```

### 특정 아이템만 생성
```bash
curl -X POST "http://localhost:54321/functions/v1/write" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "itemIds": ["i-001", "i-002"],
    "maxWords": 900,
    "force": true
  }'
```

### 예상 응답 (성공)
```json
{
  "success": true,
  "data": {
    "written": 2,
    "failed": []
  }
}
```

### 예상 응답 (일부 실패)
```json
{
  "success": true,
  "data": {
    "written": 1,
    "failed": ["i-002"]
  }
}
```

## 3. 캐시/멱등성 테스트

1. **첫 번째 실행** - `force: false`로 새 초안 생성
2. **두 번째 실행** - 동일한 요청으로 `written: 0` 확인 (캐시됨)
3. **세 번째 실행** - `force: true`로 기존 초안 업데이트

## 4. 데이터베이스 확인

생성된 초안 확인:
```sql
SELECT 
  item_id,
  meta->>'title' as title,
  meta->>'description' as description,
  meta->>'slug' as slug,
  LENGTH(markdown) as markdown_length,
  version,
  updated_at
FROM drafts 
WHERE project_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
ORDER BY updated_at DESC;
```

## 5. 오류 상황 테스트

### 필수 파라미터 누락
```bash
curl -X POST "http://localhost:54321/functions/v1/write" \
  -H "Content-Type: application/json" \
  -d '{}'
```
예상: `PROJECT_ID_REQUIRED` 에러

### 존재하지 않는 프로젝트
```bash
curl -X POST "http://localhost:54321/functions/v1/write" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "00000000-0000-0000-0000-000000000000"
  }'
```
예상: `NO_RESEARCH_PACKS` 에러

## 6. 성능 테스트

대량 아이템 처리 시뮬레이션:
```bash
curl -X POST "http://localhost:54321/functions/v1/write" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "maxWords": 800,
    "force": true
  }'
```

응답 시간과 OpenAI API 호출 수 모니터링