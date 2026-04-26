# Codex 정적 Pages 전환 과제

## 1. 목적

현재 WordPress 자동 발행 구조와 별개로, 이후 Cloudflare Pages 기반 정적 콘텐츠 사이트 전환을 검토한다.

이 문서는 당장 구현하는 설계서가 아니라 다음 작업을 위한 과제 메모다. 현재 운영 중인 WordPress 발행 자동화는 유지한다.

## 2. 전환 방향

목표는 자동화 플랫폼을 새로 만드는 것이 아니라 정적 페이지를 서비스하는 것이다.

기본 흐름:

```text
Codex가 글과 이미지, 메타데이터를 생성한다.
생성 결과를 Git 저장소의 정적 콘텐츠 파일로 저장한다.
Codex가 commit/push 한다.
Cloudflare Pages가 Git push를 감지해 자동 배포한다.
사용자는 정적 블로그 페이지를 본다.
```

## 3. WordPress와의 역할 차이

WordPress는 글 저장, 편집기, 미디어 라이브러리, REST API, 테마 렌더링을 함께 담당한다.

정적 Pages 구조에서는 이 역할을 분리한다.

```text
글 원본: Git
이미지 원본: repo asset 또는 R2
렌더링: 정적 사이트 빌드
배포: Cloudflare Pages
수정 이력: Git commit history
```

이 구조에서는 WordPress REST API, 앱 비밀번호, 테마 CSS 충돌, 미디어 업로드 지연이 줄어든다. 대신 관리자 화면과 편집기는 직접 만들거나 Git 기반으로 운영해야 한다.

## 4. 초기 파일 구조 후보

```text
content/posts/YYYY-MM-DD/<slug>.mdx
content/assets/<slug>/thumbnail.jpg
content/assets/<slug>/image-01.jpg
data/publisher-history.json
data/keyword-candidates.json
```

글 파일 frontmatter 예시:

```yaml
---
title: "식기세척기 고르는 법 밀레, LG, 삼성, SK매직 브랜드 이미지와 세척 철학"
slug: "dishwasher-brand-philosophy"
category: "주방가전"
articleType: "deepdive"
publishedAt: "2026-04-27T09:00:00+09:00"
thumbnail: "/assets/dishwasher-brand-philosophy/thumbnail.jpg"
disclosure: true
---
```

## 5. 필수 구현 범위

정적 사이트 MVP에 필요한 기능:

- 글 목록 페이지
- 글 상세 페이지
- 카테고리 페이지
- 글 유형 페이지
- `sitemap.xml`
- `robots.txt`
- RSS feed
- canonical URL
- JSON-LD 구조화 데이터
- 쿠팡 파트너스 고지 자동 삽입
- 모바일 비교 카드와 큐레이션 카드 렌더링

## 6. Codex 작성 플로우

기존 A 자동화의 WordPress 업로드 단계를 정적 파일 생성 단계로 바꾼다.

```text
1. pending 키워드 후보 선택
2. 상품 후보 조회와 선별
3. 글 본문 생성
4. 대표 이미지와 본문 이미지 생성
5. MDX 파일과 이미지 파일 저장
6. sitemap/RSS 빌드 확인
7. git commit/push
8. Cloudflare Pages 배포 확인
9. history에 commit hash, deployed URL, 상태 기록
```

## 7. 내일 확인할 질문

내일 작업 전에 아래 결정을 먼저 한다.

1. 프레임워크를 무엇으로 할 것인가
   - Next.js static export
   - Astro
   - Remix/React Router static
   - 순수 Vite + MDX

2. 이미지 저장소를 어디로 둘 것인가
   - repo 내부 `content/assets`
   - Cloudflare R2
   - 초기는 repo 내부, 이후 R2 전환

3. 기존 WordPress 글을 마이그레이션할 것인가
   - 신규 글부터 정적 Pages에 발행
   - 기존 글 일부만 샘플 이전
   - 전체 이전

4. 도메인 운영 방식을 어떻게 할 것인가
   - WordPress와 Pages 병렬 운영
   - Pages를 서브도메인에서 검증
   - 검증 후 메인 도메인 전환

## 8. 추천 시작안

바로 전환하지 말고 병렬 검증으로 시작한다.

```text
1단계: Cloudflare Pages용 정적 블로그 MVP 생성
2단계: 신규 글 3개를 정적 Pages에만 발행
3단계: 속도, 색인, 모바일 가독성, 전환 링크 클릭을 비교
4단계: 결과가 좋으면 WordPress 발행을 중단하고 Pages를 메인으로 전환
```

## 9. 현재 상태

- 현재 WordPress 자동 발행은 유지한다.
- 이 문서는 이후 전환 과제 문서이며, 지금 실행 대상은 아니다.
- 다음 작업에서는 이 문서를 기준으로 정적 Pages MVP 구현 계획을 작성한다.
