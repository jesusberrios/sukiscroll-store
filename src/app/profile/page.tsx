'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, updateProfile, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (usr) => {
            if (usr) {
                setUser(usr);
                setDisplayName(usr.displayName || '');
                const docRef = doc(db, 'users', usr.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAge(data.age || '');
                }
            } else {
                router.push('/');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateProfile(user, { displayName });
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, { age });
            alert('Perfil actualizado correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    if (loading) return <p className="text-white text-center mt-10">Cargando perfil...</p>;

    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-start p-6">
            <div className="w-full max-w-md bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-700">
                <h1 className="text-3xl font-bold mb-6 text-center text-white">Perfil de Usuario</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full p-3 rounded-xl bg-gray-700 text-white cursor-not-allowed border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Edad</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                        />
                    </div>

                    <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200"
                    >
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition-colors duration-200"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
