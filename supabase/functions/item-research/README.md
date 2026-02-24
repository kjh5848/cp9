# item-research Edge Function

## 개요
Perplexity API를 활용하여 상품명 기반으로 리서치 데이터를 생성하고 Supabase `research` 테이블에 저장하는 함수입니다.

**주요 기능:**
- Perplexity AI를 통한 상품 분석
- ResearchPack 데이터 구조 생성
- 한글 텍스트 처리 최적화
- 데이터베이스 자동 저장

## API 명세

**엔드포인트:** `POST /functions/v1/item-research`

### 요청 형식
```json
{
  "itemName": "무선 이어폰",
  "projectId": "project_123",
  "itemId": "item_456",
  "productData": {
    "productName": "삼성 갤럭시 버즈3",
    "productPrice": 199000,
    "productImage": "https://image-url.com",
    "productUrl": "https://coupang.com/products/...",
    "categoryName": "전자제품",
    "isRocket": true,
    "isFreeShipping": true
  }
}
```

### 응답 형식
```json
{
  "success": true,
  "data": {
    "itemName": "무선 이어폰",
    "researchData": {
      "overview": "상품 개요 설명",
      "features": ["기능1", "기능2", "기능3"],
      "benefits": ["장점1", "장점2", "장점3"],
      "targetAudience": "타겟 고객층",
      "marketAnalysis": "시장 분석 내용",
      "recommendations": ["추천 이유1", "추천 이유2"],
      "priceRange": "가격대 정보",
      "popularBrands": ["브랜드1", "브랜드2"]
    }
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "error_message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

## 사용법

### cURL 예제
```bash
curl -X POST http://localhost:54321/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "itemName": "무선 이어폰",
    "projectId": "test_project",
    "itemId": "test_001"
  }'
```

### JavaScript/TypeScript 예제
```typescript
const { data, error } = await supabase.functions.invoke('item-research', {
  body: {
    itemName: '무선 이어폰',
    projectId: 'test_project',
    itemId: 'test_001',
    productData: {
      productName: '삼성 갤럭시 버즈3',
      productPrice: 199000,
      // ... other fields
    }
  }
});

if (error) {
  console.error('Research failed:', error);
} else {
  console.log('Research data:', data);
}
```

## 필수 환경 변수

```bash
PERPLEXITY_API_KEY=pplx-your-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 구현 세부사항

### 주요 프로세스
1. **입력 검증**: itemName, projectId, itemId 필수 필드 확인
2. **Perplexity API 호출**: 상품명 기반 AI 분석 요청
3. **응답 파싱**: JSON 형태의 AI 응답을 ResearchPack 구조로 변환
4. **데이터베이스 저장**: research 테이블에 upsert 방식으로 저장
5. **응답 반환**: 표준화된 성공/실패 응답

### Perplexity API 프롬프트
- **모델**: sonar-pro
- **최대 토큰**: 2000
- **Temperature**: 0.3 (일관된 응답을 위한 낮은 값)
- **시스템 메시지**: 상품 분석 전문가 역할 부여

### 한글 처리 최적화
```typescript
// UTF-8 디코딩 개선
const requestBuffer = await req.arrayBuffer();
const decoder = new TextDecoder('utf-8');
const requestText = decoder.decode(requestBuffer);
```

### ResearchPack 데이터 구조
```typescript
const researchPack = {
  itemId,
  title: productData?.productName || itemName,
  priceKRW: productData?.productPrice || null,
  isRocket: productData?.isRocket || null,
  features: researchData.features,
  pros: researchData.benefits,
  cons: ['AI 분석으로 단점 파악 중...'], // 기본값
  keywords: researchData.popularBrands,
  metaTitle: `${itemName} 리뷰 및 구매 가이드`,
  metaDescription: researchData.overview,
  slug: itemName.toLowerCase().replace(/\s+/g, '-')
};
```

## 테스트 방법

### 로컬 테스트
```bash
# Supabase 로컬 서비스 시작
supabase start

# 함수 서빙
supabase functions serve item-research --env-file .env.local

# 테스트 요청
curl -X POST http://localhost:54321/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -d '{"itemName":"테스트 상품","projectId":"test","itemId":"001"}'
```

### 프로덕션 테스트
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"itemName":"실제 상품명","projectId":"prod","itemId":"real_001"}'
```

## 문제 해결

### 일반적인 오류

**`PERPLEXITY_API_KEY not found`**
```bash
# 해결: 환경 변수 설정
supabase secrets set PERPLEXITY_API_KEY=pplx-your-key
```

**`itemName, projectId, and itemId are required`**
```bash
# 해결: 필수 필드 포함하여 요청
curl -d '{"itemName":"상품명","projectId":"프로젝트ID","itemId":"아이템ID"}'
```

**`JSON parsing error`**
- Perplexity API 응답이 JSON 형식이 아닌 경우
- 자동으로 fallback 데이터 제공

**`Database save failed`**
- Supabase 연결 확인
- research 테이블 스키마 확인
- SERVICE_ROLE_KEY 권한 확인

### 디버깅 방법

**로그 확인:**
```bash
supabase functions logs item-research --tail
```

**Perplexity API 응답 확인:**
- 함수 로그에서 `cleanContent` 출력 확인
- JSON 파싱 오류시 원본 응답 확인

**데이터베이스 확인:**
```sql
SELECT * FROM research WHERE item_id = 'your_item_id';
```

## 성능 고려사항

- **응답 시간**: 평균 5-15초 (Perplexity API 의존)
- **토큰 사용량**: 요청당 약 500-1000 토큰
- **동시 처리**: Perplexity API 제한에 따라 조절
- **캐싱**: 동일 상품 재요청시 DB에서 기존 데이터 확인 권장