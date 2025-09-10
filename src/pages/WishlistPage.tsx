import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthRequired from '../components/ProtectedRoute';
import { useWishlistPage } from '../hooks/useWishlistPage';
import { WishlistHeader } from '../components/wishlist/WishlistHeader';
import { WishlistEmptyState } from '../components/wishlist/WishlistEmptyState';
import { WishlistGrid } from '../components/wishlist/WishlistGrid';
import { WishlistStats } from '../components/wishlist/WishlistStats';
import { WishlistConfirmModal } from '../components/wishlist/WishlistConfirmModal';

const WishlistPageRefactored: React.FC = () => {
  const {
    wishlistItems,
    stats,
    isConfirmOpen,
    clearWishlist,
    removeFromWishlist,
    showClearConfirm,
    hideClearConfirm
  } = useWishlistPage();

  return (
    <AuthRequired>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Header />
        
        <div className="pt-16">
          <WishlistHeader 
            itemCount={stats.totalItems}
            onClearWishlist={showClearConfirm}
          />
          
          <div className="max-w-4xl mx-auto p-4">
            {wishlistItems.length === 0 ? (
              <WishlistEmptyState />
            ) : (
              <>
                <WishlistGrid 
                  items={wishlistItems}
                  onRemoveItem={removeFromWishlist}
                />
                <WishlistStats stats={stats} />
              </>
            )}
          </div>
        </div>

        <Footer />

        <WishlistConfirmModal
          isOpen={isConfirmOpen}
          onClose={hideClearConfirm}
          onConfirm={clearWishlist}
          title="Hapus Semua Wishlist"
          message="Apakah Anda yakin ingin menghapus semua item dari wishlist? Tindakan ini tidak dapat dibatalkan."
          confirmText="Hapus Semua"
          cancelText="Batal"
        />
      </div>
    </AuthRequired>
  );
};

export default WishlistPageRefactored;
