import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { SettingsService } from '../services/settingsService';
import { Product, Customer, RentalOption } from '../types';
import {
  formatCurrency, 
  calculateTimeRemaining,
  generateWhatsAppUrl,
  generateRentalMessage,
  generatePurchaseMessage
} from '../utils/helpers';
import {
  Star,
  Clock,
  Shield,
  Zap,
  ChevronLeft,
  Heart,
  Share2,
  MessageCircle,
  CreditCard,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { createXenditInvoice } from '../services/paymentService';
import { getCurrentUserProfile, isLoggedIn, getAuthUserId } from '../services/authService';
import { useWishlist } from '../contexts/WishlistContext';
import Footer from '../components/Footer';
import PhoneInput from '../components/PhoneInput';
import { useToast } from '../components/Toast';
import SeoBreadcrumbs from '../components/SeoBreadcrumbs';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromFlashSaleCard = Boolean((location as any)?.state?.fromFlashSaleCard);
  const cameFromCatalogPage = Boolean((location as any)?.state?.fromCatalogPage);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRental, setSelectedRental] = useState<RentalOption | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'purchase' | 'rental'>('purchase');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: ''
  });
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [paymentAttemptId, setPaymentAttemptId] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  const [related, setRelated] = useState<Product[]>([]);
  React.useEffect(() => { 
    (async () => { 
      try { 
        const s = await SettingsService.get(); 
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber); 
      } catch {} 
    })(); 
  }, []);
  const currentUrl = window.location.href;
  const productJsonLd = useMemo(() => {
    if (!product) return null;
    const imgs = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: imgs,
      brand: product.gameTitleData?.name || product.gameTitle || 'JB Alwikobra',
      sku: product.id,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'IDR',
        price: String(product.price),
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: currentUrl,
      },
    } as const;
  }, [product, currentUrl]);

  // Handle share functionality
  const handleBackToCatalog = () => {
    if (cameFromCatalogPage) {
      // Jika datang dari katalog, kembali dengan state untuk restore pagination
      navigate('/products', { state: { fromProductDetail: true } });
    } else {
      // Jika tidak dari katalog, navigate normal
      navigate('/products');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Lihat ${product.name} di JB Alwikobra - ${formatCurrency(effectivePrice)}`,
      url: currentUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        showToast('Link produk telah disalin ke clipboard!', 'success');
      }
    } catch (error) {
      // Additional fallback: Manual copy
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Link produk telah disalin ke clipboard!', 'success');
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.images?.[0] || '',
      rating: 5, // Default rating since it's not in Product type
      category: product.category || '',
      available: true // Default to available since it's not in Product type
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await ProductService.getProductById(id);
        setProduct(data);
        if (data?.rentalOptions && data.rentalOptions.length > 0) {
          setSelectedRental(data.rentalOptions[0]);
        }

        // If navigated from a flash sale card, try to enrich with live flash sale info
        if (data && cameFromFlashSaleCard) {
          const sale = await ProductService.getActiveFlashSaleByProductId(data.id);
          if (sale) {
            setProduct(prev => prev ? {
              ...prev,
              isFlashSale: true,
              flashSaleEndTime: sale.endTime,
              price: sale.salePrice,
              originalPrice: sale.originalPrice ?? prev.originalPrice
            } : prev);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Prefill customer if logged in
  useEffect(() => {
    (async () => {
      const logged = await isLoggedIn();
      if (logged) {
        const profile = await getCurrentUserProfile();
        if (profile) {
          setCustomer({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
          });
        }
      }
    })();
  }, []);

  // Live countdown state (updates every second when viewing from flash sale)
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof calculateTimeRemaining> | null>(null);

  useEffect(() => {
    if (!cameFromFlashSaleCard || !product?.flashSaleEndTime) {
      setTimeRemaining(null);
      return;
    }
    // Set immediately
    setTimeRemaining(calculateTimeRemaining(product.flashSaleEndTime));
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(product.flashSaleEndTime!));
    }, 1000);
    return () => clearInterval(timer as any);
  }, [cameFromFlashSaleCard, product?.flashSaleEndTime]);

  // Load related products after product loads
  useEffect(() => {
    (async () => {
      if (!product) return;
      try { setRelated(await ProductService.getRelatedProductsByProduct(product, 3)); } catch {}
    })();
  }, [product?.id]);

  // Show flash sale price/timer only when user arrives from flash sale card AND sale is active
  const isFlashSaleActive = cameFromFlashSaleCard && product?.isFlashSale && timeRemaining && !timeRemaining.isExpired;

  const handlePurchase = () => {
    setCheckoutType('purchase');
    setShowCheckoutForm(true);
  setAcceptedTerms(false);
  };

  // Determine effective price to display/charge
  const effectivePrice = (() => {
    if (!product) return 0;
    if (isFlashSaleActive && product.originalPrice && product.originalPrice > product.price) {
      return product.price; // sale price when active via flash sale navigation
    }
    // Not from flash sale or no active sale: show original/base price
    return product.originalPrice && product.originalPrice > 0 ? product.originalPrice : product.price;
  })();

  const handleRental = (rentalOption: RentalOption) => {
    setSelectedRental(rentalOption);
    setCheckoutType('rental');
    setShowCheckoutForm(true);
  setAcceptedTerms(false);
  };

  const handleWhatsAppContact = (type: 'purchase' | 'rental') => {
    if (!product) return;

    let message = '';
    
    if (type === 'purchase') {
      // Enforce Xendit for purchases: redirect to checkout modal instead of WA
      setCheckoutType('purchase');
      setShowCheckoutForm(true);
      return;
    } else if (type === 'rental' && selectedRental) {
      message = generateRentalMessage(product.name, selectedRental.duration, selectedRental.price, currentUrl);
    }

    const whatsappUrl = generateWhatsAppUrl(whatsappNumber, message);
    window.open(whatsappUrl, '_blank');
  };

  const handleCheckout = async () => {
    if (!product) return;
    
    // Validate required fields
    if (!customer.name.trim()) {
      showToast('Nama lengkap wajib diisi.', 'error');
      return;
    }
    
    if (!customer.email.trim()) {
      showToast('Email wajib diisi.', 'error');
      return;
    }
    
    if (!customer.phone.trim()) {
      showToast('Nomor WhatsApp wajib diisi.', 'error');
      return;
    }
    
    if (!isPhoneValid) {
      showToast('Nomor WhatsApp tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    if (checkoutType === 'purchase') {
      if (!acceptedTerms) {
        showToast('Harap setujui Syarat & Ketentuan terlebih dahulu.', 'error');
        return;
      }
      if (creatingInvoice) return; // guard double submit
      setCreatingInvoice(true);
      try {
        // Stable external id within this attempt to ensure idempotency on retries/double-clicks
        const fallbackExternalId = paymentAttemptId || `order_${product.id}_${Date.now()}`;
        if (!paymentAttemptId) setPaymentAttemptId(fallbackExternalId);
        const uid = await getAuthUserId();
        
        // Validate product ID before sending
        if (!product.id) {
          console.error('[ProductDetail] ERROR: product.id is missing or invalid:', product.id);
          showToast('Error: Product ID tidak valid. Silakan refresh halaman.', 'error');
          return;
        }
        
        console.log('[ProductDetail] Creating invoice with order data:', {
          externalId: fallbackExternalId,
          amount: effectivePrice,
          customer: customer.name,
          productId: product.id,
          productIdType: typeof product.id,
          productIdLength: product.id?.length,
          userId: uid
        });
        
        const invoice = await createXenditInvoice({
          externalId: fallbackExternalId,
          amount: effectivePrice,
          payerEmail: customer.email,
          description: `Pembelian akun: ${product.name}`,
          // We cannot know the server-created order_id ahead of time. We will update via webhook and let user return manually.
          successRedirectUrl: `${window.location.origin}/payment-success`,
          failureRedirectUrl: `${window.location.origin}/payment-status`,
          customer: {
            given_names: customer.name,
            email: customer.email,
            mobile_number: customer.phone,
          },
          order: {
            product_id: product.id,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
            order_type: 'purchase',
            amount: effectivePrice,
            rental_duration: null,
            user_id: uid || undefined as any,
          }
        });
        
        console.log('[ProductDetail] Invoice response:', invoice);
        
        if (invoice?.invoice_url) {
          // reset flag; browser will navigate away
          setCreatingInvoice(false);
          window.location.href = invoice.invoice_url;
          return;
        }
      } catch (e: any) {
        console.error('[ProductDetail] Invoice creation failed:', e);
        showToast(`Gagal membuat invoice: ${e?.message || e}`, 'error');
      } finally {
        setCreatingInvoice(false);
      }
      return;
    }

    if (checkoutType === 'rental' && selectedRental) {
      handleWhatsAppContact('rental');
      return;
    }

    setShowCheckoutForm(false);
  };

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
      <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Produk tidak ditemukan</h2>
          <p className="text-gray-300 mb-4">Produk yang Anda cari tidak tersedia</p>
          <Link
            to="/products"
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  // Build gallery: ensure at least 5 images (fill with placeholders) and at most 15 images
  let images: string[] = [];
  const baseList: string[] = (product.images && product.images.length > 0)
    ? product.images.slice(0, 15)
    : (product.image ? [product.image] : []);
  if (baseList.length < 5) {
    const needed = 5 - baseList.length;
    const placeholders = Array.from({ length: needed }, (_, i) => `https://source.unsplash.com/collection/190727/400x400?sig=${i}`);
    images = [...baseList, ...placeholders];
  } else {
    images = baseList.slice(0, 15);
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
          <div>
                        <div className="relative aspect-[4/5] mb-4 bg-gray-900 rounded-xl overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Flash Sale Badge */}
              {isFlashSaleActive && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Zap size={14} />
                  <span>Flash Sale</span>
                </div>
              )}

              {/* Stock badge removed: qty is always 1 */}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-pink-500' : 'border-pink-500/30'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

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
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center space-x-2 text-red-400 font-medium mb-2">
                  <Clock size={20} />
                  <span>Flash Sale berakhir dalam:</span>
                </div>
                <div className="flex space-x-3">
                  <div className="text-center">
                    <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.days.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-400 mt-1">Hari</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.hours.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-400 mt-1">Jam</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.minutes.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-400 mt-1">Menit</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.seconds.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-400 mt-1">Detik</span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Details */}
            {product.accountLevel && (
              <div className="mb-6 p-4 bg-black border border-pink-500/30 rounded-xl">
                <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                  <Star className="text-yellow-400" size={16} />
                  <span>Detail Akun</span>
                </h3>
                <p className="text-gray-300">
                  <strong>Level:</strong> {product.accountLevel}
                </p>
                {product.accountDetails && (
                  <p className="text-gray-300 mt-1">{product.accountDetails}</p>
                )}
              </div>
            )}

            {/* Rental Options - hidden if user came from flash sale card */}
            {(!cameFromFlashSaleCard) && product.hasRental && product.rentalOptions && product.rentalOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                  <Calendar className="text-pink-400" size={16} />
                  <span>Opsi Rental</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.rentalOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedRental(option)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        selectedRental?.id === option.id
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-pink-500/30 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-medium text-white">{option.duration}</div>
                      <div className="text-pink-400 font-semibold">
                        {formatCurrency(option.price)}
                      </div>
                      {option.description && (
                        <div className="text-sm text-gray-300 mt-1">{option.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {/* Purchase Button */}
      <button
                onClick={handlePurchase}
                disabled={product.stock === 0}
                className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-colors ${
                  product.stock === 0
        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                <CreditCard size={20} />
                <span>
                  {product.stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
                </span>
              </button>

              {/* Rental Button - hidden if user came from flash sale card */}
              {(!cameFromFlashSaleCard) && product.hasRental && selectedRental && (
        <button
                  onClick={() => handleRental(selectedRental)}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold border-2 transition-colors ${
                    product.stock === 0
          ? 'border-gray-700 text-gray-400 cursor-not-allowed'
          : 'border-pink-600 text-pink-400 hover:bg-white/5'
                  }`}
                >
                  <Calendar size={20} />
                  <span>
                    Rental {selectedRental.duration} - {formatCurrency(selectedRental.price)}
                  </span>
                </button>
              )}

              {/* WhatsApp Contact for rental will be presented in the checkout modal */}
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-4 text-gray-300">
              <button 
                onClick={handleWishlistToggle}
                className={`flex items-center space-x-1 transition-colors ${
                  product && isInWishlist(product.id) 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'hover:text-red-400'
                }`}
              >
                <Heart 
                  size={16} 
                  className={product && isInWishlist(product.id) ? 'fill-current' : ''} 
                />
                <span>Favorit</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center space-x-1 hover:text-pink-400 transition-colors"
              >
                <Share2 size={16} />
                <span>Bagikan</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Shield className="text-green-500" size={16} />
                <span>Garansi 100%</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <CheckCircle className="text-blue-500" size={16} />
                <span>Akun Terverifikasi</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Clock className="text-orange-500" size={16} />
                <span>Proses 24 Jam</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MessageCircle className="text-green-500" size={16} />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-black rounded-xl border border-pink-500/30 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Deskripsi Produk</h2>
          <div className="max-w-none">
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Related Products (hidden on flash sale detail) */}
        {!cameFromFlashSaleCard && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Produk Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(rp => (
                <Link key={rp.id} to={`/products/${rp.id}`} className="block group">
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={rp.image || rp.images?.[0]}
                        alt={rp.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-semibold">{rp.name}</div>
                      <div className="text-pink-400">{formatCurrency(rp.originalPrice && rp.originalPrice > 0 ? rp.originalPrice : rp.price)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckoutForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-black border border-pink-500/30 rounded-xl max-w-md w-full p-6 text-gray-200">
              <h3 className="text-xl font-bold text-white mb-4">
                {checkoutType === 'purchase' ? 'Beli Akun' : 'Rental Akun'}
              </h3>
              
              <div className="mb-4 p-4 bg-black border border-pink-500/30 rounded-lg">
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-pink-400 font-semibold">
                  {checkoutType === 'rental' && selectedRental
                    ? `${formatCurrency(selectedRental.price)} (${selectedRental.duration})`
                    : formatCurrency(effectivePrice)
                  }
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Masukkan email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    No. WhatsApp *
                  </label>
                  <PhoneInput
                    value={customer.phone}
                    onChange={(value) => setCustomer({ ...customer, phone: value })}
                    onValidationChange={setIsPhoneValid}
                    placeholder="Masukkan Nomor WhatsApp"
                    required
                  />
                </div>

                {checkoutType === 'purchase' && (
                  <div className="p-3 bg-black border border-pink-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Info size={16} />
                      <span className="text-sm">
                        Pembayaran melalui sistem pembayaran aman dan terjamin. Informasi detail akan di kirim via WhatsApp setelah pembayaran berhasil.
                      </span>
                    </div>
                  </div>
                )}

                {checkoutType === 'rental' && (
                  <div className="p-3 bg-black border border-pink-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar size={16} />
                      <span className="text-sm">
                        Akses rental akan diberikan melalui WhatsApp
                      </span>
                    </div>
                  </div>
                )}

                {/* Terms acceptance (required for purchase) */}
                {checkoutType === 'purchase' && (
                  <label className="flex items-start space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 form-checkbox h-4 w-4 text-pink-600 border-pink-500/40 bg-black rounded"
                    />
                    <span>
                      Saya telah membaca dan menyetujui{' '}
                      <Link to="/terms" className="text-pink-400 underline hover:text-pink-300" target="_blank" rel="noreferrer">
                        Syarat & Ketentuan PT ALWI KOBRA INDONESIA
                      </Link>
                    </span>
                  </label>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="flex-1 px-4 py-2 border border-pink-500/40 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Batal
                  </button>

          {checkoutType === 'purchase' ? (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={!acceptedTerms || creatingInvoice}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        acceptedTerms && !creatingInvoice
                          ? 'bg-pink-600 text-white hover:bg-pink-700'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {creatingInvoice && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      )}
                      {creatingInvoice ? 'Memproses...' : 'Bayar Sekarang'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppContact('rental')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Lanjut ke WhatsApp
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
