import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useProductDetail } from '../hooks/useProductDetail';
import { formatCurrency } from '../utils/helpers';
import { useWishlist } from '../contexts/WishlistContext';
import Footer from '../components/Footer';
import SeoBreadcrumbs from '../components/SeoBreadcrumbs';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { FlashSaleTimer } from '../components/product/FlashSaleTimer';
import { ProductDetails } from '../components/product/ProductDetails';
import { RentalOptions } from '../components/product/RentalOptions';
import { ProductActions } from '../components/product/ProductActions';
import { ProductSecondaryActions } from '../components/product/ProductSecondaryActions';
import { TrustBadges } from '../components/product/TrustBadges';
import { RelatedProducts } from '../components/product/RelatedProducts';
import { CheckoutModal } from '../components/product/CheckoutModal';
import { NotFound } from '../components/ui/LoadingStates';

const ProductDetailPageRefactored: React.FC = () => {
  const {
    // Product data
    product,
    loading,
    related,
    
    // Navigation state
    cameFromFlashSaleCard,
    
    // Image gallery
    selectedImage,
    setSelectedImage,
    images,
    
    // Flash sale
    isFlashSaleActive,
    timeRemaining,
    effectivePrice,
    
    // Rental
    selectedRental,
    setSelectedRental,
    
    // Checkout
    showCheckoutForm,
    setShowCheckoutForm,
    checkoutType,
    customer,
    setCustomer,
    setIsPhoneValid,
    acceptedTerms,
    setAcceptedTerms,
    creatingInvoice,
    
    // SEO
    productJsonLd,
    
    // Actions
    handleBackToCatalog,
    handleShare,
    handleWishlistToggle,
    handlePurchase,
    handleRental,
    handleWhatsAppContact,
    handleCheckout,
  } = useProductDetail();

  const { isInWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <NotFound
        title="Produk tidak ditemukan"
        message="Produk yang Anda cari tidak tersedia"
        linkTo="/products"
        linkText="Kembali ke Katalog"
      />
    );
  }

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <SeoBreadcrumbs
          items={[
            { name: 'Beranda', item: '/' },
            { name: 'Produk', item: '/products' },
            { name: product.name, item: `/products/${product.id}` }
          ]}
        />

        {/* Product JSON-LD */}
        {productJsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        )}

        {/* Back Button */}
        <button
          onClick={handleBackToCatalog}
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-pink-400 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Kembali ke Katalog</span>
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <ProductImageGallery
            images={images}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
            productName={product.name}
            isFlashSaleActive={isFlashSaleActive}
          />

          {/* Product Info */}
          <div className="mt-6">
            {/* Tags: Game Title and Tier only */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Game Title - with fallback */}
              <span className="bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full text-sm font-medium border border-pink-500/30">
                {product.gameTitle || 'FREE FIRE'}
              </span>

              {/* Tier (fallback to legacy tier name) - always show */}
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                {product.tierData?.name || (product.tier === 'premium' ? 'Premium' : product.tier === 'pelajar' ? 'Pelajar' : product.tier === 'reguler' ? 'Reguler' : 'Reguler')}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

            {/* Rating & Reviews removed as per requirements */}
            <div className="h-2"></div>

            {/* Price */}
            <div className="mb-6">
              {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-pink-400">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded text-sm font-medium">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                  <span className="text-lg text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(effectivePrice)}
                </span>
              )}
            </div>

            {/* Flash Sale Timer */}
            {isFlashSaleActive && timeRemaining && (
              <FlashSaleTimer timeRemaining={timeRemaining} />
            )}

            {/* Account Details */}
            <ProductDetails
              accountLevel={product.accountLevel}
              accountDetails={product.accountDetails}
            />

            {/* Rental Options */}
            <RentalOptions
              rentalOptions={product.rentalOptions || []}
              selectedRental={selectedRental}
              onRentalSelect={setSelectedRental}
              cameFromFlashSaleCard={cameFromFlashSaleCard}
              hasRental={product.hasRental || false}
            />

            {/* Action Buttons */}
            <ProductActions
              stock={product.stock}
              hasRental={product.hasRental || false}
              selectedRental={selectedRental}
              cameFromFlashSaleCard={cameFromFlashSaleCard}
              onPurchase={handlePurchase}
              onRental={handleRental}
            />

            {/* Additional Actions */}
            <ProductSecondaryActions
              productId={product.id}
              isInWishlist={isInWishlist(product.id)}
              onWishlistToggle={handleWishlistToggle}
              onShare={handleShare}
            />

            {/* Trust Badges */}
            <TrustBadges />
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-black rounded-xl border border-pink-500/30 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Deskripsi Produk</h2>
          <div className="max-w-none">
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          products={related} 
          cameFromFlashSaleCard={cameFromFlashSaleCard} 
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={showCheckoutForm}
          onClose={() => setShowCheckoutForm(false)}
          product={product}
          checkoutType={checkoutType}
          selectedRental={selectedRental}
          effectivePrice={effectivePrice}
          customer={customer}
          onCustomerChange={setCustomer}
          onPhoneValidationChange={setIsPhoneValid}
          acceptedTerms={acceptedTerms}
          onTermsChange={setAcceptedTerms}
          creatingInvoice={creatingInvoice}
          onCheckout={handleCheckout}
          onWhatsAppContact={() => handleWhatsAppContact('rental')}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPageRefactored;
