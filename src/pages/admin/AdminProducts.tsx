import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminCard } from '../../components/admin/AdminCard';
import { AdminInput } from '../../components/admin/AdminInput';
import { AdminSelect } from '../../components/admin/AdminSelect';
import { AdminTextarea } from '../../components/admin/AdminTextarea';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { AdminImageUploader } from '../../components/admin/AdminImageUploader';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';

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
      const result = await adminService.getProducts(
        currentPage,
        itemsPerPage,
        searchTerm,
        categoryFilter,
        gameFilter,
        statusFilter
      );
      
      setProducts(result.data);
      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading products:', error);
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
        await adminService.updateProduct(editingProduct.id, productData);
      } else {
        await adminService.createProduct(productData);
      }

      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
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
      const uploadedUrls = await adminService.uploadImages(files);
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

  const columns = [
    {
      key: 'image',
      title: 'Image',
      render: (product: Product) => (
        <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden">
          {product.image || product.images?.[0] ? (
            <img
              src={product.image || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      title: 'Product Name',
      render: (product: Product) => (
        <div>
          <div className="text-white font-medium">{product.name}</div>
          <div className="text-gray-400 text-sm">{product.game_title}</div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (product: Product) => (
        <AdminBadge variant="secondary">
          {categories.find(c => c.value === product.category)?.label || product.category}
        </AdminBadge>
      )
    },
    {
      key: 'price',
      title: 'Price',
      render: (product: Product) => (
        <span className="text-orange-400 font-semibold">
          {formatPrice(product.price)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (product: Product) => (
        <AdminStatusBadge status={product.status || 'active'} />
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (product: Product) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(product)}
            className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDeleteModal(product)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products Management</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <AdminButton onClick={() => handleOpenModal()} icon={Plus}>
          Add Product
        </AdminButton>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <AdminInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10"
                />
              </div>
            </div>

            <AdminSelect
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories
              ]}
            />

            <AdminInput
              label="Game"
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              placeholder="Filter by game..."
            />

            <AdminSelect
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                ...statusOptions
              ]}
            />
          </div>
        </div>
      </AdminCard>

      {/* Products Table */}
      <AdminCard>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Products</h3>
            <div className="text-sm text-gray-400">
              {totalCount} products total
            </div>
          </div>

          <AdminTable
            columns={columns}
            data={products}
            loading={loading}
            emptyMessage="No products found"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
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
        maxWidth="4xl"
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
              options={categories}
              required
            />

            <AdminSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={statusOptions}
              required
            />

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
            <AdminImageUploader
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              onUpload={handleImageUpload}
              maxImages={5}
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
