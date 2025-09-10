import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Tier, GameTitle } from '../../types';

interface SortOption {
  value: string;
  label: string;
}

interface ProductFiltersProps {
  searchTerm: string;
  selectedGame: string;
  selectedTier: string;
  sortBy: string;
  showFilters: boolean;
  tiers: Tier[];
  gameTitles: GameTitle[];
  sortOptions: SortOption[];
  onSearchTermChange: (term: string) => void;
  onSelectedGameChange: (game: string) => void;
  onSelectedTierChange: (tier: string) => void;
  onSortByChange: (sort: string) => void;
  onShowFiltersChange: (show: boolean) => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  selectedGame,
  selectedTier,
  sortBy,
  showFilters,
  tiers,
  gameTitles,
  sortOptions,
  onSearchTermChange,
  onSelectedGameChange,
  onSelectedTierChange,
  onSortByChange,
  onShowFiltersChange,
  onResetFilters
}) => {
  const hasActiveFilters = searchTerm || selectedGame || selectedTier || sortBy !== 'newest';

  return (
    <div className="bg-black border border-pink-500/40 rounded-xl p-6 mb-8">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-app-dark border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onShowFiltersChange(!showFilters)}
            className="bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
          >
            <SlidersHorizontal size={20} />
            <span>Filter</span>
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <X size={20} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-pink-500/20">
          {/* Game Filter */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Game</label>
            <select
              value={selectedGame}
              onChange={(e) => onSelectedGameChange(e.target.value)}
              className="w-full bg-app-dark border border-pink-500/30 rounded-lg text-white p-3 focus:outline-none focus:border-pink-500"
            >
              <option value="">Semua Game</option>
              {gameTitles.map((game) => (
                <option key={game.id} value={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => onSelectedTierChange(e.target.value)}
              className="w-full bg-app-dark border border-pink-500/30 rounded-lg text-white p-3 focus:outline-none focus:border-pink-500"
            >
              <option value="">Semua Tier</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.name}>
                  {tier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Urutkan</label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full bg-app-dark border border-pink-500/30 rounded-lg text-white p-3 focus:outline-none focus:border-pink-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
