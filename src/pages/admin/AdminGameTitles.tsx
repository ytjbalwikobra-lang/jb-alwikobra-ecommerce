import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../components/Toast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { GameTitlesPageHeader } from '../../components/admin/gametitles/GameTitlesPageHeader';
import { GameTitlesTable } from '../../components/admin/gametitles/GameTitlesTable';
import { GameTitleFormModal } from '../../components/admin/gametitles/GameTitleFormModal';
import { GameTitle } from '../../types';
import { gameLogoStorage } from '../../services/storageService';

const useAdminGameTitles = () => {
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  const fetchGameTitles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getGameTitles();
      if (error) throw error;

      const list = (data || []).map((gt: any) => {
        let logoUrl = '';
        try {
          if (gt.logo_path) {
            logoUrl = gameLogoStorage.getGameLogoUrl(gt.logo_path);
          } else if (gt.logo_url) {
            logoUrl = gt.logo_url;
          }
        } catch {}
        return { ...gt, logoUrl };
      });

      setGameTitles(list);
    } catch (error: any) {
      push(`Error fetching game titles: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchGameTitles();
  }, [fetchGameTitles]);

  return { gameTitles, loading, reloadGameTitles: fetchGameTitles };
};

const AdminGameTitles: React.FC = () => {
  usePageTitle();
  const { gameTitles, loading, reloadGameTitles } = useAdminGameTitles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGameTitle, setSelectedGameTitle] = useState<GameTitle | null>(null);
  const { push } = useToast();

  const handleAdd = () => {
    setSelectedGameTitle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (gameTitle: GameTitle) => {
    setSelectedGameTitle(gameTitle);
    setIsModalOpen(true);
  };

  const handleDelete = async (gameTitle: GameTitle) => {
    if (window.confirm(`Are you sure you want to delete "${gameTitle.name}"?`)) {
      try {
        await adminService.deleteGameTitle(gameTitle.id);
        if (gameTitle.logoUrl) {
          await gameLogoStorage.deleteGameLogoByUrl(gameTitle.logoUrl).catch(console.error);
        }
        push('Game title deleted successfully', 'success');
        reloadGameTitles();
      } catch (error: any) {
        push(`Error deleting game title: ${error.message}`, 'error');
      }
    }
  };

  const onFormSuccess = () => {
    setIsModalOpen(false);
    reloadGameTitles();
  };

  return (
    <>
      <GameTitlesPageHeader onAdd={handleAdd} />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <GameTitlesTable
              gameTitles={gameTitles}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <GameTitleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onFormSuccess}
        gameTitle={selectedGameTitle}
      />
    </>
  );
};

export default AdminGameTitles;
