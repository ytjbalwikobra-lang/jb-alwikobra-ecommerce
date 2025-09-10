import React from 'react';
import { Zap } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  selectedImage: number;
  onImageSelect: (index: number) => void;
  productName: string;
  isFlashSaleActive: boolean;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedImage,
  onImageSelect,
  productName,
  isFlashSaleActive
}) => {
  return (
    <div>
      <div className="relative aspect-[4/5] mb-4 bg-gray-900 rounded-xl overflow-hidden">
        <img
          src={images[selectedImage]}
          alt={productName}
          className="w-full h-full object-cover"
        />
        
        {/* Flash Sale Badge */}
        {isFlashSaleActive && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Zap size={14} />
            <span>Flash Sale</span>
          </div>
        )}
      </div>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageSelect(index)}
              className={`flex-shrink-0 w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 ${
                selectedImage === index ? 'border-pink-500' : 'border-pink-500/30'
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
