import { db } from './firebase';
import { collection, getDocs, doc, DocumentData, getDoc } from 'firebase/firestore';

/**
 * Estructura principal de un producto (juego o cuenta)
 */
export interface GameKey {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string;
    description: string;
    categories?: string[];
    top: boolean;
    type?: 'key' | 'account';
    discountPercentage?: number;
    offerEndsAt?: string;
    email?: string;
    password?: string;
    region?: string;
    discountPrice?: number;
    offerActive?: boolean;
    offerStart?: any;
    offerEnd?: any;
}


/**
 * Formatea precios CLP
 */
export const formatCLP = (price: number): string =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(price);

/**
 * Normaliza datos desde Firestore
 */
export function normalizeGameData(doc: DocumentData): GameKey {
    const data = doc.data();
    const discountPercentage = data.discountPercentage ?? null;
    const offerEnd = data.offerEnd ?? null;
    let offerActive = false;
    let discountPrice: number | undefined;

    if (discountPercentage && offerEnd) {
        const now = Date.now();
        const end = new Date(offerEnd).getTime();
        offerActive = end > now;
        discountPrice = offerActive ? Math.round(Number(data.price) * (1 - discountPercentage / 100)) : undefined;
    }

    return {
        id: doc.id,
        name: data.name ?? 'Sin nombre',
        price: Number(data.price) || 0,
        stock: Number(data.stock) || 0,
        imageUrl: data.imageUrl ?? '/placeholder.png',
        description: data.description ?? 'Sin descripción disponible.',
        categories: Array.isArray(data.categories) ? data.categories : [],
        top: Boolean(data.top),
        type: data.type ?? 'key',
        discountPercentage,
        offerEnd,
        discountPrice,
        offerActive,
        email: data.email ?? undefined,
        password: data.password ?? undefined,
        region: data.region ?? undefined,
    };
}

/** Obtiene todos los productos desde Firestore */
export async function getAllProducts(): Promise<GameKey[]> {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(normalizeGameData);
}

/**
 * Obtiene un producto por ID
 */
/** Obtiene un producto por ID */
export async function getGameById(id: string): Promise<GameKey | null> {
    const all = await getAllProducts();
    return all.find((g) => g.id === id) ?? null;
}
/**
 * Obtiene todos los IDs de productos
 */
export async function getAllGameIds(): Promise<string[]> {
    const allProducts = await getAllProducts();
    return allProducts.map((p) => p.id);
}

/**
 * Obtiene todas las keys de un producto específico
 * La subcolección es: /products/{productId}/keys
 */
export async function getKeysByProductId(productId: string): Promise<{ key: string; createdAt?: string }[]> {
    const keysCol = collection(db, 'products', productId, 'keys');
    const querySnapshot = await getDocs(keysCol);
    return querySnapshot.docs.map((doc) => ({
        key: doc.data().key,
        createdAt: doc.data().createdAt ?? null,
    }));
}
