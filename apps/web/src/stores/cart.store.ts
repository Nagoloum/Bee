import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  imageUrl?: string;
  unitPriceXaf: number;
  quantity: number;
  shopId: string;
  shopName: string;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clear: () => void;
  totalXaf: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      remove: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      updateQty: (variantId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.variantId === variantId ? { ...i, quantity: qty } : i)),
        })),
      clear: () => set({ items: [] }),
      totalXaf: () => get().items.reduce((t, i) => t + i.unitPriceXaf * i.quantity, 0),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: 'bee.cart' },
  ),
);
