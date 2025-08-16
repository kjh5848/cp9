import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { Suspense } from 'react';
import ProductClientPage from '@/features/product/components/ProductClientPage';

export default function ProductPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductClientPage />
      </Suspense>
    </AuthGuard>
  );
}
