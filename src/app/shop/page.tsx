'use client';

import { useState, useEffect, useMemo } from 'react';
import GameCard from '@/components/GameCard';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore'; // Importamos DocumentData

export interface GameKey {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string;
    description: string;
    categories: string[];
    top: boolean;
    type?: 'key' | 'account';
    discountPercentage?: number;
    discountPrice?: number;
    offerActive?: boolean;
    offerEnd?: string;
    offerEndsAt?: string;
}

export default function Store() {
    const categories = ['Aventura', 'Carreras', 'RPG', 'Shooter', 'Indie', 'Estrategia', 'Simulación'];
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
    const [discountFilter, setDiscountFilter] = useState<'all' | 'on'>('all');
    const [itemsToShow, setItemsToShow] = useState(12);
    const [products, setProducts] = useState<GameKey[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar productos desde Firebase
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const snapshot = await getDocs(collection(db, 'products'));
                const data: GameKey[] = snapshot.docs.map((doc) => {
                    const d = doc.data() as DocumentData;
                    const now = Date.now();

                    const offerEndField = d.offerEndsAt || d.offerEnd;
                    let discountPrice: number | undefined = d.discountPrice;
                    let offerActive = Boolean(d.offerActive);

                    if (offerEndField && now > new Date(offerEndField).getTime()) {
                        offerActive = false;
                        discountPrice = undefined;
                    }

                    return {
                        id: doc.id,
                        name: d.name,
                        price: Number(d.price) || 0,
                        stock: Number(d.stock) || 0,
                        imageUrl: d.imageUrl || '/placeholder.png',
                        description: d.description || '',
                        categories: Array.isArray(d.categories) ? d.categories : [],
                        top: Boolean(d.top),
                        discountPrice,
                        offerActive,
                        offerEnd: offerEndField,
                        type: d.type ?? 'key',
                    };
                });
                setProducts(data);
            } catch (error) {
                console.error('Error cargando productos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filtrado de productos
    const filteredGames = useMemo(() => {
        return products
            .filter(game => !selectedCategory || game.categories.includes(selectedCategory))
            .filter(game => game.name.toLowerCase().includes(search.toLowerCase()))
            .filter(game => discountFilter === 'all' || (discountFilter === 'on' && game.discountPrice && game.offerActive))
            .filter(game => {
                const effectivePrice = (game.offerActive && game.discountPrice) ? game.discountPrice : game.price;

                if (priceFilter === 'low') return effectivePrice < 10000;
                if (priceFilter === 'mid') return effectivePrice >= 10000 && effectivePrice <= 30000;
                if (priceFilter === 'high') return effectivePrice > 30000;
                return true;
            })
            .slice(0, itemsToShow);
    }, [selectedCategory, search, priceFilter, itemsToShow, products, discountFilter]);

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-8">

            {/* SIDEBAR */}
            <aside className="w-full lg:w-64 flex-shrink-0 bg-gray-900/70 p-4 rounded-2xl flex flex-col gap-6">
                <h2 className="text-xl font-bold mb-2">Filtros</h2>

                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar juegos..."
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500 transition"
                />

                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-300">Categorías:</span>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                            className={`px-3 py-1 rounded-full text-sm transition ${selectedCategory === cat
                                ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg'
                                : 'bg-gray-800 hover:bg-gray-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-300">Precio:</span>
                    <select
                        value={priceFilter}
                        onChange={e => setPriceFilter(e.target.value as any)}
                        className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500 transition"
                    >
                        <option value="all">Todos los precios</option>
                        <option value="low">Menos de $10.000</option>
                        <option value="mid">$10.000 - $30.000</option>
                        <option value="high">Más de $30.000</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-300">Ofertas:</span>
                    <button
                        onClick={() => setDiscountFilter(discountFilter === 'on' ? 'all' : 'on')}
                        className={`px-3 py-1 rounded-full text-sm transition ${discountFilter === 'on'
                            ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg'
                            : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        Solo ofertas
                    </button>
                </div>
            </aside>

            {/* GRID DE PRODUCTOS */}
            <section className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {loading ? (
                    <p className="text-gray-400 col-span-full text-center mt-10">Cargando productos...</p>
                ) : filteredGames.length > 0 ? (
                    filteredGames.map((game, idx) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="flex flex-col" // sin h-full
                        >
                            <GameCard game={game} />
                        </motion.div>
                    ))
                ) : (
                    <p className="text-gray-400 col-span-full text-center mt-10">No se encontraron productos.</p>
                )}

                {!loading && itemsToShow < products.length && (
                    <button
                        onClick={() => setItemsToShow(prev => prev + 12)}
                        className="mt-8 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:scale-105 transition-transform px-6 py-3 rounded-2xl font-semibold shadow-lg text-white col-span-full"
                    >
                        Cargar más
                    </button>
                )}
            </section>
        </main>
    );
}
