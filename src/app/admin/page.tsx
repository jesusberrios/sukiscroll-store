'use client';

import AdminProtected from '@/components/AdminProtected';
import { useEffect, useMemo, useState } from 'react';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

type Product = {
    id?: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categories?: string[];
    stock?: number;
    type?: 'key' | 'account';
    top?: boolean;

    // oferta
    offerActive?: boolean;
    discountPrice?: number;
    offerStart?: string;
    offerEnd?: string;

    // accounts
    email?: string;
    password?: string;
    region?: string;
};

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Product | null>(null);

    const [newProduct, setNewProduct] = useState<Product>({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        categories: [],
        type: 'key',
        top: false
    });

    const [newKey, setNewKey] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);

    // Fetch products y sincronizar stock de keys
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'products'));
            const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Product) })) as Product[];

            const withStock = await Promise.all(
                list.map(async (p) => {
                    if (p.type === 'key' && p.id) {
                        try {
                            const keysSnap = await getDocs(collection(db, `products/${p.id}/keys`));
                            const count = keysSnap.size;
                            if (p.stock !== count) {
                                await updateDoc(doc(db, 'products', p.id), { stock: count }).catch(() => { });
                            }
                            return { ...p, stock: count };
                        } catch {
                            return { ...p, stock: p.stock ?? 0 };
                        }
                    }
                    return p;
                })
            );

            setProducts(withStock);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Categorías derivadas
    const allCategories = useMemo(() => {
        const set = new Set<string>();
        products.forEach((p) => (p.categories || []).forEach((c) => set.add(c)));
        return Array.from(set).sort();
    }, [products]);

    // Añadir categoría
    const addCategoryToNew = (cat: string) => {
        if (!cat) return;
        const cats = newProduct.categories || [];
        if (!cats.includes(cat)) {
            setNewProduct({ ...newProduct, categories: [...cats, cat] });
        }
        setCategoryInput('');
    };
    const removeCategoryFromNew = (cat: string) => {
        setNewProduct({ ...newProduct, categories: (newProduct.categories || []).filter((c) => c !== cat) });
    };

    // Crear producto
    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.imageUrl) {
            alert('Completa todos los campos obligatorios');
            return;
        }

        const created = await addDoc(collection(db, 'products'), {
            ...newProduct,
            categories: newProduct.categories || [],
            stock: newProduct.type === 'key' ? (newKey ? 1 : 0) : 1,
            createdAt: new Date().toISOString()
        });

        // Key
        if (newProduct.type === 'key' && newKey) {
            await addDoc(collection(db, `products/${created.id}/keys`), {
                key: newKey,
                used: false,
                createdAt: new Date().toISOString()
            });
        }

        // Account
        if (newProduct.type === 'account' && newProduct.email && newProduct.password) {
            await addDoc(collection(db, `products/${created.id}/accounts`), {
                email: newProduct.email,
                password: newProduct.password,
                region: newProduct.region || 'GLOBAL',
                used: false,
                createdAt: new Date().toISOString()
            });
        }

        setNewProduct({ name: '', description: '', price: 0, imageUrl: '', categories: [], type: 'key', top: false });
        setNewKey('');
        fetchProducts();
    };

    const handleAddKeyToProduct = async (productId?: string) => {
        if (!productId) return;
        const key = prompt('Ingresa la nueva key (formato: XXXX-XXXX-XXXX):');
        if (!key) return;
        await addDoc(collection(db, `products/${productId}/keys`), { key, used: false, createdAt: new Date().toISOString() });
        const p = products.find((x) => x.id === productId);
        await updateDoc(doc(db, 'products', productId), { stock: (p?.stock || 0) + 1 }).catch(() => { });
        fetchProducts();
    };

    const handleDeleteProduct = async (productId?: string) => {
        if (!productId) return;
        if (!confirm('Eliminar producto y todas sus keys/cuentas?')) return;
        await deleteDoc(doc(db, 'products', productId));
        fetchProducts();
    };

    const handleToggleTop = async (p: Product) => {
        if (!p.id) return;
        await updateDoc(doc(db, 'products', p.id), { top: !p.top });
        fetchProducts();
    };

    const handleSaveEdit = async () => {
        if (!editing || !editing.id) return;
        const { id, ...rest } = editing;
        await updateDoc(doc(db, 'products', id), { ...rest, categories: editing.categories || [] } as any);
        setEditing(null);
        fetchProducts();
    };

    // Filtrado
    const filtered = products.filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory && !(p.categories || []).includes(filterCategory)) return false;
        return true;
    });

    return (
        <AdminProtected>
            <div className="min-h-screen bg-linear-to-b from-gray-950 to-gray-900 text-white p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-3xl font-semibold">Panel Admin — Productos</h1>

                        <div className="flex gap-3 items-center">
                            <input
                                placeholder="Buscar por nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                            />
                            <select
                                value={filterCategory ?? ''}
                                onChange={(e) => setFilterCategory(e.target.value || null)}
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                            >
                                <option value="">Todas las categorías</option>
                                {allCategories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <button
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => { setSearch(''); setFilterCategory(null); }}
                            >
                                Reset
                            </button>
                        </div>
                    </header>

                    {/* Form nuevo producto */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nombre del producto" className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                <input value={newProduct.price} type="number" onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} placeholder="Precio (CLP)" className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                <input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} placeholder="URL imagen" className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 col-span-1 sm:col-span-2" />
                                <select value={newProduct.type} onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as any })} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">
                                    <option value="key">Key</option>
                                    <option value="account">Cuenta</option>
                                </select>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={!!newProduct.top} onChange={(e) => setNewProduct({ ...newProduct, top: e.target.checked })} />
                                    Destacado
                                </label>
                            </div>

                            <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Descripción breve" className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />

                            {/* Categorías */}
                            <div>
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {(newProduct.categories || []).map((c) => (
                                        <span key={c} className="px-3 py-1 rounded-full bg-indigo-700/60 text-sm cursor-pointer flex items-center gap-2" onClick={() => removeCategoryFromNew(c)} title="Click para eliminar">{c} <strong className="ml-1">✕</strong></span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="Añadir categoría y Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategoryToNew(categoryInput.trim()); } }} className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                    <button onClick={() => addCategoryToNew(categoryInput.trim())} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition">Añadir</button>
                                </div>
                            </div>

                            {/* Conditional fields */}
                            {newProduct.type === 'key' && (
                                <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Primera key (opcional)" className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                            )}
                            {newProduct.type === 'account' && (
                                <div className="grid gap-2">
                                    <input value={newProduct.email || ''} onChange={(e) => setNewProduct({ ...newProduct, email: e.target.value })} placeholder="Email" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                    <input value={newProduct.password || ''} onChange={(e) => setNewProduct({ ...newProduct, password: e.target.value })} placeholder="Contraseña" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                    <input value={newProduct.region || ''} onChange={(e) => setNewProduct({ ...newProduct, region: e.target.value })} placeholder="Región" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                </div>
                            )}

                            {/* Descuentos */}
                            <div className="grid gap-2 mt-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={!!newProduct.offerActive} onChange={(e) => setNewProduct({ ...newProduct, offerActive: e.target.checked })} />
                                    Oferta activa
                                </label>
                                {newProduct.offerActive && (
                                    <>
                                        <input type="number" value={newProduct.discountPrice || ''} onChange={(e) => setNewProduct({ ...newProduct, discountPrice: Number(e.target.value) })} placeholder="Precio descuento" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                        <input type="datetime-local" value={newProduct.offerStart || ''} onChange={(e) => setNewProduct({ ...newProduct, offerStart: e.target.value })} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                        <input type="datetime-local" value={newProduct.offerEnd || ''} onChange={(e) => setNewProduct({ ...newProduct, offerEnd: e.target.value })} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleAddProduct} className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700">Crear producto</button>
                            <button onClick={() => { setNewProduct({ name: '', description: '', price: 0, imageUrl: '', categories: [], type: 'key', top: false }); setNewKey(''); }} className="w-full px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">Limpiar</button>
                        </div>
                    </motion.div>

                    {/* Lista */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Productos ({filtered.length})</h2>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filtered.map((p) => {
                                    const now = new Date().toISOString();
                                    const isOnOffer = p.offerActive && p.discountPrice && p.offerStart && p.offerEnd &&
                                        now >= p.offerStart && now <= p.offerEnd;
                                    const finalPrice = isOnOffer ? p.discountPrice : p.price;

                                    return (
                                        <motion.div key={p.id} layout whileHover={{ scale: 1.02 }} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                                            <div className="h-44 bg-black/30 overflow-hidden">
                                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                                    <h3 className="font-semibold">{p.name}</h3>
                                                    <div className="text-sm text-gray-300">
                                                        {isOnOffer ? (
                                                            <span className="flex flex-col sm:flex-row gap-1">
                                                                <span className="line-through text-gray-500">${p.price}</span>
                                                                <span className="text-emerald-400 font-semibold">${p.discountPrice}</span>
                                                            </span>
                                                        ) : (
                                                            <span>${p.price}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-gray-400 text-sm mt-2 line-clamp-3 flex-1">{p.description}</p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(p.categories || []).map((c) => (
                                                        <span key={c} className="text-xs bg-indigo-700/30 px-2 py-1 rounded-full">{c}</span>
                                                    ))}
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <div className="flex-1 text-sm text-gray-300">
                                                        {p.type === 'key' ? <><strong>{p.stock ?? 0}</strong> keys</> :
                                                            <><span>{p.email}</span> | <span>{p.region || 'GLOBAL'}</span></>}
                                                    </div>

                                                    {p.type === 'key' && <button onClick={() => handleAddKeyToProduct(p.id)} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm shrink-0">+Key</button>}
                                                    <button onClick={() => { setEditing(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm shrink-0">Editar</button>
                                                    <button onClick={() => handleToggleTop(p)} className={`px-3 py-1 rounded-lg text-sm shrink-0 ${p.top ? 'bg-yellow-400 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>{p.top ? 'Destacado' : 'Destacar'}</button>
                                                    <button onClick={() => p.id && handleDeleteProduct(p.id)} className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-sm shrink-0">Eliminar</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

            </div>

            {/* Modal de edición */}
            <AnimatePresence>
                {editing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setEditing(null)} />
                        <motion.div initial={{ y: 10 }} animate={{ y: 0 }} exit={{ y: 10 }} className="relative bg-gray-900 rounded-2xl p-6 w-full max-w-xl z-70">
                            <h3 className="text-xl font-semibold mb-3">Editar producto</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="px-3 py-2 rounded bg-gray-800" />
                                <input value={editing.price} type="number" onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="px-3 py-2 rounded bg-gray-800" />
                                <input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className="px-3 py-2 rounded bg-gray-800" />
                                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="px-3 py-2 rounded bg-gray-800" />

                                {/* Accounts edit */}
                                {editing.type === 'account' && (
                                    <div className="grid gap-2">
                                        <input value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="Email" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                        <input value={editing.password || ''} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder="Contraseña" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                        <input value={editing.region || ''} onChange={(e) => setEditing({ ...editing, region: e.target.value })} placeholder="Región" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                    </div>
                                )}

                                {/* Descuento */}
                                <div className="grid gap-2 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={!!editing.offerActive} onChange={(e) => setEditing({ ...editing, offerActive: e.target.checked })} />
                                        Oferta activa
                                    </label>
                                    {editing.offerActive && (
                                        <>
                                            <input type="number" value={editing.discountPrice || ''} onChange={(e) => setEditing({ ...editing, discountPrice: Number(e.target.value) })} placeholder="Precio descuento" className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                            <input type="datetime-local" value={editing.offerStart || ''} onChange={(e) => setEditing({ ...editing, offerStart: e.target.value })} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                            <input type="datetime-local" value={editing.offerEnd || ''} onChange={(e) => setEditing({ ...editing, offerEnd: e.target.value })} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700" />
                                        </>
                                    )}
                                </div>

                                {/* Categorías */}
                                <div className="flex gap-2">
                                    <input placeholder="Nueva categoría" className="px-3 py-2 rounded bg-gray-800 flex-1" onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const cat = (e.target as HTMLInputElement).value.trim();
                                            if (cat && editing) {
                                                const cats = editing.categories || [];
                                                if (!cats.includes(cat)) setEditing({ ...editing, categories: [...cats, cat] });
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }} />
                                    <div className="flex gap-2 flex-wrap">
                                        {(editing.categories || []).map((c) => (
                                            <button key={c} className="px-2 py-1 bg-indigo-700 rounded text-xs" onClick={() => setEditing({ ...editing, categories: (editing.categories || []).filter(x => x !== c) })}>{c} ✕</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-indigo-600 rounded">Guardar</button>
                                    <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-700 rounded">Cancelar</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminProtected>
    );
}
