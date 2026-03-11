import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CoupangProductResponse } from '@/shared/types/api';

interface ProductCartState {
  cartItems: Record<number, CoupangProductResponse>;
  
  // Actions
  toggleItem: (item: CoupangProductResponse) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

export const useProductCartStore = create<ProductCartState>()(
  persist(
    (set) => ({
      cartItems: {},

      toggleItem: (item) => set((state) => {
        const newItems = { ...state.cartItems };
        if (newItems[item.productId]) {
          delete newItems[item.productId];
        } else {
          newItems[item.productId] = item;
        }
        return { cartItems: newItems };
      }),

      removeItem: (productId) => set((state) => {
        const newItems = { ...state.cartItems };
        delete newItems[productId];
        return { cartItems: newItems };
      }),

      clearCart: () => set({ cartItems: {} }),
    }),
    {
      name: 'cp9-product-cart-storage',
    }
  )
);
