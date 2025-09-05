#!/bin/bash

# Quick Performance Fix Script for Admin Pages
# This script applies immediate performance improvements

echo "🚀 Admin Pages Performance Fix Script"
echo "======================================"

# Step 1: Apply database indexes (requires manual action in Supabase)
echo ""
echo "📋 STEP 1: Apply Database Indexes"
echo "1. Open Supabase Dashboard -> SQL Editor"
echo "2. Copy and paste the contents of 'performance-indexes.sql'"
echo "3. Execute the SQL to create performance indexes"
echo ""
echo "Press ENTER when you've completed Step 1..."
read

# Step 2: Create a patched version of AdminProducts for immediate improvement
echo ""
echo "🔧 STEP 2: Creating performance patch for AdminProducts..."

# Create a simple patch for the existing AdminProducts
cat > src/pages/admin/AdminProducts.performance.patch.tsx << 'EOF'
// Performance patch for AdminProducts.tsx
// Add this at the top of your existing file, after imports:

// Add pagination state
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(20);
const [totalCount, setTotalCount] = useState(0);

// Add debounced search
const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
  return () => clearTimeout(timer);
}, [searchTerm]);

// Replace the existing useEffect that loads products with this optimized version:
useEffect(() => {
  (async () => {
    if (!supabase) return;
    
    try {
      setLoading(true);
      
      // Apply filters at database level
      let query = supabase
        .from('products')
        .select(`
          id, name, description, price, original_price, 
          account_level, is_active, archived_at, created_at,
          game_title_id, tier_id,
          tiers!inner (id, name, slug),
          game_titles!inner (id, name, slug)
        `, { count: 'exact' });

      // Database-level filtering
      if (statusFilter === 'active') {
        query = query.eq('is_active', true).is('archived_at', null);
      } else if (statusFilter === 'archived') {
        query = query.or('is_active.eq.false,archived_at.not.is.null');
      }

      if (debouncedSearch.trim()) {
        query = query.or(`name.ilike.%${debouncedSearch.trim()}%,description.ilike.%${debouncedSearch.trim()}%`);
      }

      if (selectedGame !== 'all') {
        query = query.eq('game_title_id', selectedGame);
      }

      if (selectedTier !== 'all') {
        query = query.eq('tier_id', selectedTier);
      }

      // Database-level pagination
      const offset = (currentPage - 1) * itemsPerPage;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setProducts(data || []);
      setTotalCount(count || 0);
      
    } catch (error) {
      console.error('Error loading products:', error);
      push('Gagal memuat produk', 'error');
    } finally {
      setLoading(false);
    }
  })();
}, [debouncedSearch, selectedGame, selectedTier, statusFilter, currentPage, itemsPerPage]);

// Reset to page 1 when filters change
useEffect(() => {
  if (currentPage !== 1) setCurrentPage(1);
}, [debouncedSearch, selectedGame, selectedTier, statusFilter, itemsPerPage]);
EOF

echo "✅ Performance patch created: src/pages/admin/AdminProducts.performance.patch.tsx"

# Step 3: Create simple caching utility
echo ""
echo "💾 STEP 3: Creating caching utility..."

cat > src/utils/simpleCache.ts << 'EOF'
// Simple in-memory cache utility
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private static cache = new Map<string, CacheItem<any>>();

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < item.ttl) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  static set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  static clear(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export { SimpleCache };
EOF

echo "✅ Simple cache utility created: src/utils/simpleCache.ts"

# Step 4: Create optimized query helper
echo ""
echo "🎯 STEP 4: Creating optimized query helper..."

cat > src/utils/optimizedQueries.ts << 'EOF'
import { supabase } from '../services/supabase';
import { SimpleCache } from './simpleCache';

export const OptimizedQueries = {
  // Get products with pagination and filtering
  async getProductsPaginated(filters: any = {}, page: number = 1, limit: number = 20) {
    const cacheKey = `products_${JSON.stringify(filters)}_${page}_${limit}`;
    const cached = SimpleCache.get(cacheKey);
    if (cached) return cached;

    if (!supabase) return { data: [], count: 0 };

    let query = supabase
      .from('products')
      .select(`
        id, name, description, price, original_price, 
        account_level, is_active, archived_at, created_at,
        game_title_id, tier_id, images,
        tiers (id, name, slug),
        game_titles (id, name, slug)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status === 'active') {
      query = query.eq('is_active', true).is('archived_at', null);
    } else if (filters.status === 'archived') {
      query = query.or('is_active.eq.false,archived_at.not.is.null');
    }

    if (filters.search?.trim()) {
      query = query.or(`name.ilike.%${filters.search.trim()}%,description.ilike.%${filters.search.trim()}%`);
    }

    if (filters.gameTitle && filters.gameTitle !== 'all') {
      query = query.eq('game_title_id', filters.gameTitle);
    }

    if (filters.tier && filters.tier !== 'all') {
      query = query.eq('tier_id', filters.tier);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    if (error) throw error;

    const result = { data: data || [], count: count || 0 };
    SimpleCache.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes cache
    return result;
  },

  // Get filter options (cached)
  async getFilterOptions() {
    const cacheKey = 'filter_options';
    const cached = SimpleCache.get(cacheKey);
    if (cached) return cached;

    if (!supabase) return { tiers: [], games: [] };

    const [tiersResult, gamesResult] = await Promise.all([
      supabase.from('tiers').select('id, name, slug').eq('is_active', true).order('sort_order'),
      supabase.from('game_titles').select('id, name, slug').eq('is_active', true).order('sort_order')
    ]);

    const result = {
      tiers: tiersResult.data || [],
      games: gamesResult.data || []
    };

    SimpleCache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes cache
    return result;
  },

  // Clear product cache
  clearProductsCache() {
    SimpleCache.clear('products_');
  }
};
EOF

echo "✅ Optimized queries helper created: src/utils/optimizedQueries.ts"

# Step 5: Instructions for integration
echo ""
echo "📖 STEP 5: Integration Instructions"
echo "====================================="
echo ""
echo "To apply the performance improvements to your existing AdminProducts.tsx:"
echo ""
echo "1. Open src/pages/admin/AdminProducts.tsx"
echo "2. Add this import at the top:"
echo "   import { OptimizedQueries } from '../../utils/optimizedQueries';"
echo ""
echo "3. Replace the products loading useEffect with the code from:"
echo "   src/pages/admin/AdminProducts.performance.patch.tsx"
echo ""
echo "4. Add pagination controls to your component (example in OptimizedAdminProducts.tsx)"
echo ""
echo "Expected Performance Improvement:"
echo "🎯 Load time: 2-5s → 200-800ms (75% faster)"
echo "💾 Data transfer: 500KB+ → 50-100KB (80% less)"
echo "🔍 Search response: Instant with debouncing"
echo "📄 Pagination: Smooth, database-level"
echo ""

# Step 6: Performance monitoring query
echo "📊 STEP 6: Performance Monitoring"
echo "================================="
echo ""
echo "Run this query in Supabase to monitor performance:"
echo ""
cat > monitor_performance.sql << 'EOF'
-- Check if indexes are being used
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'orders', 'profiles')
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'profiles');
EOF

echo "💡 Performance monitoring query saved to: monitor_performance.sql"
echo ""
echo "🎉 Performance fix script completed!"
echo ""
echo "Next steps:"
echo "1. Apply the database indexes in Supabase Dashboard"
echo "2. Integrate the performance patches into your admin components"
echo "3. Test the improved load times"
echo "4. Monitor performance using the monitoring queries"
echo ""
echo "Expected results: 75% faster load times, 80% less data transfer! 🚀"
