# Product Layout Update - 7:3 Split with Selected Item Detail

## 🎯 업데이트 내용

상품 검색 결과 페이지에 7:3 레이아웃을 적용하여 선택된 아이템의 상세 정보를 우측에 표시하도록 개선했습니다.

## 🖥️ 레이아웃 변경사항

### 데스크톱 (lg 이상)
- **7:3 그리드 레이아웃** 적용
- **왼쪽 (70%)**: 기존 상품 목록
- **오른쪽 (30%)**: 선택된 아이템 상세 정보 + 액션 버튼

### 모바일 (lg 미만)
- **기존 레이아웃 유지** (스택 형태)
- 하단에 액션 버튼 표시

## 🆕 새로운 컴포넌트

### SelectedItemDetail
```tsx
// 선택된 아이템의 상세 정보를 표시하는 컴포넌트
<SelectedItemDetail
  item={getSelectedItem()}
  onActionButtonClick={handleActionButtonClick}
  selectedCount={selected.length}
  mode={mode}
/>
```

**주요 기능:**
- 선택된 첫 번째 아이템의 상세 정보 표시
- 상품 이미지, 가격, 카테고리 등 표시
- 딥링크의 경우 원본/단축/랜딩 URL 표시
- 각 URL에 대한 복사 기능
- 액션 버튼을 상단에 배치

## 🔧 기술적 구현사항

### 1. 반응형 레이아웃
```tsx
<div className="lg:grid lg:grid-cols-10 lg:gap-6">
  {/* 왼쪽: 상품 목록 (7) */}
  <div className="lg:col-span-7">
    {/* 기존 상품 목록 */}
  </div>

  {/* 오른쪽: 선택된 아이템 정보 (3) */}
  <div className="hidden lg:block lg:col-span-3">
    <div className="sticky top-4">
      <SelectedItemDetail />
    </div>
  </div>
</div>
```

### 2. 선택된 아이템 찾기 로직
```tsx
const getSelectedItem = () => {
  if (selected.length === 0) return null;
  const selectedId = selected[0];
  
  // ID에서 인덱스 추출 (itemId 형식: "product-{index}" 또는 "deeplink-{index}")
  const indexMatch = selectedId.match(/-(.+)$/);
  if (!indexMatch) return null;
  
  const index = parseInt(indexMatch[1]);
  if (isNaN(index) || index >= filteredResults.length) return null;
  
  return filteredResults[index] || null;
};
```

### 3. Sticky 위치 고정
```tsx
<div className="sticky top-4">
  <SelectedItemDetail />
</div>
```

## 📱 사용자 경험 개선사항

### 1. 직관적인 아이템 정보 확인
- 아이템 클릭 시 우측에서 즉시 상세 정보 확인 가능
- 스크롤 없이 정보 확인 가능

### 2. 액션 버튼 접근성 향상
- 데스크톱: 선택된 아이템 영역 상단에 고정
- 모바일: 기존 위치 유지로 접근성 보장

### 3. 반응형 대응
- 모바일에서는 기존 UX 유지
- 데스크톱에서만 7:3 분할 적용

## 🧪 테스트 추가

```bash
# SelectedItemDetail 컴포넌트 테스트 실행
npm run test:local -- --run src/features/product/components/__tests__/SelectedItemDetail.test.tsx
```

**테스트 케이스:**
- 선택된 아이템이 없을 때 플레이스홀더 표시
- 상품 아이템 정보 표시 (이미지, 가격, 카테고리 등)
- 딥링크 아이템 정보 표시 (원본/단축/랜딩 URL)
- 선택 개수에 따른 액션 버튼 표시

## 🎨 UI/UX 특징

### 1. 시각적 계층 구조
- 액션 버튼: 파란색 배경으로 강조
- 아이템 정보: 섹션별 구분된 카드 형태
- URL 정보: 색상별 구분 (원본-파랑, 단축-초록, 랜딩-보라)

### 2. 인터랙션 피드백
- 복사 버튼 호버 효과
- 링크 클릭 시 새 탭 열기
- 선택된 아이템 강조 표시

## 📁 파일 구조

```
src/features/product/components/
├── SelectedItemDetail.tsx          # 새로운 컴포넌트
├── ProductResultView.tsx          # 7:3 레이아웃 적용
├── __tests__/
│   └── SelectedItemDetail.test.tsx # 테스트 파일
└── index.ts                       # export 추가
```

## 🚀 다음 개선 사항

1. **토스트 알림**: 복사 성공/실패 피드백
2. **다중 선택**: 여러 아이템 선택 시 요약 정보 표시
3. **키보드 내비게이션**: 키보드로 아이템 선택 가능
4. **드래그 앤 드롭**: 아이템 순서 변경 기능

---

이 업데이트로 사용자는 더욱 효율적으로 상품 정보를 확인하고 액션을 수행할 수 있게 되었습니다. 🎉