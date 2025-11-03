// src/store/cartStore.ts
import { create } from 'zustand';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number; // ✅ agregar cantidad
}

interface CartState {
    items: CartItem[];
    drawerOpen: boolean;
    addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    toggleDrawer: () => void;
    updateQuantity: (id: string, quantity: number) => void;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    drawerOpen: false,
    addItem: (item, qty = 1) =>
        set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
                    ),
                };
            }
            return { items: [...state.items, { ...item, quantity: qty }] };
        }),
    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    clearCart: () => set({ items: [] }),
    toggleDrawer: () => set({ drawerOpen: !get().drawerOpen }),
    updateQuantity: (id, quantity) =>
        set((state) => ({
            items: state.items
                .map((i) => (i.id === id ? { ...i, quantity } : i))
                .filter((i) => i.quantity > 0),
        })),
    getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
