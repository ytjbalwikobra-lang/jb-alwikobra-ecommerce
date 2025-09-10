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
  if (games.length === 0) return null;

  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="game-populer" className="text-2xl sm:text-3xl font-bold text-white mb-3">Game Populer</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Pilih dari berbagai game populer yang tersedia di platform kami.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/products?game=${encodeURIComponent(game.name)}`}
              className="bg-gray-900 border border-pink-500/30 p-4 rounded-xl hover:border-pink-500/60 hover:shadow-[0_0_20px_0px_rgba(236,72,153,0.2)] transition-all duration-300 text-center group transform hover:-translate-y-1"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-lg">
                {game.logoUrl ? (
                  <img 
                    src={game.logoUrl} 
                    alt={`${game.name} logo`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <TrendingUp className="text-white" size={32} />
                )}
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-pink-400 transition-colors text-sm sm:text-base truncate" title={game.name}>
                {game.name}
              </h3>
              <p className="text-xs text-gray-500">{game.count} akun</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
