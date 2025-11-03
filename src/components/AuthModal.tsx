'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            let user: User;
            if (mode === 'login') {
                const res = await signInWithEmailAndPassword(auth, email, password);
                user = res.user;
            } else {
                const res = await createUserWithEmailAndPassword(auth, email, password);
                user = res.user;
                await updateProfile(user, { displayName: name });
                await setDoc(doc(db, 'users', user.uid), {
                    name,
                    dob,
                    email,
                    createdAt: new Date().toISOString(),
                });
            }
            onAuthSuccess(user);
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, 'users', user.uid);
            await setDoc(
                userRef,
                { name: user.displayName, email: user.email, createdAt: new Date().toISOString() },
                { merge: true }
            );
            onAuthSuccess(user);
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Fondo oscuro suave */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
                            {/* Botón cerrar */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-lg"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>

                            {/* Título */}
                            <h2 className="text-2xl font-semibold text-white text-center">
                                {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                            </h2>

                            {/* Error */}
                            {error && <p className="text-red-500 text-center">{error}</p>}

                            {/* Formulario */}
                            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 w-full">
                                {mode === 'register' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Nombre"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                        <input
                                            type="date"
                                            placeholder="Fecha de nacimiento"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            required
                                        />
                                    </>
                                )}

                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow hover:scale-105 transition-transform"
                                >
                                    {mode === 'login' ? 'Login' : 'Registrarse'}
                                </button>
                            </form>

                            {/* Google */}
                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full py-3 mt-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-white flex justify-center items-center gap-2 transition"
                            >
                                Google
                            </button>

                            {/* Switch login/register */}
                            <p className="text-center text-gray-400 mt-2 text-sm">
                                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                    className="text-indigo-400 font-semibold hover:text-indigo-500 ml-1"
                                >
                                    {mode === 'login' ? 'Regístrate' : 'Login'}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
