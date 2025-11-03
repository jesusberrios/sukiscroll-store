// app/not-found.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-white px-4">

            {/* Icono de alerta */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
                className="mb-6"
            >
                <AlertCircle className="w-20 h-20 text-pink-500 animate-pulse" />
            </motion.div>

            {/* Código 404 */}
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-6xl sm:text-7xl md:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-500 to-orange-400"
            >
                404
            </motion.h1>

            {/* Mensaje */}
            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-400 text-center text-lg sm:text-xl mb-8 max-w-md"
            >
                Ups… el recurso que buscas no existe. ¡Pero no te preocupes, todavía puedes explorar la tienda!
            </motion.p>

            {/* Botón de regreso */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <Link
                    href="/"
                    className="relative inline-block px-8 py-4 font-semibold text-white rounded-3xl shadow-lg bg-linear-to-r from-purple-600 via-pink-500 to-orange-500 hover:scale-105 transition-transform hover:shadow-pink-500/60"
                >
                    Volver al inicio
                    <span className="absolute -inset-0.5 rounded-3xl bg-linear-to-r from-pink-500 via-purple-500 to-orange-400 blur opacity-50 animate-pulse"></span>
                </Link>
            </motion.div>

            {/* Pequeños efectos extra */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-pink-500/20 via-purple-500/20 to-orange-500/20 pointer-events-none"
            />
        </div>
    );
}
