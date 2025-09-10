import React from 'react';

interface PopularGame {
  name: string;
  count: string;
  icon: React.ComponentType<any>;
  color?: string;
  logoUrl?: string;
}

interface PopularGamesProps {
  games: PopularGame[];
  loading: boolean;
}

const PopularGames: React.FC<PopularGamesProps> = ({ games, loading }) => {
  if (loading) {
    return (
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Game Populer untuk Dijual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-6 text-center animate-pulse">
                <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-black/60 border-t border-pink-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Game Populer untuk Dijual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => {
            const IconComponent = game.icon;
            return (
              <div 
                key={index} 
                className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-6 text-center hover:bg-pink-900/30 transition-colors"
              >
                {game.logoUrl ? (
                  <img 
                    src={game.logoUrl} 
                    alt={game.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: game.color + '20' }}
                  >
                    <IconComponent size={32} style={{ color: game.color }} />
                  </div>
                )}
                <h3 className="font-semibold text-white mb-2">{game.name}</h3>
                <p className="text-pink-200 text-sm">{game.count} akun terjual</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularGames;
