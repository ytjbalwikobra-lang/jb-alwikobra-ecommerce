import React, { useEffect, useState, useCallback } from 'react';
import { Product, Tier, GameTitle } from '../../types/index.ts';
import { supabase } from '../../services/supabase.ts';
import { adminService } from '../../services/adminService.ts';
import { formatNumberID, parseNumberID } from '../../utils/helpers.ts';
import { useToast } from '../../components/Toast.tsx';
import { 
  AdminButton, 
  AdminCard, 
  AdminInput, 
  AdminSelect, 
  AdminTextarea,
  AdminTable,
  AdminTableRow,
  AdminTableCell,
  AdminModal,
  AdminConfirmModal,
  AdminBadge,
  AdminStatusBadge
} from '../../components/admin';
import AdminImageUploader from '../../components/admin/AdminImageUploader';

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

const AdminProductsNew: React.FC = () => {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [games, setGames] = useState<GameTitle[]>([]);
  const [deleteModal, setDeleteModal] = useState<{show: boolean; product?: Product}>({show: false});
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);

  // Test admin service connection on component mount
  useEffect(() => {
    const testAdminConnection = async () => {
      const result = await adminService.testConnection();
      if (!result.success) {
        push(`Admin Service Error: ${result.message}`, 'error');
      } else {
        console.log('✅ Admin service connected successfully');
      }
    };
    testAdminConnection();
  }, [push]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        push('Database connection not available', 'error');
        return;
      }

      // Build query with database-level filtering
      let query = supabase
        .from('products')
        .select(`
          id, name, description, price, original_price, account_level,
          is_active, archived_at, created_at, images, game_title_id, tier_id,
          account_details, category, is_flash_sale, has_rental, stock,
          tiers (id, name, color),
          game_titles (id, name)
        `, { count: 'exact' });

      // Apply filters at database level
      if (statusFilter === 'active') {
        query = query.eq('is_active', true).is('archived_at', null);
      } else if (statusFilter === 'archived') {
        query = query.or('is_active.eq.false,archived_at.not.is.null');
      }

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm.trim()}%,description.ilike.%${searchTerm.trim()}%`);
      }

      if (selectedGame !== 'all' && selectedGame) {
        query = query.eq('game_title_id', selectedGame);
      }

      if (selectedTier !== 'all' && selectedTier) {
        query = query.eq('tier_id', selectedTier);
      }

      // Database-level pagination
      const offset = (currentPage - 1) * itemsPerPage;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      const { data: productData, error: productError, count } = await query;

      if (productError) throw productError;

      // Load filter options
      const [tiersData, gamesData] = await Promise.all([
        supabase.from('tiers').select('id, name, color').order('name'),
        supabase.from('game_titles').select('id, name').order('name')
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
        category: product.category || 'general',
        gameTitle: product.game_titles?.[0]?.name || '',
        tier: 'reguler' as any,
        tierId: product.tier_id,
        gameTitleId: product.game_title_id,
        tierData: product.tiers?.[0] as any,
        gameTitleData: product.game_titles?.[0] as any,
        accountLevel: product.account_level,
        accountDetails: product.account_details,
        isFlashSale: product.is_flash_sale || false,
        hasRental: product.has_rental || false,
        stock: product.stock || 1,
        isActive: product.is_active !== false,
        archivedAt: product.archived_at,
        createdAt: product.created_at,
        updatedAt: product.created_at,
        rentalOptions: []
      }));

      setProducts(mappedProducts);
      
      // Map tiers data properly
      const mappedTiers: Tier[] = (tiersData.data || []).map((tier: any) => ({
        id: tier.id,
        name: tier.name,
        slug: tier.slug || '',
        color: tier.color || '',
        isActive: true,
        sortOrder: 0,
        createdAt: '',
        updatedAt: ''
      }));
      
      // Map games data properly  
      const mappedGames: GameTitle[] = (gamesData.data || []).map((game: any) => ({
        id: game.id,
        name: game.name,
        slug: game.slug || '',
        icon: game.icon || '',
        color: '#000000',
        isPopular: false
      }));
      
      setTiers(mappedTiers);
      setGames(mappedGames);
      setTotalProducts(count || 0);
      
    } catch (error) {
      console.error('Error loading products:', error);
      push('Gagal memuat data produk', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedGame, selectedTier, statusFilter, currentPage, itemsPerPage, push]);

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
      category: p.category || 'general',
      gameTitleId: p.gameTitleData?.id || p.gameTitleId || '',
      tierId: p.tierData?.id || p.tierId || '',
      accountLevel: p.accountLevel || '',
      accountDetails: p.accountDetails || '',
      images: p.images && p.images.length ? p.images : (p.image ? [p.image] : []),
      rentals: (p.rentalOptions || []).map(r => ({ 
        id: r.id, 
        duration: r.duration, 
        price: r.price, 
        description: r.description 
      }))
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

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        originalPrice: Number(form.originalPrice) || null,
        image: form.images[0] || '',
        images: form.images || [],
        category: form.category || 'general',
        gameTitleId: form.gameTitleId || null,
        tierId: form.tierId || null,
        accountLevel: form.accountLevel?.trim() || null,
        accountDetails: form.accountDetails?.trim() || null,
        isFlashSale: false,
        hasRental: (form.rentals?.length || 0) > 0,
        stock: 1,
      };

      const isEdit = form.id && form.id.length > 10; // Simple UUID check

      let result;
      if (isEdit) {
        result = await adminService.updateProduct(form.id!, payload);
      } else {
        result = await adminService.createProduct(payload);
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        push(isEdit ? 'Produk berhasil diperbarui' : 'Produk berhasil dibuat', 'success');
        setShowForm(false);
        setForm(emptyForm);
        await loadProducts(); // Reload products
      }

    } catch (error: any) {
      console.error('Save error:', error);
      push(error.message || 'Gagal menyimpan produk', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (product: Product) => {
    setDeleteModal({ show: true, product });
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      const result = await adminService.deleteProduct(deleteModal.product.id);
      
      if (result.error) {
        throw result.error;
      }

      if (result.success) {
        push('Produk berhasil dihapus', 'success');
        setDeleteModal({ show: false });
        await loadProducts(); // Reload products
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      push(error.message || 'Gagal menghapus produk', 'error');
    }
  };

  const addRental = () => {
    setForm(prev => ({
      ...prev,
      rentals: [...prev.rentals, { duration: '', price: 0, description: '' }]
    }));
  };

  const updateRental = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      rentals: prev.rentals.map((rental, i) => 
        i === index ? { ...rental, [field]: value } : rental
      )
    }));
  };

  const removeRental = (index: number) => {
    setForm(prev => ({
      ...prev,
      rentals: prev.rentals.filter((_, i) => i !== index)
    }));
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Produk</h1>
          <p className="text-gray-400 mt-1">
            Kelola produk game account dan rental
          </p>
        </div>
        <AdminButton variant="primary" onClick={startCreate}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </AdminButton>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminInput
            label="Cari produk"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nama atau deskripsi..."
          />
          <AdminSelect
            label="Game"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="all">Semua Game</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </AdminSelect>
          <AdminSelect
            label="Tier"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
          >
            <option value="all">Semua Tier</option>
            {tiers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </AdminSelect>
          <AdminSelect
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="archived">Arsip</option>
          </AdminSelect>
          <AdminSelect
            label="Per halaman"
            value={itemsPerPage.toString()}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </AdminSelect>
        </div>
      </AdminCard>

      {/* Products Table */}
      <AdminCard>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-gray-400 mt-2">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <>
            <AdminTable
              headers={['Produk', 'Game/Tier', 'Harga', 'Status', 'Tanggal', 'Aksi']}
            >
              {products.map((product) => (
                <AdminTableRow key={product.id}>
                  <AdminTableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1">
                      {product.gameTitleData && (
                        <AdminBadge variant="info" size="sm">
                          {product.gameTitleData.name}
                        </AdminBadge>
                      )}
                      {product.tierData && (
                        <AdminBadge variant="secondary" size="sm">
                          {product.tierData.name}
                        </AdminBadge>
                      )}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">
                        {formatNumberID(product.price)}
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatNumberID(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge 
                      status={product.isActive ? 'active' : 'inactive'} 
                    />
                  </AdminTableCell>
                  <AdminTableCell>
                    <p className="text-sm text-gray-400">
                      {new Date(product.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex space-x-2">
                      <AdminButton
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(product)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => confirmDelete(product)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </AdminButton>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTable>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">
                  Menampilkan {products.length} dari {totalProducts} produk
                </p>
                <div className="flex space-x-2">
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Sebelumnya
                  </AdminButton>
                  <span className="px-3 py-1 text-sm text-gray-300 bg-gray-700 rounded">
                    {currentPage} / {totalPages}
                  </span>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Selanjutnya
                  </AdminButton>
                </div>
              </div>
            )}
          </>
        )}
      </AdminCard>

      {/* Product Form Modal */}
      <AdminModal
        isOpen={showForm}
        onClose={cancelForm}
        title={form.id ? 'Edit Produk' : 'Tambah Produk Baru'}
        size="xl"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Nama Produk"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masukkan nama produk..."
              required
            />
            <AdminInput
              label="Kategori"
              value={form.category || ''}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Kategori produk..."
            />
          </div>

          <AdminTextarea
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Masukkan deskripsi produk..."
            rows={3}
            required
          />

          {/* Game and Tier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminSelect
              label="Game Title"
              value={form.gameTitleId || ''}
              onChange={(e) => setForm(prev => ({ ...prev, gameTitleId: e.target.value }))}
            >
              <option value="">Pilih Game...</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </AdminSelect>
            <AdminSelect
              label="Tier"
              value={form.tierId || ''}
              onChange={(e) => setForm(prev => ({ ...prev, tierId: e.target.value }))}
            >
              <option value="">Pilih Tier...</option>
              {tiers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </AdminSelect>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Harga"
              type="text"
              value={formatNumberID(form.price)}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                price: parseNumberID(e.target.value) 
              }))}
              placeholder="0"
              required
            />
            <AdminInput
              label="Harga Asli (Opsional)"
              type="text"
              value={form.originalPrice ? formatNumberID(form.originalPrice) : ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                originalPrice: parseNumberID(e.target.value) || 0
              }))}
              placeholder="0"
            />
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Level Akun"
              value={form.accountLevel || ''}
              onChange={(e) => setForm(prev => ({ ...prev, accountLevel: e.target.value }))}
              placeholder="Contoh: Level 80, Mythic, dll..."
            />
          </div>

          <AdminTextarea
            label="Detail Akun"
            value={form.accountDetails || ''}
            onChange={(e) => setForm(prev => ({ ...prev, accountDetails: e.target.value }))}
            placeholder="Detail lengkap akun (skin, hero, item, dll)..."
            rows={3}
          />

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gambar Produk
            </label>
            <AdminImageUploader
              images={form.images}
              onChange={(images) => setForm(prev => ({ ...prev, images }))}
              max={10}
            />
          </div>

          {/* Rental Options */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Opsi Rental (Opsional)
              </label>
              <AdminButton variant="ghost" size="sm" onClick={addRental}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Rental
              </AdminButton>
            </div>
            {form.rentals.map((rental, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-700 rounded-lg">
                <AdminInput
                  label="Durasi"
                  value={rental.duration}
                  onChange={(e) => updateRental(index, 'duration', e.target.value)}
                  placeholder="1 Hari, 3 Hari, dll..."
                />
                <AdminInput
                  label="Harga"
                  type="text"
                  value={formatNumberID(rental.price)}
                  onChange={(e) => updateRental(index, 'price', parseNumberID(e.target.value))}
                  placeholder="0"
                />
                <AdminInput
                  label="Deskripsi"
                  value={rental.description || ''}
                  onChange={(e) => updateRental(index, 'description', e.target.value)}
                  placeholder="Deskripsi singkat..."
                />
                <div className="flex items-end">
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => removeRental(index)}
                    className="w-full"
                  >
                    Hapus
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <AdminButton
              variant="primary"
              onClick={handleSave}
              loading={saving}
              className="flex-1"
            >
              {form.id ? 'Perbarui Produk' : 'Simpan Produk'}
            </AdminButton>
            <AdminButton
              variant="ghost"
              onClick={cancelForm}
              disabled={saving}
            >
              Batal
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({show: false})}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteModal.product?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
};

export default AdminProductsNew;
