# 04. 레거시 로직 마이그레이션 가이드

이 문서는 기존 Vite/SPA 방식 또는 구조화되지 않은(`legacy/` 혹은 복잡한 `components/` 등) 폴더 내의 방대한 컴포넌트들을 FSD(Feature-Sliced Design) 아키텍처로 안전하게 옮기는 방법에 대한 지침서입니다.

## 1. 컴포넌트 해체 전략

과거의 코드베이스에서는 UI 렌더링, API 데이터 페칭, 그리고 복잡한 로컬 상태 관리(`useState`, `useEffect`)가 하나의 컴포넌트에 거대하게 섞여 있었습니다. 마이그레이션 시에는 이를 기능적 역할에 따라 최소 두 개(혹은 세 개)로 쪼개야 합니다.

**Before (Monolithic Component)**:
```tsx
// legacy/src/components/DataViewer.tsx
export const DataViewer = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/v1/data/1')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className="data-card">
      <h1>{data.title}</h1>
      <ul className="list-items">
         {/* 복잡한 맵핑 로직 */}
      </ul>
      <button onClick={() => alert('Download')}>다운로드</button>
    </div>
  )
};
```

**After (FSD Approach)**:
마이그레이션 시에는 도메인(Entities)과 액션(Features)을 명확히 나눕니다.

1. **도메인 순수 렌더 컴포넌트 정의 (`entities/data/ui/DataCard.tsx`)**
   이 컴포넌트는 어떠한 API도 호출하지 않으며 오로지 Props만 받아서 UI를 텍스트로 그립니다.
   ```tsx
   import { DataSchema } from '../model/types';
   
   interface DataCardProps {
     data: DataSchema;
     onDownload?: () => void;
   }
   
   export const DataCard = ({ data, onDownload }: DataCardProps) => (
     <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
       <h1 className="text-white text-lg font-bold">{data.title}</h1>
       <ul>...</ul>
       {onDownload && <button onClick={onDownload}>다운로드</button>}
     </div>
   );
   ```

2. **비즈니스 상태 로직 분리 (`features/view-data/model/useDataViewModel.ts`)**
   상태와 라이프사이클 훅만 분리합니다. Next.js App Router 특성상 'use client'가 붙어야 하는 부분을 최소화할 수 있습니다.
   ```ts
   import { useState, useEffect } from 'react';
   import { fetchDataInfo } from '../api/dataApi';
   
   export const useDataViewModel = (dataId: string) => {
     const [data, setData] = useState(null);
     const [isLoading, setIsLoading] = useState(true);
     
     useEffect(() => { ... }, [dataId]);
     
     const handleDownload = () => { ... };
     
     return { data, isLoading, actions: { handleDownload } };
   };
   ```

3. **결합 컴포넌트 (액션과 뷰 결합) (`features/view-data/ui/DataViewer.tsx`)**
   위에서 만든 순수 View(`entities/.../DataCard`)와 상태 로직 훅(`useDataViewModel`)을 합쳐 실제 사용될 위젯이나 피쳐 컴포넌트를 구성합니다.
   라우트 페이지(`app/(group)/data/[id]/page.tsx`)에서는 이 결합 컴포넌트를 임포트하여 배치하기만 합니다.

## 2. 의존성 격리 (Coupling 분리)

과거 코드에서 타 컴포넌트를 함부로 `import`해서 사용하는(스파게티 의존성) 문제가 흔합니다. FSD의 핵심 가치는 모듈 격리입니다.
- **절대 피해야 할 임포트**: `import { Button } from '../../../../components/Button'` (상대 경로 지옥)
- **권장 방향**: `@/shared/ui/Button`, `@/entities/data` 등으로 Path Alias를 적극 활용하며, "상위 계층이 하위 계층을 임포트하는 것"은 허용되나, **절대로 하위 계층(예: `shared` 나 `entities`)에서 상위 계층(`features` 나 `app`)을 임포트해서는 안 됩니다.**

## 3. `any` 타입 퇴출 및 `entities` 에 타입 명시
마이그레이션하면서 기존 로직에 존재하는 `any`들은 `interface`나 `type` 선언으로 구체화해야 합니다. API 명세서 등 백엔드 문서와 대조하여 DTO(Data Transfer Object) 타입을 `entities/[domain-name]/model/types.ts` 에 정의하고 엄격하게 사용합니다.
