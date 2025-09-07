import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { adminService } from '../../services/adminService.ts';
import { AdminButton } from '../../components/admin/AdminButton.tsx';
import AdminCard from '../../components/admin/AdminCard.tsx';
import { AdminInput, AdminSelect, AdminTextarea } from '../../components/admin/AdminFormComponents.tsx';
import { AdminTable } from '../../components/admin/AdminTable.tsx';
import { AdminModal, AdminConfirmModal } from '../../components/admin/AdminModal.tsx';
import ImageUploader from '../../components/admin/AdminImageUploader.tsx';
import { AdminPillBadge, AdminPillStatusBadge } from '../../components/admin/AdminPillBadge.tsx';

interface Product {
  id: string;
  name: string;
  game_title: string;
  price: number;
  description?: string;
  category?: string;
  status?: string;
  images?: string[];
  image?: string;
  created_at: string;
  updated_at?: string;
}

interface ProductFormData {
  name: string;
  game_title: string;
  price: number;
  description: string;
  category: string;
  status: string;
  images: string[];
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    game_title: '',
    price: 0,
    description: '',
    category: 'digital_game',
    status: 'active',
    images: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

  const categories = [
    { value: 'digital_game', label: 'Digital Game' },
    { value: 'account', label: 'Game Account' },
    { value: 'item', label: 'Game Item' },
    { value: 'currency', label: 'Game Currency' },
    { value: 'service', label: 'Game Service' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ];

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Check if admin service is available
      const testResult = await adminService.testConnection();
      if (!testResult.success) {
        console.error('Admin service not available:', testResult.message);
        setProducts([]);
        setTotalCount(0);
        setHasMore(false);
        return;
      }
      
      const result = await adminService.getProducts({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
        category: categoryFilter,
        gameTitle: gameFilter,
        status: statusFilter
      });
      
      setProducts(result.data || []);
      setTotalCount(result.count || 0);
      setHasMore((result.count || 0) > currentPage * itemsPerPage);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, categoryFilter, gameFilter, statusFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, categoryFilter, gameFilter, statusFilter]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        game_title: product.game_title,
        price: product.price,
        description: product.description || '',
        category: product.category || 'digital_game',
        status: product.status || 'active',
        images: product.images || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        game_title: '',
        price: 0,
        description: '',
        category: 'digital_game',
        status: 'active',
        images: []
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      game_title: '',
      price: 0,
      description: '',
      category: 'digital_game',
      status: 'active',
      images: []
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.game_title.trim()) {
      errors.game_title = 'Game title is required';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const productData = {
        ...formData,
        image: formData.images[0] || null
      };

      if (editingProduct) {
        const result = await adminService.updateProduct(editingProduct.id, productData);
        console.log('✅ Product updated:', result);
      } else {
        const result = await adminService.createProduct(productData);
        console.log('✅ Product created:', result);
      }

      // Force reload products to ensure UI reflects changes
      await loadProducts();
      handleCloseModal();
      
      // Clear any cached data
      setProducts([]);
      setTimeout(() => loadProducts(), 100);
      
    } catch (error) {
      console.error('❌ Error saving product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await adminService.deleteProduct(deletingProduct.id);
      await loadProducts();
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleOpenDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
  };

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        const result = await adminService.uploadImage(file, 'products');
        if (result.data?.publicUrl) {
          uploadedUrls.push(result.data.publicUrl);
        }
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Products Management
            </h1>
            <p className="text-gray-400 mt-1">Manage your product catalog with ease</p>
          </div>
          <AdminButton onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </AdminButton>
        </div>
      </AdminCard>

      {/* Filters */}
      <AdminCard>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 border border-orange-400/40 rounded-lg shadow-lg shadow-orange-400/25">
              <Filter className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Advanced Filters
              </h3>
              <p className="text-gray-400 text-sm">Filter products by various criteria</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Products
              </label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
                <AdminInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, description..."
                  className="pl-10 bg-gray-800/60 border-gray-600/60 focus:border-orange-400/60 focus:ring-orange-400/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <AdminSelect
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-800/60 border-gray-600/60 focus:border-orange-400/60 focus:ring-orange-400/30"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </AdminSelect>
            </div>

            <div className="space-y-2">
              <AdminInput
                label="Game Title"
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                placeholder="Filter by game..."
                className="bg-gray-800/60 border-gray-600/60 focus:border-orange-400/60 focus:ring-orange-400/30"
              />
            </div>

            <div className="space-y-2">
              <AdminSelect
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800/60 border-gray-600/60 focus:border-orange-400/60 focus:ring-orange-400/30"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </AdminSelect>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-orange-500/20">
            <div className="flex items-center gap-2">
              <AdminPillBadge variant="info" size="sm">
                {totalCount} products total
              </AdminPillBadge>
              {(searchTerm || categoryFilter || gameFilter || statusFilter) && (
                <AdminPillBadge variant="warning" size="sm">
                  Filtered results
                </AdminPillBadge>
              )}
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Products Table */}
      <AdminCard>
        <div className="space-y-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 border border-orange-400/40 rounded-lg shadow-lg shadow-orange-400/25">
                <Package className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Products Management
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <AdminPillBadge variant="success" size="sm">
                    {products.length} shown
                  </AdminPillBadge>
                  <AdminPillBadge variant="info" size="sm">
                    {totalCount} total
                  </AdminPillBadge>
                </div>
              </div>
            </div>
            
            <AdminButton
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400/40 shadow-lg shadow-orange-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </AdminButton>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/60 border border-gray-600/60 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-400 border-t-transparent"></div>
                <span className="text-gray-300">Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-gray-800/40 border border-gray-600/40 rounded-lg">
                <Package className="w-12 h-12 text-gray-500" />
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-1">No Products Found</h4>
                  <p className="text-gray-500 text-sm">
                    {searchTerm || categoryFilter || gameFilter || statusFilter 
                      ? 'Try adjusting your filters' 
                      : 'Start by adding your first product'
                    }
                  </p>
                </div>
                {!(searchTerm || categoryFilter || gameFilter || statusFilter) && (
                  <AdminButton
                    onClick={() => setIsModalOpen(true)}
                    size="sm"
                    className="mt-2 bg-orange-500/20 border-orange-400/40 text-orange-300 hover:bg-orange-500/30"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Product
                  </AdminButton>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-orange-500/20">
                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-300">Product</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-300">Category</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-300">Price</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-right py-4 px-3 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-800/40 transition-colors group">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-700/60 rounded-lg overflow-hidden border border-gray-600/40 group-hover:border-orange-400/40 transition-colors">
                            {product.image || product.images?.[0] ? (
                              <img
                                src={product.image || product.images?.[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-white group-hover:text-orange-300 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {product.description}
                            </p>
                            {product.game_title && (
                              <AdminPillBadge variant="info" size="sm" className="mt-1">
                                {product.game_title}
                              </AdminPillBadge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <AdminPillBadge variant="secondary" size="sm">
                          {categories.find(c => c.value === product.category)?.label || product.category}
                        </AdminPillBadge>
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-semibold text-orange-400">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        {(() => {
                          const validStatus = ['active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'draft'];
                          const status = validStatus.includes(product.status || '') ? product.status as any : 'active';
                          return <AdminPillStatusBadge status={status} />;
                        })()}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center justify-end gap-2">
                          <AdminButton
                            onClick={() => handleOpenModal(product)}
                            size="sm"
                            variant="ghost"
                            className="text-orange-400 hover:bg-orange-500/20 border-orange-400/40"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleOpenDeleteModal(product)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/20 border-red-400/40"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-orange-500/20">
              <div className="text-sm text-gray-400">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-800/60 border-gray-600/60 hover:border-orange-400/60"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-800/60 border-gray-600/60 hover:border-orange-400/60"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Add/Edit Product Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <AdminInput
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              required
            />

            <AdminInput
              label="Game Title"
              value={formData.game_title}
              onChange={(e) => setFormData({ ...formData, game_title: e.target.value })}
              error={formErrors.game_title}
              required
            />

            <AdminInput
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              error={formErrors.price}
              required
            />

            <AdminSelect
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </AdminSelect>

            <AdminSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </AdminSelect>

            <AdminTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={formErrors.description}
              rows={4}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              max={5}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
          <AdminButton
            variant="secondary"
            onClick={handleCloseModal}
            disabled={submitting}
          >
            Cancel
          </AdminButton>
          <AdminButton
            onClick={handleSubmit}
            loading={submitting}
          >
            {editingProduct ? 'Update Product' : 'Create Product'}
          </AdminButton>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminProducts;
