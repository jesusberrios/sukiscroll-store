import Link from 'next/link';
import { Facebook, Twitter, Instagram, DiscIcon } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 pt-12 pb-6 border-t border-gray-800 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">

                {/* Info / Branding */}
                <div className="text-center sm:text-left">
                    <h2 className="text-white font-bold text-xl mb-2">SukiScroll Store</h2>
                    <p className="text-gray-400 text-sm">
                        Claves digitales seguras y entrega inmediata ⚡
                    </p>
                    <p className="mt-2 text-sm">Hecho con 💜 por gamers, para gamers.</p>
                </div>

                {/* Enlaces */}
                <div className="text-center sm:text-left">
                    <h3 className="text-white font-semibold mb-2">Enlaces</h3>
                    <ul className="space-y-1">
                        <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
                        <li><Link href="/store" className="hover:text-white transition">Tienda</Link></li>
                        <li><Link href="/about" className="hover:text-white transition">Nosotros</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition">Contacto</Link></li>
                    </ul>
                </div>

                {/* Redes sociales */}
                <div className="text-center sm:text-left">
                    <h3 className="text-white font-semibold mb-2">Síguenos</h3>
                    <div className="flex justify-center sm:justify-start gap-4 mt-1">
                        <Link href="https://facebook.com" target="_blank" className="hover:text-white transition">
                            <Facebook className="w-5 h-5" />
                        </Link>
                        <Link href="https://twitter.com" target="_blank" className="hover:text-white transition">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="https://instagram.com" target="_blank" className="hover:text-white transition">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <Link href="https://discord.com" target="_blank" className="hover:text-white transition">
                            <DiscIcon className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

            </div>

            {/* Derechos de autor */}
            <div className="mt-8 text-center text-gray-500 text-xs sm:text-sm">
                © {new Date().getFullYear()} SukiScroll Store. Todos los derechos reservados.
            </div>
        </footer>
    );
}
