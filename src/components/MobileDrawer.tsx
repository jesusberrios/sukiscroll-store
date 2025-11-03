'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { User } from 'firebase/auth';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    isAdmin: (user: User | null) => boolean | null;
    onLogout: () => void;
    onLoginClick: () => void;
}

export default function MobileDrawer({
    isOpen,
    onClose,
    user,
    isAdmin,
    onLogout,
    onLoginClick,
}: MobileDrawerProps) {
    const sidebarVariants = {
        open: { x: 0 },
        closed: { x: '100%' },
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay con efecto de desenfoque */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Drawer */}
            <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 w-72 h-full bg-linear-to-b from-gray-900/95 via-gray-950/95 to-gray-900/95 backdrop-blur-lg shadow-2xl z-60 p-6 flex flex-col md:hidden border-l border-gray-800"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                    <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-orange-500">
                        Menú
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex flex-col gap-4 mt-4">
                    <Link
                        href="/shop"
                        onClick={onClose}
                        className="text-lg font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                        Tienda
                    </Link>
                    <Link
                        href="/about"
                        onClick={onClose}
                        className="text-lg font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                        Nosotros
                    </Link>

                    {/* Usuario */}
                    {user ? (
                        <>
                            <Link
                                href="/profile"
                                onClick={onClose}
                                className="mt-4 text-lg font-semibold text-purple-400 hover:text-purple-500 transition-colors border-t border-gray-800 pt-4"
                            >
                                {user.displayName || user.email?.split('@')[0]}
                            </Link>

                            {isAdmin(user) && (
                                <Link
                                    href="/admin"
                                    onClick={onClose}
                                    className="text-lg font-semibold text-pink-400 hover:text-pink-500 transition-colors mt-2"
                                >
                                    Panel Admin
                                </Link>
                            )}

                            <button
                                onClick={() => {
                                    onClose();
                                    onLogout();
                                }}
                                className="mt-4 text-left text-lg font-semibold text-red-500 hover:text-red-600 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="mt-4 text-left text-lg font-semibold text-gray-300 hover:text-white transition-colors border-t border-gray-800 pt-4"
                        >
                            Login / Registro
                        </button>
                    )}
                </nav>

                {/* Footer con redes o créditos */}
                <div className="mt-auto pt-6 border-t border-gray-800 text-gray-500 text-sm flex flex-col gap-2">
                    <p className="hover:text-gray-300 transition-colors cursor-default">
                        © 2025 SukiScroll Store
                    </p>
                    <p className="hover:text-gray-300 transition-colors cursor-default">
                        Todos los derechos reservados
                    </p>
                </div>
            </motion.div>
        </>
    );
}
