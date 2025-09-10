import { useState, useEffect } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  totalItems?: number;
}

export function usePagination({ 
  initialPage = 1, 
  initialItemsPerPage = 20, 
  totalItems = 0 
}: UsePaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    setCurrentPage: goToPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    resetToFirstPage,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, totalItems)};
}

interface UseFiltersOptions<T> {
  initialFilters: T;
  onFiltersChange?: (filters: T) => void;
}

export function useFilters<T extends Record<string, unknown>>({ 
  initialFilters, 
  onFiltersChange 
}: UseFiltersOptions<T>) {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const updateFilters = (newFilters: Partial<T>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange?.(updated);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    onFiltersChange?.(initialFilters);
  };

  const clearFilter = <K extends keyof T>(key: K) => {
    const defaultValue = initialFilters[key];
    updateFilter(key, defaultValue);
  };

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter};
}

interface UseDebounceOptions {
  delay?: number;
}

export function useDebounce<T>(value: T, { delay = 300 }: UseDebounceOptions = {}): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
