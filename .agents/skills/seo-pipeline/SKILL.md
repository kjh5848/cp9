---
name: seo-pipeline
description: Guide for creating SEO-optimized content using a multi-step pipeline (Perplexity -> GPT -> DALL-E) based on Google SEO fundamentals. Use this skill when generating marketing posts, comparing products, or creating curation blocks for multiple items.
---

# SEO Pipeline Editor

이 스킬은 쿠팡 상품 데이터를 기반으로 구글 친화적(Google SEO-friendly)인 블로그 콘텐츠 및 특화 글을 자동 생성하는 파이프라인 문서 및 템플릿을 제공합니다. 

해당 스킬은 3가지 명확한 페르소나와 4가지 컨셉(톤앤매너)을 적용하여 **퍼플렉시티 리서치(Perplexity) -> GPT 글 작성(OpenAI) -> 썸네일 생성(DALL-E 3)** 순서로 진행되는 통합 파이프라인 가이드입니다. 

## 구글 SEO 핵심 지침 (Google SEO Starter Guide 기반)
모든 포스트는 다음 구글 검색 센터 가이드라인을 절대적으로 준수하여 생성되어야 합니다:
1. **정확하고 독창적인 페이지 제목(`<title>`)**: 각 페이지마다 고유하고 간결하며 서술적인 제목 작성.
2. **정보를 제공하는 메타 설명(`<meta name="description">`)**: 페이지 콘텐츠를 정확하게 요약하며 일관성 있게 작성.
3. **콘텐츠 계층 구조(Heading 태그)**: `<h1>`은 페이지당 1개만 사용하고, 핵심 주제를 담습니다. 이후 논리적인 흐름에 따라 `<h2>`, `<h3>`를 점진적으로 사용.
4. **이미지 최적화**: 모든 이미지에 설명이 포함된 `alt` 속성을 반드시 기입.
5. **모바일 친화적 글쓰기**: 가독성을 위해 짧은 문장과 명확한 단락(Paragraph) 구분, bullet points 적극 활용.
6. **독자 중심의 전문성 (E-E-A-T)**: 단순한 키워드 나열이 아닌, 사용자(독자)의 궁금증을 해결하는 깊이 있는 실사용 정보와 통찰을 제공할 것.

---

## 파이프라인 단계별 동작 정의

### Phase 1: Perplexity 기반 심층 리서치
사용자가 전달한 상품 정보(이름, 가격, 특장점)와 **페르소나**를 바탕으로 최신 정보를 외부 검색엔진(Perplexity)에서 스크랩합니다. 
> [참조: `references/perplexity-prompts.md`](references/perplexity-prompts.md)

### Phase 2: GPT 기반 SEO 포스팅 작성 
Phase 1에서 수집된 리서치 데이터와 사용자가 선택한 **페르소나** 및 **톤앤매너**를 결합하여 최종적인 마크다운 포스트를 출력합니다.
> [참조: `references/gpt-prompts.md`](references/gpt-prompts.md)

### Phase 3: DALL-E 3 썸네일 이미지 생성
작성된 포스트의 `<h1>` 또는 메인 주제를 바탕으로 영어 프롬프트를 추출하고, 16:9 비율의 블로그 대표 이미지를 생성합니다.
> [참조: `references/dalle-prompts.md`](references/dalle-prompts.md)

---

## 지원하는 페르소나 및 톤앤매너

프론트엔드/백엔드 호출 시 파라미터로 주입되어야 하는 컨셉들입니다.

### Persona (작성자 컨셉)
1. **Single_Expert (단일 상품 딥다이브 전문가)**: 한 가지 제품에 대해 압도적인 지식과 실사용 경험을 바탕으로, 해당 제품의 A to Z를 상세하게 파헤치는 리뷰어.
2. **Compare_Master (다중 상품 비교 분석가)**: 2~5개의 비슷한 상품을 두고 스펙, 가격, 가성비, 실사용 장단점을 객관적으로 비교하여 독자의 결정을 돕는 전문가.
3. **Curation_Blogger (다수 추천 큐레이터)**: 10개 이상의 상품을 카테고리별로 빠르게 훑어주고 트렌드와 베스트셀러를 가볍게 추천해 주는 인플루언서 블로거.

### Tone & Manner (문체 방식)
- **Professional (전문적인)**: 신뢰감을 주는 정제된 어휘, 데이터 중심의 문장. (~다, ~습니다)
- **Friendly (친근한)**: 가까운 지인에게 설명하듯 편안하고 부드러운 말투. (~요, ~알려드릴게요)
- **Humorous (유머러스한)**: 센스 있는 밈이나 재치 있는 농담을 섞어 지루하지 않게 읽히는 문체.
- **Informative (정보 위주의)**: 불필요한 서론을 빼고 핵심 정보, 스펙, 요약만 간결하게 전달하는 문체.

---

## 글 작성 금지 사항

- **이모지/아이콘 삽입 금지**: ✅, 📊, 3️⃣, 🏆 등 이모티콘이나 특수 아이콘 문자를 본문, 제목, 소제목 등 글의 어느 위치에도 삽입하지 마십시오. 텍스트만으로 구성된 순수한 마크다운 형식을 유지합니다.
