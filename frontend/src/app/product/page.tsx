import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { Suspense } from 'react';
import ProductClientPage from '@/features/product/components/ProductClientPage';
import { SimpleLoadingSpinner } from '@/shared/components/advanced-ui';

export default function ProductPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<SimpleLoadingSpinner message="상품 페이지 로딩 중..." />}>
        <ProductClientPage />
      </Suspense>
    </AuthGuard>
  );
}
