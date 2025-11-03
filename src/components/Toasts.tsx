'use client';
import { useToastStore } from '@/store/toastStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-md"
                    >
                        {toast.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
