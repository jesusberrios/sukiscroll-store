// firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// UIDs de admins
export const ADMIN_UIDS = [
    '9W8ioYOyIrM9TChC1q7mnw63vEf2', // tu UID
    // 'otro-uid-admin',
];

export function isAdmin(user: User | null) {
    return user && ADMIN_UIDS.includes(user.uid);
}

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBq7k6NAbCPRIuQ1hzm7o3VghKleXuw4j0",
    authDomain: "suki-s-scroll.firebaseapp.com",
    projectId: "suki-s-scroll",
    storageBucket: "suki-s-scroll.firebasestorage.app",
    messagingSenderId: "620288223537",
    appId: "1:620288223537:web:61b7994f6da4dea3b7a810",
    measurementId: "G-KM2Z31CYMH"
};

// Inicializar app
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportar Auth y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
