import '@/app/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/Toasts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-linear-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-white flex flex-col min-h-screen">
        <Navbar />

        {/* Contenedor principal que ocupa todo el espacio disponible */}
        <main className="mt-15 flex-1 w-full">
          {children}
          <ToastContainer />
        </main>

        <Footer />
      </body>
    </html>
  );
}
