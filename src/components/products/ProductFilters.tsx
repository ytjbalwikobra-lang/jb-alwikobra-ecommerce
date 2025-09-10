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
    <div className="bg-gray-900/80 border border-pink-500/30 rounded-xl p-4 sm:p-6 mb-8 backdrop-blur-sm">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari produk, game, atau tier..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-pink-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onShowFiltersChange(!showFilters)}
            className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              showFilters 
                ? 'bg-pink-600 text-white hover:bg-pink-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={20} />
            <span className="hidden sm:inline">Filter</span>
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="bg-red-600/80 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center space-x-2 group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-pink-600/20 text-pink-300 border border-pink-500/30">
              Pencarian: &ldquo;{searchTerm}&rdquo;
            </span>
          )}
          {selectedGame && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30">
              Game: {selectedGame}
            </span>
          )}
          {selectedTier && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30">
              Tier: {selectedTier}
            </span>
          )}
          {sortBy !== 'newest' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-600/20 text-green-300 border border-green-500/30">
              Urutkan: {sortOptions.find(opt => opt.value === sortBy)?.label}
            </span>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-pink-500/20 animate-in slide-in-from-top-2 duration-300">
          {/* Game Filter */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Game</label>
            <select
              value={selectedGame}
              onChange={(e) => onSelectedGameChange(e.target.value)}
              className="w-full bg-gray-800 border border-pink-500/30 rounded-lg text-white p-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 hover:border-pink-500/50"
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
              className="w-full bg-gray-800 border border-pink-500/30 rounded-lg text-white p-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 hover:border-pink-500/50"
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
              className="w-full bg-gray-800 border border-pink-500/30 rounded-lg text-white p-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 hover:border-pink-500/50"
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
