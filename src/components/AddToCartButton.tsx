'use client';
import React from 'react';
import { GameKey } from '@/lib/games';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';

export default function AddToCartButton({ game }: { game: GameKey }) {
    const addItem = useCartStore((state) => state.addItem);
    const addToast = useToastStore((state) => state.addToast);

    const handleAddToCart = () => {
        addItem(
            {
                id: game.id,
                name: game.name,
                price: game.price,
                imageUrl: game.imageUrl,
            },
            1
        );
        addToast(`¡${game.name} agregado al carrito!`);
    };

    return (
        <button
            onClick={handleAddToCart}
            className="
        mt-4
        w-full md:w-auto
        px-6 py-3 sm:py-4
        text-sm sm:text-base md:text-lg
        font-semibold text-white
        rounded-2xl
        bg-linear-to-r from-purple-500 via-pink-500 to-orange-400
        shadow-lg shadow-purple-500/40
        transition-all duration-300
        hover:scale-105 hover:shadow-xl
        active:scale-95 active:shadow-md
        flex justify-center items-center
      "
        >
            Agregar al carrito
        </button>
    );
}
