# 🔄 훅 리팩토링 및 마이그레이션 가이드

## 📋 개요

기존의 거대한 단일 훅들을 책임별로 분리하여 **단일 책임 원칙**을 따르도록 리팩토링했습니다. 각 훅은 명확한 책임을 가지며, 필요에 따라 조합하여 사용할 수 있습니다.

## 🏗️ 새로운 훅 아키텍처

### **레이어별 분리:**

```
🎨 UI Components
    ↓
🏗️ Business Logic Hooks (useWorkflowOrchestrator, useProductActions)
    ↓
📊 State Management Hooks (useWorkflowState, useRealtimeStatus)
🎛️ UI State Hooks (useModal, useClipboard, useLoading)
🔥 API Hooks (useWorkflowAPI, useProductAPI, useSEOAPI)
    ↓
🌐 External APIs
```

## 📦 새로운 훅 목록

### **🔥 API 호출 전용 (Pure API Calls)**
- `useWorkflowAPI` - 워크플로우 API 호출만 담당
- `useProductAPI` - 상품 검색, 카테고리, 딥링크 API
- `useSEOAPI` - SEO 관련 API 호출

### **📊 상태 관리 전용 (State Only)**
- `useWorkflowState` - 워크플로우 상태만 관리
- `useRealtimeStatus` - SSE 실시간 상태 전용

### **🎨 UI 상태 전용 (UI State Only)**
- `useModal` - 모든 모달 상태 관리
- `useClipboard` - 클립보드 조작 전용
- `useLoading` - 로딩 상태 관리 (다중 작업 지원)

### **🏗️ 비즈니스 로직 훅 (Orchestrator)**
- `useWorkflowOrchestrator` - 전체 워크플로우 조율
- `useProductActions` - 상품 액션 로직 (개선됨)

## 🔄 마이그레이션 방법

### **방법 1: 점진적 마이그레이션 (권장)**

기존 훅들을 그대로 사용하면서 내부적으로만 새 훅들을 사용:

```typescript
// 기존 코드는 그대로 유지
const { executeWorkflow, isLoading } = useWorkflow();

// 내부적으로는 분리된 훅들 사용
// (useWorkflow.refactored.ts 파일 참조)
```

### **방법 2: 직접 새 훅 사용**

필요한 기능에 따라 적합한 훅 선택:

```typescript
// API 호출만 필요한 경우
import { useWorkflowAPI } from '@/shared/hooks';
const { executeWorkflow } = useWorkflowAPI();

// 전체 워크플로우가 필요한 경우
import { useWorkflowOrchestrator } from '@/shared/hooks';
const orchestrator = useWorkflowOrchestrator();

// 특정 UI 상태만 필요한 경우
import { useModal, useLoading } from '@/shared/hooks';
const modal = useModal();
const loading = useLoading();
```

## 📋 구체적인 마이그레이션 예시

### **1. 기존 useWorkflow 훅 사용 코드**

```typescript
// ❌ 기존 코드 (349줄의 거대한 훅)
const { 
  executeWorkflow, 
  workflowStatus, 
  isLoading, 
  resetWorkflow,
  generateSeoContent 
} = useWorkflow();
```

### **2. 새로운 방식들**

#### **A. 호환성 유지 방식:**
```typescript
// ✅ 동일한 인터페이스, 개선된 내부 구조
import { useWorkflow } from '@/features/workflow/hooks/useWorkflow.refactored';

const { 
  executeWorkflow, 
  workflowStatus, 
  isLoading, 
  resetWorkflow,
  generateSeoContent 
} = useWorkflow(); // 기존과 완전 동일
```

#### **B. 분리된 훅 직접 사용:**
```typescript
// ✅ 필요한 기능별로 선택적 사용
import { 
  useWorkflowOrchestrator,
  useModal,
  useLoading 
} from '@/shared/hooks';

const workflow = useWorkflowOrchestrator();
const modal = useModal();
const loading = useLoading();

// 더 세밀한 제어 가능
if (workflow.isLoading) {
  loading.startLoading('workflow', '워크플로우 실행 중...');
}
```

### **3. 기존 useProductActions 사용 코드**

```typescript
// ❌ 기존 코드 (복잡한 혼재된 로직)
const {
  isActionModalOpen,
  isSeoLoading,
  handleCopySelectedLinks,
  handleGenerateSeo,
  handleActionButtonClick,
  closeActionModal
} = useProductActions(filteredResults, selected);
```

#### **A. 호환성 유지 방식:**
```typescript
// ✅ 동일한 인터페이스, 개선된 내부 구조
import { useProductActions } from '@/features/product/hooks/useProductActions.refactored';

const {
  isActionModalOpen,
  isSeoLoading,
  handleCopySelectedLinks,
  handleGenerateSeo,
  handleActionButtonClick,
  closeActionModal
} = useProductActions(filteredResults, selected); // 기존과 완전 동일
```

#### **B. 분리된 훅 직접 사용:**
```typescript
// ✅ 더 유연한 사용
import { 
  useProductActions,
  useModal,
  useClipboard,
  useWorkflowOrchestrator 
} from '@/shared/hooks';

const productActions = useProductActions(items, selectedIds);
const actionModal = useModal();
const clipboard = useClipboard();
const workflow = useWorkflowOrchestrator();

// 개별 기능을 조합하여 사용
const handleCustomAction = async () => {
  const success = await clipboard.copyURLs(selectedUrls);
  if (success) {
    actionModal.closeModal();
  }
};
```

## 🎯 새로운 훅의 장점

### **1. 단일 책임 원칙**
- 각 훅이 명확한 하나의 책임만 담당
- 코드 이해와 유지보수가 쉬워짐

### **2. 재사용성 향상**
```typescript
// 모달은 여러 곳에서 재사용 가능
const productModal = useModal();
const settingsModal = useModal();
const confirmModal = useModal();
```

### **3. 테스트 용이성**
```typescript
// 각 훅을 독립적으로 테스트 가능
describe('useClipboard', () => {
  it('should copy text to clipboard', () => {
    // 클립보드 기능만 테스트
  });
});
```

### **4. 성능 최적화**
- 필요한 훅만 사용하여 불필요한 렌더링 방지
- 상태 변경이 관련 컴포넌트에만 영향

### **5. 타입 안전성**
```typescript
// 각 훅이 명확한 타입 정의
const loading = useLoading();
loading.startLoading('api-call', '데이터 로딩 중...', 5000);
//                   ^키      ^메시지        ^타임아웃
```

## 📅 마이그레이션 단계별 계획

### **Phase 1: 준비 (완료)**
- [x] 새로운 분리된 훅들 구현
- [x] 호환성 유지 래퍼 훅 생성
- [x] 마이그레이션 가이드 문서 작성

### **Phase 2: 점진적 적용 (권장)**
1. 기존 코드는 `.refactored.ts` 버전으로 교체
2. 새로 작성하는 코드는 분리된 훅 직접 사용
3. 기존 코드 점검 및 개선

### **Phase 3: 완전 전환 (선택적)**
- 기존 훅 파일들을 deprecated 처리
- 모든 컴포넌트를 새 훅으로 전환

## 🛠️ 사용 예시

### **간단한 API 호출만 필요한 경우:**
```typescript
import { useProductAPI } from '@/shared/hooks';

const { searchProducts } = useProductAPI();
const results = await searchProducts({ keyword: '무선 이어폰' });
```

### **전체 워크플로우가 필요한 경우:**
```typescript
import { useWorkflowOrchestrator } from '@/shared/hooks';

const workflow = useWorkflowOrchestrator();
await workflow.executeWorkflow({
  keyword: '무선 이어폰',
  config: { enablePerplexity: true }
});
```

### **UI 상태만 관리하는 경우:**
```typescript
import { useModal, useLoading } from '@/shared/hooks';

const modal = useModal();
const loading = useLoading();

const handleSubmit = async () => {
  loading.startLoading('submit', '제출 중...');
  try {
    await submitData();
    modal.closeModal();
  } finally {
    loading.stopLoading('submit');
  }
};
```

## 🔍 트러블슈팅

### **Q: 기존 코드가 동작하지 않는 경우**
A: `.refactored.ts` 파일을 사용하여 기존 인터페이스를 유지하세요.

### **Q: 타입 에러가 발생하는 경우**
A: `@/shared/hooks`에서 타입을 함께 import하세요.

### **Q: 성능 문제가 발생하는 경우**
A: 필요한 훅만 선택적으로 사용하고, 불필요한 상태 구독을 피하세요.

---

이 가이드를 따라 점진적으로 마이그레이션하면 코드의 유지보수성과 확장성이 크게 향상됩니다.