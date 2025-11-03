'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import CartDrawer from './CartDrawer';
import LoginModal from './AuthModal';
import MobileDrawer from './MobileDrawer';
import { auth, isAdmin } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

function CartCounter() {
    const totalItems = useCartStore((state) => state.getTotalItems());
    return (
        <div className="relative">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-linear-to-tr from-pink-500 via-purple-500 to-orange-400 rounded-full w-5 h-5 text-xs flex items-center justify-center text-white font-semibold shadow-md shadow-pink-500/50">
                    {totalItems}
                </span>
            )}
        </div>
    );
}

function FloatingCartButton() {
    const toggleDrawer = useCartStore((state) => state.toggleDrawer);
    return (
        <motion.button
            onClick={toggleDrawer}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed bottom-6 right-6 bg-linear-to-tr from-purple-500 via-pink-500 to-orange-400 hover:scale-105 transition-transform text-white rounded-full p-4 shadow-xl z-50"
        >
            <CartCounter />
        </motion.button>
    );
}

export default function Navbar() {
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const toggleCartDrawer = useCartStore((state) => state.toggleDrawer);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsHidden(window.scrollY > lastScrollY && window.scrollY > 80);
            setLastScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Detect auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        router.push('/');
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const handleLoginClick = () => {
        closeMobileMenu();
        setShowModal(true);
    };

    return (
        <>
            <motion.nav
                initial={{ opacity: 1, y: 0 }}
                animate={isHidden ? { opacity: 0, y: -80 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 right-0 z-50 bg-gray-950/70 backdrop-blur-md border-b border-gray-800 w-full"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-extrabold text-white tracking-tight hover:text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-orange-400 transition-colors">
                        Suki<span className="text-white">Scroll</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/shop" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Tienda</Link>
                        <Link href="/about" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Nosotros</Link>

                        {user ? (
                            <>
                                <Link href="/profile" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                    {user.displayName || user.email?.split('@')[0]}
                                </Link>
                                {isAdmin(user) && <Link href="/admin" className="text-purple-400 hover:text-purple-500 text-sm font-medium transition-colors">Admin</Link>}
                                <button onClick={handleLogout} className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">Logout</button>
                            </>
                        ) : (
                            <button onClick={() => setShowModal(true)} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Login / Registro</button>
                        )}

                        <div onClick={toggleCartDrawer} className="cursor-pointer"><CartCounter /></div>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex md:hidden items-center gap-4">
                        <div onClick={toggleCartDrawer} className="cursor-pointer"><CartCounter /></div>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-1 focus:outline-none" aria-label="Abrir menú">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Auth Modal */}
            <LoginModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAuthSuccess={(u) => setUser(u)}
            />

            {/* Mobile Drawer */}
            <MobileDrawer
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
                user={user}
                isAdmin={isAdmin}
                onLogout={handleLogout}
                onLoginClick={handleLoginClick}
            />

            {/* Floating Cart Button */}
            <AnimatePresence>
                {isHidden && <FloatingCartButton />}
            </AnimatePresence>

            {/* Cart Drawer */}
            <CartDrawer />
        </>
    );
}
