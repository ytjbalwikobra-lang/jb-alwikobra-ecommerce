import React, { useState, useEffect, useCallback } from 'react';
import { Banner } from '../../types';
import { BannerService } from '../../services/bannerService';
import { useToast } from '../../components/Toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { BannerFormModal } from '../../components/admin/banners/BannerFormModal';
import { Skeleton } from '../../components/ui/skeleton';

const useAdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BannerService.list();
      setBanners(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error: any) {
      push(`Error fetching banners: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return { banners, loading, reloadBanners: fetchBanners };
};

const AdminBanners: React.FC = () => {
  usePageTitle();
  const { banners, loading, reloadBanners } = useAdminBanners();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const handleAdd = () => {
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = async (banner: Banner) => {
    if (window.confirm(`Are you sure you want to delete the banner "${banner.title}"?`)) {
      try {
        await BannerService.remove(banner.id, banner.imageUrl);
        reloadBanners();
      } catch (error: any) {
        // error toast is handled in service
      }
    }
  };

  const onFormSuccess = () => {
    setIsModalOpen(false);
    reloadBanners();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden">
                  <img src={banner.imageUrl} alt={banner.title} className="h-48 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{banner.title}</h3>
                    <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(banner)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(banner)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onFormSuccess}
        banner={selectedBanner}
      />
    </>
  );
};

export default AdminBanners;
