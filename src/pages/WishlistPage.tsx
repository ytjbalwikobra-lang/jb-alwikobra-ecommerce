import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';
import { AuthRequired } from '../components/ProtectedRoute.tsx';
import { formatCurrency } from '../utils/helpers.ts';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  available: boolean;
}

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  };

  const removeFromWishlist = (id: string) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const clearWishlist = () => {
    if (confirm('Yakin ingin mengosongkan wishlist?')) {
      setWishlistItems([]);
      localStorage.removeItem('wishlist');
    }
  };

  return (
    <AuthRequired>
      <div className="min-h-screen" style={{
        background: '#000000',
        backgroundImage: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%, #000000 100%)'
      }}>
        <Header />
      
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Heart size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Wishlist Saya</h1>
                <p className="text-gray-400">Produk yang Anda sukai</p>
              </div>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-red-400 hover:text-red-300 text-sm underline transition-colors"
              >
                Kosongkan Semua
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-12 text-center border border-gray-700/50">
              <div className="w-20 h-20 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-pink-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Wishlist Kosong</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Belum ada produk yang ditambahkan ke wishlist. 
                Jelajahi katalog dan tambahkan produk favorit Anda!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl transition-all transform hover:scale-105"
              >
                <ShoppingCart size={20} />
                <span>Jelajahi Produk</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-black/40 backdrop-blur rounded-xl p-4 border border-pink-500/30 flex items-center space-x-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-pink-400 font-bold text-lg">
                        {formatCurrency(item.price)}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-gray-300 text-sm">{item.rating}</span>
                      </div>
                      
                      <div className={`text-xs px-2 py-1 rounded ${
                        item.available 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.available ? 'Tersedia' : 'Habis'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/products/${item.id}`}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm text-center transition-colors"
                    >
                      Lihat Detail
                    </Link>
                    
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {wishlistItems.length > 0 && (
            <div className="mt-6 bg-black/40 backdrop-blur rounded-xl p-4 border border-pink-500/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-pink-400">{wishlistItems.length}</div>
                  <div className="text-gray-400 text-sm">Total Item</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {wishlistItems.filter(item => item.available).length}
                  </div>
                  <div className="text-gray-400 text-sm">Tersedia</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(wishlistItems.reduce((sum, item) => sum + item.price, 0))}
                  </div>
                  <div className="text-gray-400 text-sm">Total Nilai</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
    </AuthRequired>
  );
};

export default WishlistPage;
