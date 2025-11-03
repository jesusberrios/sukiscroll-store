'use client';

import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus } from 'lucide-react';

export default function CartDrawer() {
    const router = useRouter();
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const drawerOpen = useCartStore((state) => state.drawerOpen);
    const toggleDrawer = useCartStore((state) => state.toggleDrawer);

    const totalPrice = useMemo(
        () => items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0),
        [items]
    );

    const formatCLP = (price: number) =>
        new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(price);

    const handleCheckout = () => {
        toggleDrawer();
        router.push('/checkout');
    };

    return (
        <AnimatePresence>
            {drawerOpen && (
                <>
                    {/* Fondo oscuro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5, transition: { duration: 0.2 } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="fixed inset-0 bg-black backdrop-blur-sm z-40"
                        onClick={toggleDrawer}
                    />

                    {/* Drawer lateral */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
                        exit={{ x: '100%', transition: { duration: 0.2, ease: 'easeIn' } }}
                        className="fixed top-0 right-0 h-full w-full sm:max-w-xs md:max-w-sm lg:max-w-md bg-gray-900 z-50 shadow-2xl p-6 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                            <h2 className="text-2xl font-bold text-white tracking-wide">Tu Carrito</h2>
                            <button
                                onClick={toggleDrawer}
                                className="text-white text-2xl font-bold hover:text-red-400 transition"
                                aria-label="Cerrar carrito"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Lista de items */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
                            {items.length === 0 ? (
                                <p className="text-gray-400 text-center mt-10">Carrito vacío</p>
                            ) : (
                                items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row gap-4 items-center bg-gray-800/60 p-3 rounded-2xl hover:bg-gray-800 transition shadow-md hover:shadow-purple-500/20"
                                    >
                                        <div className="relative w-20 h-20 shrink-0">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="rounded-lg object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
                                            <div className="mb-2 sm:mb-0">
                                                <p className="font-semibold text-white">{item.name}</p>
                                                <p className="text-gray-300 mt-1 font-medium">
                                                    {formatCLP(item.price * (item.quantity || 1))}
                                                </p>
                                            </div>

                                            {/* Controles de cantidad */}
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                <button
                                                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                    disabled={(item.quantity || 1) <= 1}
                                                    className="w-9 h-9 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>

                                                <span className="w-6 text-center text-white font-medium">{item.quantity}</span>

                                                <button
                                                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                    className="w-9 h-9 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="ml-2 text-red-500 font-bold hover:text-red-400 transition"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-gray-800">
                                <p className="text-white font-bold text-lg text-center">
                                    Total: {formatCLP(totalPrice)}
                                </p>

                                <button
                                    onClick={clearCart}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                                >
                                    Vaciar Carrito
                                </button>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-linear-to-r from-purple-500 via-pink-500 to-orange-400 hover:scale-105 transition-transform text-white py-3 rounded-lg font-semibold shadow-md shadow-purple-500/50"
                                >
                                    Pagar Ahora
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
