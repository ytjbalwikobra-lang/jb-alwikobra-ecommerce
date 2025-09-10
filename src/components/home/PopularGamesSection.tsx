import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface PopularGame {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  count: number;
}

interface PopularGamesSectionProps {
  games: PopularGame[];
  className?: string;
}

export const PopularGamesSection: React.FC<PopularGamesSectionProps> = ({ 
  games, 
  className = '' 
}) => {
  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="game-populer" className="text-3xl font-bold text-white mb-4">Game Populer</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Pilih dari berbagai game populer yang tersedia di platform kami
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/products?game=${encodeURIComponent(game.name)}`}
              className="bg-black border border-pink-500/40 p-6 rounded-xl hover:shadow-[0_0_25px_4px_rgba(236,72,153,0.15)] transition-all duration-200 text-center group"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {game.logoUrl ? (
                  <img 
                    src={game.logoUrl} 
                    alt={game.name}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />
                ) : (
                  <TrendingUp className="text-white" size={32} />
                )}
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-pink-400 transition-colors text-base">
                {game.name}
              </h3>
              <p className="text-sm text-gray-400">{game.count} akun</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
