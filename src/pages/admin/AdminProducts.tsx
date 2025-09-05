import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product, Tier, GameTitle, ProductTier } from '../../types/index.ts';
import { ProductService } from '../../services/productService.ts';
import { supabase } from '../../services/supabase.ts';
import ImageUploader from '../../components/ImageUploader.tsx';
import { uploadFiles } from '../../services/storageService.ts';
import { formatNumberID, parseNumberID } from '../../utils/helpers.ts';
import { useToast } from '../../components/Toast.tsx';
// Admin page cleaned: diagnostics imports removed

type FormState = {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category?: string;
  gameTitleId?: string;
  tierId?: string;
  accountLevel?: string;
  accountDetails?: string;
  images: string[];
  rentals: { id?: string; duration: string; price: number; description?: string }[];
};

const emptyForm: FormState = {
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  category: 'general',
  gameTitleId: '',
  tierId: '',
  accountLevel: '',
  accountDetails: '',
  images: [],
  rentals: [],
};

const AdminProducts: React.FC = () => {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [games, setGames] = useState<GameTitle[]>([]);
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, archived
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Increased default to 20
  const [totalProducts, setTotalProducts] = useState(0); // Track total for pagination
  const [debouncedSearch, setDebouncedSearch] = useState(''); // Debounced search

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Products are now filtered at database level, so this is simplified
  const filteredProducts = products; // Already filtered by database
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginatedProducts = filteredProducts; // Already paginated by database

  // Reset pagination when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, selectedGame, selectedTier, statusFilter, itemsPerPage]);

  // Optimized data loading with database-level filtering and pagination
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // Fallback to existing ProductService if no supabase
        ProductService.resetCapabilities();
        await ProductService.detectSchemaCapabilities();
        
        const [list, tList, gList] = await Promise.all([
          ProductService.getAllProducts({ includeArchived: true }),
          ProductService.getTiers(),
          ProductService.getGameTitles()
        ]);
        setProducts(list);
        setTiers(tList);
        setGames(gList);
        setTotalProducts(list.length);
        setLoading(false);
        return;
      }

      // OPTIMIZED: Build query with database-level filtering
      let query = supabase
        .from('products')
        .select(`
          id, name, description, price, original_price, account_level,
          is_active, archived_at, created_at, images, game_title_id, tier_id,
          tiers (id, name, slug, color, background_gradient),
          game_titles (id, name, slug, icon)
        `, { count: 'exact' });

      // Apply filters at DATABASE level (not client-side)
      if (statusFilter === 'active') {
        query = query.eq('is_active', true).is('archived_at', null);
      } else if (statusFilter === 'archived') {
        query = query.or('is_active.eq.false,archived_at.not.is.null');
      }

      if (debouncedSearch.trim()) {
        query = query.or(`name.ilike.%${debouncedSearch.trim()}%,description.ilike.%${debouncedSearch.trim()}%`);
      }

      if (selectedGame !== 'all' && selectedGame) {
        query = query.eq('game_title_id', selectedGame);
      }

      if (selectedTier !== 'all' && selectedTier) {
        query = query.eq('tier_id', selectedTier);
      }

      // CRITICAL: Database-level pagination (not client-side)
      const offset = (currentPage - 1) * itemsPerPage;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      const { data: productData, error: productError, count } = await query;

      if (productError) throw productError;

      // Load filter options separately (these can be cached)
      const [tList, gList] = await Promise.all([
        ProductService.getTiers(),
        ProductService.getGameTitles()
      ]);

      // Map data to existing format
      const mappedProducts: Product[] = (productData || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.original_price,
        image: product.images?.[0] || '',
        images: product.images || [],
        category: '', // Legacy field
        gameTitle: product.game_titles?.[0]?.name || '',
        tier: product.tiers?.[0]?.slug as ProductTier || 'reguler',
        tierId: product.tier_id,
        gameTitleId: product.game_title_id,
        tierData: product.tiers?.[0] as any,
        gameTitleData: product.game_titles?.[0] as any,
        accountLevel: product.account_level,
        isFlashSale: false, // Set default
        hasRental: false, // Set default
        stock: 1, // Set default
        isActive: product.is_active !== false,
        archivedAt: product.archived_at,
        createdAt: product.created_at,
        updatedAt: product.created_at, // Use created_at as fallback
        rentalOptions: [] // Load separately if needed for performance
      }));

      setProducts(mappedProducts);
      setTiers(tList);
      setGames(gList);
      setTotalProducts(count || 0);
      
      console.log(`✅ Loaded ${mappedProducts.length} products (page ${currentPage}/${Math.ceil((count || 0) / itemsPerPage)}) - Total: ${count}`);
      
    } catch (error) {
      console.error('Error loading products:', error);
      push('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedGame, selectedTier, statusFilter, currentPage, itemsPerPage, push]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const startCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      category: (p as any).category || 'general', // Add category field
      gameTitleId: p.gameTitleData?.id || p.gameTitleId || '',
      tierId: p.tierData?.id || p.tierId || '',
      accountLevel: p.accountLevel,
      accountDetails: p.accountDetails,
      images: p.images && p.images.length ? p.images : (p.image ? [p.image] : []),
      rentals: (p.rentalOptions || []).map(r=>({ id: r.id, duration: r.duration, price: r.price, description: r.description }))
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (!form.name?.trim()) {
        push('Nama produk wajib diisi', 'error');
        return;
      }
      if (!form.description?.trim()) {
        push('Deskripsi produk wajib diisi', 'error');
        return;
      }
      if (!form.price || form.price <= 0) {
        push('Harga produk harus lebih dari 0', 'error');
        return;
      }

      // Validate game title and tier selection - ensure they exist in our reference data
      if (form.gameTitleId && !games.find(g => g.id === form.gameTitleId)) {
        console.warn('⚠️ Selected game title not found in loaded games, clearing selection');
        setForm(prev => ({ ...prev, gameTitleId: '' }));
      }

      if (form.tierId && !tiers.find(t => t.id === form.tierId)) {
        console.warn('⚠️ Selected tier not found in loaded tiers, clearing selection');
        setForm(prev => ({ ...prev, tierId: '' }));
      }

      // Basic payload mapping; in real DB schema, tier/gameTitle should use FKs
      const primaryImage = form.images[0] || '';
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        original_price: Number(form.originalPrice) || null,
        image: primaryImage,
        images: form.images || [],
        category: form.category || 'general', // Add category field
        game_title_id: form.gameTitleId || null,
        tier_id: form.tierId || null,
        account_level: form.accountLevel?.trim() || null,
        account_details: form.accountDetails?.trim() || null,
        is_flash_sale: false,
        has_rental: (form.rentals?.length || 0) > 0,
        stock: 1,
      };

      // Include legacy text column game_title whenever a game is selected
      if (form.gameTitleId) {
        const selectedGame = games.find(g => g.id === form.gameTitleId);
        if (selectedGame) payload.game_title = selectedGame.name;
      }

      // Clean up undefined values that might cause issues
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          payload[key] = null;
        }
      });

      let saved: Product | null = null;
      const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      const canUpdate = form.id && isUuid(form.id);

      if (canUpdate) {
        saved = await ProductService.updateProduct(form.id!, payload as any);
      } else {
        if (form.id && !isUuid(form.id)) {
          push('Produk contoh tidak bisa diubah, membuat salinan baru...', 'info');
        }
        saved = await ProductService.createProduct(payload as any);
      }

      if (saved) {
        // Save rentals if provided (simple implementation: delete and recreate)
        if (form.rentals?.length && supabase) {
          try {
            const productId = saved.id;
            if (canUpdate) {
              const { error: deleteError } = await supabase.from('rental_options').delete().eq('product_id', productId);
              if (deleteError) {
                // Non-fatal
              }
            }
            
            // Validate rental options before inserting
            const validRentals = form.rentals.filter(r => r.duration?.trim() && r.price > 0);
            if (validRentals.length > 0) {
              const inserts = validRentals.map(r => ({
                product_id: productId,
                duration: r.duration.trim(),
                price: Number(r.price) || 0,
                description: r.description?.trim() || null
              }));

              const { error: rentalError } = await supabase.from('rental_options').insert(inserts);
              if (rentalError) {
                push('Produk disimpan, tetapi gagal menyimpan opsi rental', 'info');
              }
            }
          } catch (rentalErr) {
            push('Produk disimpan, tetapi gagal memproses opsi rental', 'info');
          }
        }
        await loadProducts(); // Use optimized reload
        setShowForm(false);
        setForm(emptyForm);
        push('Produk disimpan', 'success');
      } else {
        push('Gagal menyimpan produk', 'error');
      }
    } catch (e: any) {
      push(`Error: ${e?.message || e}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    const target = products.find(p => p.id === id);
    const allImages = target ? (target.images && target.images.length ? target.images : (target.image ? [target.image] : [])) : [];
    const ok = await ProductService.deleteProduct(id, { images: allImages });
    if (ok) {
      await loadProducts(); // Use optimized reload
      push('Produk dihapus', 'success');
    } else {
      push('Gagal menghapus produk', 'error');
    }
  };

  // Diagnostics helpers removed from cleaned admin page

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Produk</h1>
          <p className="text-gray-400">Kelola daftar produk</p>
        </div>
        <button onClick={startCreate} className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700">
          Tambah Produk
        </button>
      </div>

      {!showForm && (
        <>
          {/* Filters and Search */}
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cari Produk</label>
                <input
                  type="text"
                  placeholder="Nama, deskripsi, level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-pink-500/40 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              {/* Game Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filter Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-pink-500/40 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Semua Game</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Tier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filter Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-pink-500/40 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Semua Tier</option>
                  {tiers.map(tier => (
                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-pink-500/40 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="archived">Diarsipkan</option>
                </select>
              </div>
            </div>
            
            {/* Results Info and Items Per Page */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-pink-500/20">
              <div className="text-sm text-gray-400">
                Menampilkan {paginatedProducts.length} dari {filteredProducts.length} produk
                {filteredProducts.length !== products.length && ` (difilter dari ${products.length} total)`}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Tampilkan:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 bg-black border border-pink-500/40 rounded text-white text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-400">per halaman</span>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
              <div className="col-span-5">Nama</div>
              <div className="col-span-2">Game</div>
              <div className="col-span-2">Harga</div>
              <div className="col-span-3 text-right">Aksi</div>
            </div>
            {loading ? (
              <div className="p-4 text-gray-400">Memuat...</div>
            ) : paginatedProducts.length === 0 ? (
              <div className="p-4 text-gray-400">
                {filteredProducts.length === 0 && products.length > 0 
                  ? 'Tidak ada produk yang sesuai dengan filter.'
                  : 'Belum ada produk.'
                }
              </div>
            ) : (
              paginatedProducts.map(p => (
              <div key={p.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
                <div className="col-span-5 flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  <div>
                    <div className="text-white font-medium line-clamp-1">{p.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 flex items-center gap-2">
                      <span>{p.accountLevel || '-'}</span>
                      {((p as any).isActive === false || (p as any).archivedAt) && (
                        <span className="px-2 py-0.5 rounded bg-yellow-900/50 text-amber-300 border border-amber-600/40">Diarsipkan</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-gray-300">{p.gameTitleData?.name || p.gameTitle}</div>
                <div className="col-span-2 text-gray-300">Rp {Number(p.price||0).toLocaleString('id-ID')}</div>
                <div className="col-span-3 text-right">
                  <button onClick={() => startEdit(p)} className="px-3 py-1.5 rounded border border-white/20 text-white hover:bg-white/10 mr-2">Edit</button>
                  {(p as any).isActive === false || (p as any).archivedAt ? (
                    <button onClick={async()=>{
                      if (!supabase) return; 
                      await (supabase as any).from('products').update({ is_active: true, archived_at: null }).eq('id', p.id);
                      await loadProducts(); // Use optimized reload
                      push('Produk dipulihkan dari arsip', 'success');
                    }} className="px-3 py-1.5 rounded border border-green-500/40 text-green-300 hover:bg-green-500/10 mr-2">Pulihkan</button>
                  ) : (
                    <button onClick={async()=>{
                      if (!confirm('Arsipkan produk ini?')) return;
                      if (!supabase) return; 
                      await (supabase as any).from('products').update({ is_active: false, archived_at: new Date().toISOString() }).eq('id', p.id);
                      await loadProducts(); // Use optimized reload
                      push('Produk diarsipkan', 'success');
                    }} className="px-3 py-1.5 rounded border border-yellow-500/40 text-amber-300 hover:bg-yellow-500/10 mr-2">Arsipkan</button>
                  )}
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Enhanced Pagination with Items Per Page */}
        {!loading && totalPages > 1 && (
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Items per halaman</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-black border border-pink-500/40 rounded px-3 py-1 text-white text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="text-sm text-gray-400">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalProducts)} dari {totalProducts.toLocaleString()} produk
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Sebelumnya
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    
                    if (page < 1 || page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded text-sm ${
                          page === currentPage
                            ? 'bg-pink-600 text-white'
                            : 'border border-white/20 text-white hover:bg-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {showForm && (
        <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Produk</label>
                <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} rows={6} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.price ? formatNumberID(form.price) : ''}
                    onChange={(e)=>setForm({...form, price: parseNumberID(e.target.value)})}
                    placeholder="0"
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga Asli (opsional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.originalPrice ? formatNumberID(form.originalPrice) : ''}
                    onChange={(e)=>setForm({...form, originalPrice: parseNumberID(e.target.value)})}
                    placeholder="0"
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                  <select value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white">
                    <option value="general">General</option>
                    <option value="account">Account</option>
                    <option value="item">Item</option>
                    <option value="currency">Currency</option>
                    <option value="boost">Boost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Game</label>
                  <select value={form.gameTitleId} onChange={(e)=>setForm({...form, gameTitleId:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white">
                    <option value="">-- pilih game --</option>
                    {games.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tier</label>
                  <select value={form.tierId} onChange={(e)=>setForm({...form, tierId:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white">
                    <option value="">-- pilih tier --</option>
                    {tiers.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Level Akun (opsional)</label>
                  <input value={form.accountLevel} onChange={(e)=>setForm({...form, accountLevel:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Detail Akun (opsional)</label>
                  <input value={form.accountDetails} onChange={(e)=>setForm({...form, accountDetails:e.target.value})} className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-gray-400">Gambar Produk</label>
              <ImageUploader
                images={form.images}
                onChange={(imgs)=>setForm({...form, images: imgs})}
                onUpload={(files, onProgress)=>uploadFiles(files, 'products', onProgress)}
                max={15}
              />
              <p className="text-xs text-gray-500">Urutkan dengan drag & drop. Gambar pertama menjadi cover.</p>

              {/* Rental options moved below */}
            </div>
          </div>

          {/* Rental section now below the entire form */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="text-sm text-gray-400 mb-2">Rental Options</div>
            <div className="space-y-3">
              {(form.rentals || []).map((r, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                  <input className="col-span-2 bg-black border border-white/20 rounded px-2 py-1 text-white" placeholder="Durasi (mis. 1 Hari)" value={r.duration} onChange={(e)=>{
                    const next = [...form.rentals]; next[idx] = { ...r, duration: e.target.value }; setForm({...form, rentals: next});
                  }} />
                  <input
                    type="text"
                    inputMode="numeric"
                    className="col-span-2 bg-black border border-white/20 rounded px-2 py-1 text-white"
                    placeholder="Harga"
                    value={r.price ? formatNumberID(r.price) : ''}
                    onChange={(e)=>{
                      const next = [...form.rentals]; next[idx] = { ...r, price: parseNumberID(e.target.value) }; setForm({...form, rentals: next});
                    }}
                  />
                  <button className="text-red-300 border border-red-500/40 rounded px-2 py-1 hover:bg-red-500/10" onClick={()=>{
                    const next = [...form.rentals]; next.splice(idx,1); setForm({...form, rentals: next});
                  }}>Hapus</button>
                  <input className="col-span-5 bg-black border border-white/20 rounded px-2 py-1 text-white" placeholder="Deskripsi (opsional)" value={r.description || ''} onChange={(e)=>{
                    const next = [...form.rentals]; next[idx] = { ...r, description: e.target.value }; setForm({...form, rentals: next});
                  }} />
                </div>
              ))}
              <button className="text-white border border-white/20 rounded px-2 py-1 hover:bg-white/10" onClick={()=>setForm({...form, rentals:[...(form.rentals||[]), { duration:'', price:0 }]})}>Tambah Rental</button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button onClick={cancelForm} className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10">Batal</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
