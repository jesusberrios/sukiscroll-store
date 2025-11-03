import Link from 'next/link';
import { Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import AddToCartButton from './AddToCartButton';
import { GameKey } from '@/lib/games';

interface GameCardProps {
    game: GameKey;
}

export default function GameCard({ game }: GameCardProps) {
    const { id, name, price, stock, imageUrl, categories = [], type } = game;

    const now = new Date();
    const offerStartDate = game.offerStart ? new Date(game.offerStart) : undefined;
    const offerEndDate = game.offerEnd ? new Date(game.offerEnd) : undefined;

    const isOfferDateValid =
        (!offerStartDate || now >= offerStartDate) &&
        (!offerEndDate || now <= offerEndDate);

    const discountPriceNum = game.discountPrice !== undefined ? Number(game.discountPrice) : undefined;

    const isDiscounted =
        game.offerActive === true &&
        isOfferDateValid &&
        discountPriceNum !== undefined &&
        !isNaN(discountPriceNum) &&
        discountPriceNum < price;

    const formatPrice = (p: number) => `$${p.toLocaleString('es-CL')}`;

    return (
        <motion.div
            className="w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-purple-500/30 flex flex-col min-h-[28rem]"
            whileHover={{ y: -5 }}
        >
            <Link href={`/product/${id}`} className="block relative">
                <div className="w-full h-40 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover transition-opacity duration-500 hover:opacity-90"
                    />
                </div>

                {isDiscounted && (
                    <div className="absolute top-2 left-2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 animate-pulse z-10">
                        <Tag size={14} />
                        ¡OFERTA!
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3rem]">
                    {name}
                </h3>

                <div className="flex flex-wrap gap-1 mb-3">
                    {categories.slice(0, 2).map((cat) => (
                        <span
                            key={cat}
                            className="text-xs bg-purple-600/50 px-2 py-0.5 rounded-full text-gray-200"
                        >
                            {cat}
                        </span>
                    ))}
                </div>

                <div className="flex flex-col mt-auto">
                    <div className="flex items-end justify-between pt-3 border-t border-gray-700/50">
                        <div className="flex flex-col">
                            {isDiscounted && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(price)}
                                </span>
                            )}
                            <span
                                className={`text-2xl font-extrabold ${isDiscounted ? 'text-green-400' : 'text-white'
                                    }`}
                            >
                                {formatPrice(isDiscounted ? discountPriceNum! : price)}
                            </span>
                        </div>

                        {/* Botón de carrito */}
                        <AddToCartButton game={game} />
                    </div>

                    <div className="mt-2 text-xs text-gray-400">
                        {stock > 0 ? `Stock: ${stock}` : 'Agotado'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
