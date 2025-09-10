import React from 'react';

interface WishlistStatsProps {
  stats: {
    totalItems: number;
    availableItems: number;
    totalValue: string;
  };
}

export const WishlistStats: React.FC<WishlistStatsProps> = ({ stats }) => {
  if (stats.totalItems === 0) return null;

  return (
    <div className="mt-6 bg-black/40 backdrop-blur rounded-xl p-4 border border-pink-500/30">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-pink-400">{stats.totalItems}</div>
          <div className="text-gray-400 text-sm">Total Item</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{stats.availableItems}</div>
          <div className="text-gray-400 text-sm">Tersedia</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-400">{stats.totalValue}</div>
          <div className="text-gray-400 text-sm">Total Nilai</div>
        </div>
      </div>
    </div>
  );
};
