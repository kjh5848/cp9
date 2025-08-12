# write Edge Function

## 개요
OpenAI GPT API를 활용하여 SEO 최적화된 블로그 콘텐츠를 생성하고 `drafts` 테이블에 저장하는 함수입니다.

**주요 기능:**
- OpenAI GPT-4를 통한 SEO 콘텐츠 생성
- 5장 구성의 블로그 포스트 생성
- ResearchPack 데이터를 활용한 맞춤형 콘텐츠
- 마크다운 형식의 구조화된 콘텐츠
- 데이터베이스 자동 저장 및 업데이트

## API 명세

**엔드포인트:** `POST /functions/v1/write`

### 요청 형식
```json
{
  "itemId": "item_456",
  "researchPack": {
    "title": "삼성 갤럭시 버즈3",
    "features": ["노이즈 캔슬링", "24시간 배터리", "무선 충전"],
    "pros": ["뛰어난 음질", "편안한 착용감", "긴 배터리 수명"],
    "cons": ["비싼 가격", "연결 불안정"],
    "keywords": ["삼성", "갤럭시버즈", "무선이어폰"],
    "metaTitle": "삼성 갤럭시 버즈3 리뷰 및 구매 가이드",
    "metaDescription": "삼성 갤럭시 버즈3의 모든 것을 알아보세요"
  }
}
```

### 응답 형식
```json
{
  "success": true,
  "data": {
    "draft": {
      "id": "uuid-generated-id",
      "itemId": "item_456",
      "title": "삼성 갤럭시 버즈3 완벽 가이드: 2024년 최고의 무선 이어폰",
      "content": "# 삼성 갤럭시 버즈3 완벽 가이드\n\n## 1장: 제품 소개\n...",
      "metaTitle": "삼성 갤럭시 버즈3 리뷰 및 구매 가이드 2024",
      "metaDescription": "삼성 갤럭시 버즈3의 상세 리뷰, 장단점, 구매 가이드까지",
      "slug": "samsung-galaxy-buds3-review-guide-2024",
      "status": "draft",
      "createdAt": "2024-01-15T10:30:00Z"
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
curl -X POST http://localhost:54321/functions/v1/write \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "itemId": "test_001",
    "researchPack": {
      "title": "테스트 상품",
      "features": ["기능1", "기능2"],
      "pros": ["장점1", "장점2"],
      "cons": ["단점1"],
      "keywords": ["키워드1", "키워드2"]
    }
  }'
```

### JavaScript/TypeScript 예제
```typescript
const { data, error } = await supabase.functions.invoke('write', {
  body: {
    itemId: 'test_001',
    researchPack: {
      title: '테스트 상품',
      features: ['기능1', '기능2'],
      pros: ['장점1', '장점2'],
      cons: ['단점1'],
      keywords: ['키워드1', '키워드2'],
      metaTitle: '테스트 상품 리뷰',
      metaDescription: '테스트 상품에 대한 자세한 리뷰'
    }
  }
});

if (error) {
  console.error('Content generation failed:', error);
} else {
  console.log('Generated content:', data);
}
```

## 필수 환경 변수

```bash
OPENAI_API_KEY=sk-your-openai-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 구현 세부사항

### 주요 프로세스
1. **입력 검증**: itemId, researchPack 필수 필드 확인
2. **OpenAI API 호출**: GPT-4 모델을 통한 SEO 콘텐츠 생성
3. **콘텐츠 구조화**: 5장 구성의 마크다운 콘텐츠 생성
4. **메타데이터 생성**: SEO 최적화된 제목, 설명, 슬러그 생성
5. **데이터베이스 저장**: drafts 테이블에 upsert 방식으로 저장

### OpenAI API 설정
- **모델**: gpt-4o (최신 GPT-4 모델)
- **최대 토큰**: 4000
- **Temperature**: 0.7 (창의적이면서도 일관된 콘텐츠)
- **시스템 프롬프트**: SEO 전문가 및 블로거 역할

### 콘텐츠 구조 (5장 구성)
```markdown
# [상품명] 완벽 가이드

## 1장: 제품 소개 및 개요
- 상품 기본 정보
- 주요 특징 소개

## 2장: 주요 기능 및 특징
- 상세 기능 분석
- 기술적 스펙 설명

## 3장: 장점과 단점 분석
- 객관적 장점 분석
- 솔직한 단점 평가

## 4장: 사용자 경험 및 활용법
- 실제 사용 경험
- 활용 팁과 노하우

## 5장: 구매 가이드 및 결론
- 구매 추천 대상
- 최종 평가 및 결론
```

### SEO 최적화 요소
```typescript
// 자동 생성되는 SEO 메타데이터
const seoData = {
  metaTitle: `${title} 완벽 가이드: ${new Date().getFullYear()}년`,
  metaDescription: `${title}의 상세 리뷰, 장단점, 구매 가이드까지 완벽 정리`,
  slug: generateSlug(title),
  keywords: researchPack.keywords,
  structuredContent: markdownContent
};
```

## 테스트 방법

### 로컬 테스트
```bash
# Supabase 로컬 서비스 시작
supabase start

# 함수 서빙
supabase functions serve write --env-file .env.local

# 테스트 요청
curl -X POST http://localhost:54321/functions/v1/write \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "test_001",
    "researchPack": {
      "title": "테스트 상품",
      "features": ["기능1"],
      "pros": ["장점1"],
      "cons": ["단점1"]
    }
  }'
```

### 프로덕션 테스트
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/write \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "itemId": "real_001",
    "researchPack": {...}
  }'
```

## 문제 해결

### 일반적인 오류

**`OPENAI_API_KEY not found`**
```bash
# 해결: 환경 변수 설정
supabase secrets set OPENAI_API_KEY=sk-your-key
```

**`itemId and researchPack are required`**
```bash
# 해결: 필수 필드 포함하여 요청
curl -d '{
  "itemId": "item_001",
  "researchPack": {
    "title": "상품명",
    "features": ["기능"],
    "pros": ["장점"],
    "cons": ["단점"]
  }
}'
```

**`OpenAI API quota exceeded`**
- OpenAI 사용량 한도 초과
- 결제 정보 확인 또는 플랜 업그레이드 필요

**`Content generation failed`**
- OpenAI API 응답 오류
- 네트워크 연결 상태 확인
- API 키 유효성 검증

**`Database save failed`**
- Supabase 연결 확인
- drafts 테이블 스키마 확인
- SERVICE_ROLE_KEY 권한 확인

### 디버깅 방법

**로그 확인:**
```bash
supabase functions logs write --tail
```

**OpenAI API 호출 확인:**
- 함수 로그에서 API 요청/응답 확인
- 토큰 사용량 모니터링

**생성된 콘텐츠 확인:**
```sql
SELECT * FROM drafts WHERE item_id = 'your_item_id';
```

**콘텐츠 품질 검증:**
- 마크다운 문법 유효성
- SEO 요소 포함 여부
- 5장 구조 준수 확인

## 성능 고려사항

- **응답 시간**: 평균 15-30초 (GPT-4 API 의존)
- **토큰 사용량**: 요청당 약 2000-4000 토큰
- **콘텐츠 길이**: 평균 3000-5000자의 고품질 콘텐츠
- **동시 처리**: OpenAI API 제한에 따라 조절
- **캐싱**: 동일 itemId 재요청시 기존 draft 업데이트