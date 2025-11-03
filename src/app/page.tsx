// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import GameCard from '@/components/GameCard';
import { motion } from 'framer-motion';
import { Sparkles, Star, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore';

export interface GameKey {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  categories: string[];
  top: boolean;
  discountPrice?: number;
  offerActive?: boolean;
  offerEndsAt?: string;
  offerStart?: string;
  type?: 'key' | 'account';
  email?: string;
  password?: string;
  region?: string;
}

export default function Home() {
  const [products, setProducts] = useState<GameKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [offerTimeLeft, setOfferTimeLeft] = useState<string | null>(null);

  // 🔥 Cargar productos desde Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const data: GameKey[] = snapshot.docs.map((doc) => {
          const d = doc.data() as DocumentData;
          const now = Date.now();
          let discountPrice: number | undefined = d.discountPrice;
          let offerActive = Boolean(d.offerActive);

          // Si la oferta ha expirado
          if (d.offerEndsAt && now > new Date(d.offerEndsAt).getTime()) {
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
            offerEndsAt: d.offerEndsAt ?? null,
            offerStart: d.offerStart ?? null,
            type: d.type ?? 'key',
            email: d.email ?? null,
            password: d.password ?? null,
            region: d.region ?? null,
          };
        });

        const allCategories = Array.from(new Set(data.flatMap((p) => p.categories)));
        setCategories(allCategories);
        setProducts(data);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🎠 Carrusel auto
  const featuredGames = products.filter((g) => g.top).slice(0, 8);
  useEffect(() => {
    if (!featuredGames.length) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredGames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredGames]);

  // ⏱ Cronómetro global de ofertas
  useEffect(() => {
    const updateGlobalOfferTimer = () => {
      const activeOffers = products.filter((p) => p.offerActive && p.offerEndsAt);
      if (!activeOffers.length) {
        setOfferTimeLeft(null);
        return;
      }

      // Tomamos la oferta que termina más pronto
      const soonest = activeOffers.reduce((prev, curr) => {
        return new Date(prev.offerEndsAt!).getTime() < new Date(curr.offerEndsAt!).getTime()
          ? prev
          : curr;
      });

      const diff = new Date(soonest.offerEndsAt!).getTime() - Date.now();
      if (diff <= 0) {
        setOfferTimeLeft("Finalizada");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setOfferTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateGlobalOfferTimer();
    const interval = setInterval(updateGlobalOfferTimer, 1000);
    return () => clearInterval(interval);
  }, [products]);

  const popularGames = products.slice(0, 8);
  const newGames = products.slice(-8);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-white flex flex-col items-center px-4 sm:px-6 py-10">

      {/* HERO */}
      <section className="w-full max-w-7xl text-center mb-16 px-2 sm:px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 text-transparent bg-clip-text">
          Bienvenido a <span className="text-white">SukiScroll Store</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6">
          Juegos y keys seguras, entrega inmediata ⚡
        </p>

        {/* 🔥 Cronómetro global de ofertas */}
        {offerTimeLeft && (
          <div className="inline-flex items-center gap-3 bg-red-600/30 px-5 py-3 rounded-2xl text-lg sm:text-xl font-bold text-white shadow-lg">
            <Clock size={24} />
            Oferta especial termina en: {offerTimeLeft}
          </div>
        )}
      </section>

      {/* DESTACADOS */}
      <section className="w-full max-w-7xl mb-16 relative">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" /> Destacados
        </h2>
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <div className="overflow-hidden relative w-full rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {featuredGames.map((game) => (
                <div key={game.id} className="shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* POPULARES */}
      <section className="w-full max-w-7xl mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Populares</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {popularGames.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="h-full flex flex-col"
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* NUEVOS */}
      <section className="w-full max-w-7xl mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Novedades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {newGames.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="h-full flex flex-col"
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
