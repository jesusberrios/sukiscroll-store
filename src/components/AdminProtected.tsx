'use client';

import { useEffect, useState, ReactNode } from 'react';
import { auth, isAdmin } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AdminProtectedProps {
    children: ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login'); // Si no hay usuario → login
                return;
            }

            if (isAdmin(user)) {
                setAllowed(true); // UID en la lista → permitido
            } else {
                router.push('/'); // Usuario normal → home
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) return <p className="text-white text-center mt-10">Cargando...</p>;

    if (!allowed) return null;

    return <>{children}</>;
}
