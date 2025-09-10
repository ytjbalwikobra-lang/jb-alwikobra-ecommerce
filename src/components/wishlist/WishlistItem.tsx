import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';

interface WishlistItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    category: string;
    available: boolean;
  };
  onRemove: (id: string) => void;
}

export const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove }) => {
  return (
    <div className="bg-black/40 backdrop-blur rounded-xl p-4 border border-pink-500/30">
      <div className="flex space-x-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{item.name}</h3>
          <p className="text-gray-400 text-sm">{item.category}</p>
          <p className="text-pink-400 font-bold text-lg">{formatCurrency(item.price)}</p>
          
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <Star size={14} className="text-yellow-400" fill="currentColor" />
              <span className="text-yellow-400 text-sm">{item.rating.toFixed(1)}</span>
            </div>
            <div className={`text-sm px-2 py-1 rounded ${
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
            onClick={() => onRemove(item.id)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
          >
            <Trash2 size={14} />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
