import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, Edit, Plus, X, Upload, Search, Filter } from 'lucide-react';
import { Product, GameTitle, Tier } from '../../types/index.ts';
import { adminService } from '../../services/adminService.ts';
import { useToast } from '../../components/Toast.tsx';
import { AdminButton } from '../../components/admin/AdminButton.tsx';
import { AdminPillBadge, AdminPillStatusBadge } from '../../components/admin/AdminPillBadge.tsx';

// Form data interface sesuai spesifikasi yang benar
interface ProductFormData {
  name: string;           // Nama Produk (Required)
  description: string;    // Deskripsi Produk (Required)
  category: 'account' | 'item'; // Kategori: account | item (Required)
  price: number;          // Harga (Required)
  game_title_id: string; // Judul Game dari table game_titles (Required)
  tier_id: string;        // Tier dari table tiers (Required)
  account_level?: string; // Level Akun (Optional)
  account_details?: string; // Detail Akun (Optional)
  has_rental: boolean;    // Toggle Rental
  rental_options: RentalOptionForm[]; // Variant durasi dan harga (max 4)
  status?: 'active' | 'archived'; // active | archived (untuk edit saja)
  images: string[];
}

interface RentalOptionForm {
  duration: string;
  price: number;
  description?: string;
}

const emptyFormData: ProductFormData = {
  name: '',
  description: '',
  category: 'account',
  price: 0,
  game_title_id: '',
  tier_id: '',
  account_level: '',
  account_details: '',
  has_rental: false,
  rental_options: [],
  status: 'active',
  images: []
};

const AdminProducts: React.FC = () => {
  const { push } = useToast();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;

  // Category options
  const categoryOptions = [
    { value: 'account', label: 'Account' },
    { value: 'item', label: 'Item' }
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ];

  // Load game titles and tiers
  const loadGameTitlesAndTiers = useCallback(async () => {
    try {
      const [gt, tr] = await Promise.all([
        adminService.getGameTitles(),
        adminService.getTiers()
      ]);
      if (!gt.error) {
        const mapped: GameTitle[] = (gt.data || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          slug: g.slug || '',
          description: g.description || '',
          icon: g.icon || '',
          color: g.color || '#000000',
          isPopular: !!(g.is_popular ?? g.isPopular),
          isActive: g.is_active ?? true,
          sortOrder: g.sort_order ?? 0,
          createdAt: g.created_at,
          updatedAt: g.updated_at
        }));
        setGameTitles(mapped);
      }
      if (!tr.error) {
        const mappedTiers: Tier[] = (tr.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug || '',
          description: t.description || '',
          color: t.color || '',
          borderColor: '',
          backgroundGradient: '',
          icon: '',
          priceRangeMin: undefined,
          priceRangeMax: undefined,
          isActive: true,
          sortOrder: 0,
          createdAt: '',
          updatedAt: ''
        }));
        setTiers(mappedTiers);
      }
    } catch (error) {
      console.error('Error loading game titles and tiers:', error);
    }
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const result = await adminService.getProducts({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
        category: categoryFilter,
        gameTitleId: gameFilter,
        status: statusFilter
      });

      if (result.data) {
        setProducts(result.data);
        setTotalProducts(result.count || 0);
        setTotalPages(Math.ceil((result.count || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      push('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, statusFilter, push]);

  // Load data on mount
  useEffect(() => {
    loadGameTitlesAndTiers();
    loadProducts();
  }, [loadGameTitlesAndTiers, loadProducts]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama produk wajib diisi';
    }

    if (!formData.description.trim()) {
      errors.description = 'Deskripsi produk wajib diisi';
    }

    if (!formData.game_title_id) {
      errors.game_title_id = 'Judul game wajib dipilih';
    }

    if (!formData.tier_id) {
      errors.tier_id = 'Tier wajib dipilih';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Harga harus lebih dari 0';
    }

    // Validate rental options if has_rental is true
    if (formData.has_rental && formData.rental_options.length === 0) {
      errors.rental_options = 'Minimal 1 opsi rental diperlukan';
    }

    formData.rental_options.forEach((option, index) => {
      if (!option.duration.trim()) {
        errors[`rental_${index}_duration`] = 'Durasi wajib diisi';
      }
      if (!option.price || option.price <= 0) {
        errors[`rental_${index}_price`] = 'Harga rental harus lebih dari 0';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Transform form data to product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        game_title_id: formData.game_title_id,
        tier_id: formData.tier_id,
        account_level: formData.account_level,
        account_details: formData.account_details,
        has_rental: formData.has_rental,
        images: formData.images,
        // Convert status to database fields
        is_active: formData.status === 'active',
        archived_at: formData.status === 'archived' ? new Date().toISOString() : null,
        // Main image
        image: formData.images[0] || ''
      };

      let result;
      if (editingProduct) {
        result = await adminService.updateProduct(editingProduct.id, productData);
        push('Produk berhasil diperbarui', 'success');
      } else {
        result = await adminService.createProduct(productData);
        push('Produk berhasil dibuat', 'success');
      }

      if (result.data) {
        // Handle rental options separately if needed
        if (formData.has_rental) {
          const targetId = (editingProduct?.id) || result.data.id;
          await adminService.saveRentalOptions(targetId, formData.rental_options);
        }

        await loadProducts();
        handleCloseModal();
      }
      
    } catch (error) {
      console.error('Error saving product:', error);
      push('Error menyimpan produk', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal operations
  const handleOpenModal = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      
      // Determine status from product data
      let status: 'active' | 'archived' = 'active';
      if (product.archivedAt) {
        status = 'archived';
      }
      
      // Try to fetch latest rental options for this product from DB
      let rentalOptions = (product as any).rentalOptions?.map((ro: any) => ({
        duration: ro.duration,
        price: ro.price,
        description: ro.description
      })) || [];
      try {
        const ro = await adminService.getRentalOptions(product.id);
        if (!ro.error && ro.data && ro.data.length) {
          rentalOptions = ro.data.map((r: any) => ({ duration: r.duration, price: r.price, description: r.description }));
        }
      } catch {}

      setFormData({
        name: product.name,
        description: product.description,
        category: (product.category as 'account' | 'item') || 'account',
        price: product.price,
        game_title_id: product.gameTitleId || '',
        tier_id: product.tierId || '',
        account_level: product.accountLevel || '',
        account_details: product.accountDetails || '',
        has_rental: product.hasRental || rentalOptions.length > 0 || false,
        rental_options: rentalOptions,
        status: status,
        images: product.images || []
      });
    } else {
      setEditingProduct(null);
      setFormData(emptyFormData);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(emptyFormData);
    setFormErrors({});
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await adminService.deleteProduct(deletingProduct.id);
      push('Produk berhasil dihapus', 'success');
      await loadProducts();
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      push('Error menghapus produk', 'error');
    }
  };

  // Handle rental options
  const addRentalOption = () => {
    if (formData.rental_options.length < 4) {
      setFormData({
        ...formData,
        rental_options: [
          ...formData.rental_options,
          { duration: '', price: 0, description: '' }
        ]
      });
    }
  };

  const removeRentalOption = (index: number) => {
    setFormData({
      ...formData,
      rental_options: formData.rental_options.filter((_, i) => i !== index)
    });
  };

  const updateRentalOption = (index: number, field: keyof RentalOptionForm, value: string | number) => {
    const updatedOptions = [...formData.rental_options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      rental_options: updatedOptions
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to get product status
  const getProductStatus = (product: Product): 'active' | 'archived' => {
    if (product.archivedAt) return 'archived';
    return 'active';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-600">Buat dan kelola produk game</p>
        </div>
        <AdminButton onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Produk
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nama produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Game Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game
            </label>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Semua Game</option>
              {gameTitles.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada produk ditemukan.
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game/Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.image ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">No IMG</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {product.gameTitleData?.name || product.gameTitle || '-'}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {product.category || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                      {product.hasRental && (
                        <div className="text-xs text-orange-600">
                          + Rental Available
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <AdminPillStatusBadge 
                        status={getProductStatus(product) === 'active' ? 'active' : 'cancelled'} 
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProduct(product);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> sampai{' '}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalProducts)}</span> dari{' '}
                      <span className="font-medium">{totalProducts}</span> produk
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Judul Game - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Game <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.game_title_id}
                      onChange={(e) => setFormData({ ...formData, game_title_id: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        formErrors.game_title_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Judul Game</option>
                      {gameTitles.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.game_title_id && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.game_title_id}</p>
                    )}
                  </div>

                  {/* Tier - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tier_id}
                      onChange={(e) => setFormData({ ...formData, tier_id: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        formErrors.tier_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Tier</option>
                      {tiers.map(tier => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.tier_id && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.tier_id}</p>
                    )}
                  </div>

                  {/* Nama Produk - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama produk"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Kategori - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'account' | 'item' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Harga - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        formErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                    )}
                  </div>

                  {/* Status - Only for edit */}
                  {editingProduct && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'archived' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Deskripsi - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Produk <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan deskripsi produk"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                {/* Level Akun - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level Akun (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.account_level || ''}
                    onChange={(e) => setFormData({ ...formData, account_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Misal: Level 50, Mythic Glory, dll"
                  />
                </div>

                {/* Detail Akun - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detail Akun (Opsional)
                  </label>
                  <textarea
                    value={formData.account_details || ''}
                    onChange={(e) => setFormData({ ...formData, account_details: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Detail tambahan tentang akun"
                  />
                </div>

                {/* Toggle Rental */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.has_rental}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        has_rental: e.target.checked,
                        rental_options: e.target.checked ? formData.rental_options : []
                      })}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Tersedia untuk Rental
                    </span>
                  </label>
                </div>

                {/* Rental Options - Max 4 */}
                {formData.has_rental && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Opsi Rental (Maksimal 4)
                      </label>
                      {formData.rental_options.length < 4 && (
                        <button
                          type="button"
                          onClick={addRentalOption}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          + Tambah Opsi
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {formData.rental_options.map((option, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Opsi Rental {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeRentalOption(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <input
                                type="text"
                                placeholder="Durasi (misal: 1 Hari)"
                                value={option.duration}
                                onChange={(e) => updateRentalOption(index, 'duration', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                                  formErrors[`rental_${index}_duration`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {formErrors[`rental_${index}_duration`] && (
                                <p className="mt-1 text-xs text-red-600">{formErrors[`rental_${index}_duration`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <input
                                type="number"
                                placeholder="Harga"
                                value={option.price}
                                onChange={(e) => updateRentalOption(index, 'price', parseInt(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                                  formErrors[`rental_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                min="0"
                              />
                              {formErrors[`rental_${index}_price`] && (
                                <p className="mt-1 text-xs text-red-600">{formErrors[`rental_${index}_price`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <input
                                type="text"
                                placeholder="Deskripsi (opsional)"
                                value={option.description || ''}
                                onChange={(e) => updateRentalOption(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {formErrors.rental_options && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.rental_options}</p>
                    )}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                  >
                    Batal
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    loading={submitting}
                  >
                    {editingProduct ? 'Perbarui Produk' : 'Buat Produk'}
                  </AdminButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Hapus Produk
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus produk "{deletingProduct.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingProduct(null);
                }}
              >
                Batal
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={handleDelete}
              >
                Hapus
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
