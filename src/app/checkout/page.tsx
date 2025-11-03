'use client';

import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function CheckoutPage() {
    const items = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);

    const totalPrice = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        zip: '',
    });

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    const db = getFirestore(app);

    // Cargar datos del usuario si está logueado
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            setFormData((prev) => ({ ...prev, email: user.email || '' }));

            const userDoc = doc(db, 'users', user.uid);
            getDoc(userDoc)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData((prev) => ({
                            ...prev,
                            name: data.name || '',
                            address: data.address || '',
                            city: data.city || '',
                            zip: data.zip || '',
                        }));
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const formatCLP = (price: number) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price);

    const handlePayment = async () => {
        // Validar que el carrito no esté vacío y que el formulario esté completo
        if (items.length === 0) return;
        const isFormValid = formData.name && formData.email && formData.address && formData.city && formData.zip;
        if (!isFormValid) {
            alert('Por favor completa todos los campos.');
            return;
        }

        setProcessing(true);

        try {
            // Generar un ID único para la orden
            const commerceOrder = `ORD-${Date.now()}`;

            // Llamar a tu backend en Render
            const resp = await fetch('https://backendsukistore-f0u2ierw.b4a.run/flow/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commerceOrder,
                    subject: 'Compra en Sukistore',
                    amount: totalPrice,
                    email: formData.email,
                    urlReturn: `${window.location.origin}/checkout?success=true`,
                    urlConfirmation: `${window.location.origin}/api/flow/confirm`,
                    optional: { name: formData.name, address: formData.address, city: formData.city, zip: formData.zip, items },
                }),
            });

            const data = await resp.json();

            if (data.url && data.flowOrder) {
                // Redirigir a Flow
                window.location.href = data.url; // ya incluye el token
            } else {
                console.error('No se obtuvo la URL de checkout', data);
                setProcessing(false);
            }
        } catch (err) {
            console.error(err);
            setProcessing(false);
        }
    };



    // Detectar retorno de Flow
    useEffect(() => {
        const url = new URL(window.location.href);
        const successParam = url.searchParams.get('success');
        if (successParam === 'true') {
            clearCart();
            setSuccess(true);
        }
    }, []);

    if (loading) return <p className="text-white text-center mt-10">Cargando datos...</p>;

    if (success)
        return (
            <main className="min-h-screen flex flex-col items-center justify-center text-white px-4 sm:px-6 py-10">
                <h1 className="text-4xl font-bold mb-4">¡Compra exitosa!</h1>
                <p className="text-gray-300 mb-6">Revisa tu correo, allí encontrarás tus keys o credenciales.</p>
                <Link href="/store" className="bg-purple-600 px-6 py-3 rounded-2xl shadow-lg hover:bg-purple-700 transition">
                    Volver a la tienda
                </Link>
            </main>
        );

    return (
        <main className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-white px-4 sm:px-6 py-10 flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Carrito */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900 rounded-2xl p-6">
                    <h2 className="text-2xl font-semibold mb-4">Tu carrito</h2>
                    {items.length === 0 ? (
                        <p className="text-gray-400">
                            Tu carrito está vacío.{' '}
                            <Link href="/store" className="text-purple-500 underline">
                                Ir a la tienda
                            </Link>
                        </p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-gray-400 text-sm">Cantidad: {item.quantity || 1}</p>
                                </div>
                                <p className="font-semibold">{formatCLP(item.price * (item.quantity || 1))}</p>
                            </div>
                        ))
                    )}
                    {items.length > 0 && (
                        <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCLP(totalPrice)}</span>
                        </div>
                    )}
                </motion.div>

                {/* Formulario */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold mb-4">Detalles de envío</h2>
                    <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} className="bg-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} className="bg-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    <input type="text" name="address" placeholder="Dirección" value={formData.address} onChange={handleChange} className="bg-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    <input type="text" name="city" placeholder="Ciudad" value={formData.city} onChange={handleChange} className="bg-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    <input type="text" name="zip" placeholder="Código postal" value={formData.zip} onChange={handleChange} className="bg-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />

                    <button onClick={handlePayment} disabled={processing} className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-3 font-semibold mt-4 transition shadow-lg hover:shadow-purple-500/30">
                        {processing ? 'Procesando...' : `Pagar ${formatCLP(totalPrice)}`}
                    </button>
                </motion.div>
            </div>
        </main>
    );
}
