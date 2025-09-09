import React from 'react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { GameTitle } from '../../../types';

interface ProductFiltersProps {
  filters: { search: string; gameTitleId: string; status: string };
  onFilterChange: (name: string, value: string) => void;
  gameTitles: GameTitle[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFilterChange, gameTitles }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Filter by name..."
        value={filters.search}
        onChange={(e) => onFilterChange('search', e.target.value)}
      />
      <Select value={filters.gameTitleId} onValueChange={(value) => onFilterChange('gameTitleId', value)}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by game" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Games</SelectItem>
          {gameTitles.map((game) => (
            <SelectItem key={game.id} value={game.id}>
              {game.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
