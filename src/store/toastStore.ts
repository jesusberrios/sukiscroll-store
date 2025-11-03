// store/toastStore.ts
import { create } from 'zustand';

export interface Toast {
    id: string;
    message: string;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message: string) =>
        set((state) => {
            const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`; // ID único
            setTimeout(() => {
                set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
            }, 2000);
            return { toasts: [...state.toasts, { id, message }] };
        }),
    removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
