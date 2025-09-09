import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../components/Toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { FlashSalesPageHeader } from '../../components/admin/flashsales/FlashSalesPageHeader';
import { FlashSalesTable } from '../../components/admin/flashsales/FlashSalesTable';
import { FlashSaleFormModal } from '../../components/admin/flashsales/FlashSaleFormModal';
import { FlashSaleWithProduct, Product } from '../../types';

const useAdminFlashSales = () => {
  const [flashSales, setFlashSales] = useState<FlashSaleWithProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fsData, productsData] = await Promise.all([
        adminService.getFlashSales({ notEndedOnly: true }),
        adminService.getProducts({ perPage: 999, status: 'active' }),
      ]);
      
      const salesWithProducts = (fsData.data || []).map((sale: any) => ({
        ...sale,
        product: (productsData.data || []).find((p: any) => p.id === sale.productId || p.id === sale.product_id),
      }));

      setFlashSales(salesWithProducts);
      setProducts(productsData.data || []);
    } catch (error: any) {
      push(`Error fetching data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { flashSales, products, loading, reloadData: fetchData };
};

const AdminFlashSales: React.FC = () => {
  usePageTitle();
  const { flashSales, products, loading, reloadData } = useAdminFlashSales();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<FlashSaleWithProduct | null>(null);
  const { push } = useToast();

  const handleAdd = () => {
    setSelectedSale(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sale: FlashSaleWithProduct) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = async (sale: FlashSaleWithProduct) => {
    if (window.confirm(`Are you sure you want to delete the flash sale for "${sale.product?.name}"?`)) {
      try {
        await adminService.deleteFlashSale(sale.id);
        push('Flash sale deleted successfully', 'success');
        reloadData();
      } catch (error: any) {
        push(`Error deleting flash sale: ${error.message}`, 'error');
      }
    }
  };

  const onFormSuccess = () => {
    setIsModalOpen(false);
    reloadData();
  };

  return (
    <>
      <FlashSalesPageHeader onAdd={handleAdd} />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <FlashSalesTable
              flashSales={flashSales}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <FlashSaleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onFormSuccess}
        sale={selectedSale}
        products={products}
      />
    </>
  );
};

export default AdminFlashSales;
