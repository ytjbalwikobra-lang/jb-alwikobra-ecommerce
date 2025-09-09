import React, { useState, useEffect, useCallback } from 'react';
import { Product, GameTitle, Tier } from '../../types';
import { adminService } from '../../services/adminService';
import { useToast } from '../../components/Toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Card, CardContent } from '../../components/ui/card';
import { ProductsPageHeader } from '../../components/admin/products/ProductsPageHeader';
import { ProductFilters } from '../../components/admin/products/ProductFilters';
import { ProductsTable } from '../../components/admin/products/ProductsTable';
import { ProductFormModal } from '../../components/admin/products/ProductFormModal';
import { DeleteProductDialog } from '../../components/admin/products/DeleteProductDialog';
import { Skeleton } from '../../components/ui/skeleton';

const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', gameTitleId: '', status: 'active' });
  const { push } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getProducts(filters);
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      push(`Error fetching products: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, push]);

  const fetchMeta = useCallback(async () => {
    try {
      const [gt, t] = await Promise.all([
        adminService.getGameTitles(),
        adminService.getTiers(),
      ]);
      if (gt.data) setGameTitles(gt.data);
      if (t.data) setTiers(t.data);
    } catch (error: any) {
      push(`Error fetching metadata: ${error.message}`, 'error');
    }
  }, [push]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return {
    products,
    gameTitles,
    tiers,
    loading,
    filters,
    handleFilterChange,
    reloadProducts: fetchProducts,
  };
};

const AdminProducts: React.FC = () => {
  usePageTitle();
  const { products, gameTitles, tiers, loading, filters, handleFilterChange, reloadProducts } = useAdminProducts();

  const [modalState, setModalState] = useState<{
    formOpen: boolean;
    deleteOpen: boolean;
    selectedProduct: Product | null;
  }>({
    formOpen: false,
    deleteOpen: false,
    selectedProduct: null,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => setModalState({ formOpen: true, deleteOpen: false, selectedProduct: null });
  const handleEdit = (product: Product) => setModalState({ formOpen: true, deleteOpen: false, selectedProduct: product });
  const handleDelete = (product: Product) => setModalState({ formOpen: false, deleteOpen: true, selectedProduct: product });
  const handleCloseModals = () => setModalState({ formOpen: false, deleteOpen: false, selectedProduct: null });

  const onFormSuccess = () => {
    handleCloseModals();
    reloadProducts();
  };

  const onDeleteConfirm = async () => {
    if (!modalState.selectedProduct) return;
    setIsDeleting(true);
    try {
      await adminService.deleteProduct(modalState.selectedProduct.id);
      reloadProducts();
      handleCloseModals();
    } catch (error: any) {
      // Handle error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <ProductsPageHeader onAddProduct={handleAdd} />
        <Card>
          <CardContent className="p-4">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              gameTitles={gameTitles}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            {loading ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <ProductsTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </CardContent>
        </Card>
      </div>

      <ProductFormModal
        isOpen={modalState.formOpen}
        onClose={handleCloseModals}
        onSuccess={onFormSuccess}
        product={modalState.selectedProduct}
        gameTitles={gameTitles}
        tiers={tiers}
      />

      <DeleteProductDialog
        isOpen={modalState.deleteOpen}
        onClose={handleCloseModals}
        onConfirm={onDeleteConfirm}
        product={modalState.selectedProduct}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default AdminProducts;
