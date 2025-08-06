import ProductInput from '@/features/product/components/ProductInput';
import { AuthGuard } from '@/features/auth/components/AuthGuard';

export default function ProductPage() {
  return (
    <AuthGuard>
      <main className="p-4 md:p-6">
        <ProductInput />
      </main>
    </AuthGuard>
  );
}
