// src/app/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import { getGameById, getAllGameIds, GameKey, formatCLP } from '@/lib/games';

export const revalidate = 60; // ISR

type Props = {
    params: Promise<{ id: string }>;
};

// Generar parámetros estáticos
export async function generateStaticParams() {
    const ids = await getAllGameIds();
    return ids.map((id) => ({ id }));
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params; // <-- resolver la promesa
    const game = await getGameById(id);

    if (!game) notFound();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10 animate-fadeIn">

            {/* Imagen */}
            <div className="lg:w-1/2 w-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-900 relative">
                {game.discountPercentage && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg z-10">
                        -{game.discountPercentage}%
                    </span>
                )}
                <Image
                    src={game.imageUrl}
                    alt={game.name}
                    width={800}
                    height={500}
                    loading="lazy"
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
            </div>

            {/* Detalles */}
            <div className="lg:w-1/2 w-full flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {game.name}
                    </h1>
                    <p className="text-2xl sm:text-3xl text-red-500 font-semibold mt-2">
                        {game.discountPrice ? formatCLP(game.discountPrice) : formatCLP(game.price)}
                    </p>
                </div>

                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                    {game.description}
                </p>

                <div className="text-sm text-gray-400 space-y-1">
                    <p>
                        <span className="font-medium text-gray-300">Categorías:</span>{' '}
                        <span className="text-white">{(game.categories || []).join(', ') || 'Sin categoría'}</span>
                    </p>
                    <p>
                        <span className="font-medium text-gray-300">Stock:</span>{' '}
                        <span className={`font-medium ${game.stock > 0 ? 'text-green-400' : 'text-red-500'}`}>
                            {game.stock > 0 ? `${game.stock} disponibles` : 'Agotado'}
                        </span>
                    </p>
                    {game.offerEndsAt && (
                        <p>
                            <span className="font-medium text-gray-300">Oferta válida hasta:</span>{' '}
                            <span className="text-yellow-400">{new Date(game.offerEndsAt).toLocaleDateString()}</span>
                        </p>
                    )}
                </div>

                <div className="mt-4">
                    <AddToCartButton game={game} />
                </div>
            </div>
        </div>
    );
}
