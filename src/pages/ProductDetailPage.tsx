import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '../services/productService.ts';
import { Product, Customer, RentalOption } from '../types/index.ts';
import {
  formatCurrency, 
  calculateTimeRemaining,
  generateWhatsAppUrl,
  generateRentalMessage,
  generatePurchaseMessage
} from '../utils/helpers.ts';
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
import { createXenditInvoice } from '../services/paymentService.ts';
import { getCurrentUserProfile, isLoggedIn, getAuthUserId } from '../services/authService.ts';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRental, setSelectedRental] = useState<RentalOption | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'purchase' | 'rental'>('purchase');
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: ''
  });

  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890';
  const currentUrl = window.location.href;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await ProductService.getProductById(id);
        setProduct(data);
        if (data?.rentalOptions && data.rentalOptions.length > 0) {
          setSelectedRental(data.rentalOptions[0]);
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

  const timeRemaining = product?.flashSaleEndTime 
    ? calculateTimeRemaining(product.flashSaleEndTime)
    : null;

  const isFlashSaleActive = product?.isFlashSale && timeRemaining && !timeRemaining.isExpired;

  const handlePurchase = () => {
    setCheckoutType('purchase');
    setShowCheckoutForm(true);
  };

  const handleRental = (rentalOption: RentalOption) => {
    setSelectedRental(rentalOption);
    setCheckoutType('rental');
    setShowCheckoutForm(true);
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
    if (checkoutType === 'purchase') {
      try {
        const fallbackExternalId = `order_${product.id}_${Date.now()}`;
        const uid = await getAuthUserId();
        const invoice = await createXenditInvoice({
          externalId: fallbackExternalId,
          amount: product.price,
          payerEmail: customer.email,
          description: `Pembelian akun: ${product.name}`,
          // We cannot know the server-created order_id ahead of time. We will update via webhook and let user return manually.
          successRedirectUrl: `${window.location.origin}/payment-status`,
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
            amount: product.price,
            rental_duration: null,
            user_id: uid || undefined as any,
          }
        });
        if (invoice?.invoice_url) window.location.href = invoice.invoice_url;
      } catch (e: any) {
        alert(`Gagal membuat invoice Xendit: ${e?.message || e}`);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produk tidak ditemukan</h2>
          <p className="text-gray-600 mb-4">Produk yang Anda cari tidak tersedia</p>
          <Link
            to="/products"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary-600">Beranda</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Produk</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ChevronLeft size={20} />
          <span>Kembali ke Katalog</span>
        </Link>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square mb-4 bg-gray-100 rounded-xl overflow-hidden">
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

              {/* Stock Badge */}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sisa {product.stock}
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-gray-200'
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
          <div>
            {/* Game Title */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                {product.gameTitle}
              </span>
              {product.hasRental && (
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                  Tersedia Rental
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">4.8 (127 ulasan)</span>
              </div>
              <div className="text-sm text-gray-600">
                Terjual 345+
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Flash Sale Timer */}
            {isFlashSaleActive && timeRemaining && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2 text-red-600 font-medium mb-2">
                  <Clock size={20} />
                  <span>Flash Sale berakhir dalam:</span>
                </div>
                <div className="flex space-x-3">
                  <div className="text-center">
                    <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.days.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-600 mt-1">Hari</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.hours.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-600 mt-1">Jam</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.minutes.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-600 mt-1">Menit</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeRemaining.seconds.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-600 mt-1">Detik</span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Details */}
            {product.accountLevel && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                  <Star className="text-blue-600" size={16} />
                  <span>Detail Akun</span>
                </h3>
                <p className="text-blue-800">
                  <strong>Level:</strong> {product.accountLevel}
                </p>
                {product.accountDetails && (
                  <p className="text-blue-800 mt-1">{product.accountDetails}</p>
                )}
              </div>
            )}

            {/* Rental Options */}
            {product.hasRental && product.rentalOptions && product.rentalOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Calendar className="text-primary-600" size={16} />
                  <span>Opsi Rental</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.rentalOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedRental(option)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        selectedRental?.id === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{option.duration}</div>
                      <div className="text-primary-600 font-semibold">
                        {formatCurrency(option.price)}
                      </div>
                      {option.description && (
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
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
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <CreditCard size={20} />
                <span>
                  {product.stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
                </span>
              </button>

              {/* Rental Button */}
              {product.hasRental && selectedRental && (
                <button
                  onClick={() => handleRental(selectedRental)}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold border-2 transition-colors ${
                    product.stock === 0
                      ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'border-primary-600 text-primary-600 hover:bg-primary-50'
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
            <div className="flex items-center space-x-4 text-gray-600">
              <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                <Heart size={16} />
                <span>Favorit</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                <Share2 size={16} />
                <span>Bagikan</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="text-green-500" size={16} />
                <span>Garansi 100%</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="text-blue-500" size={16} />
                <span>Akun Terverifikasi</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="text-orange-500" size={16} />
                <span>Proses 24 Jam</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle className="text-green-500" size={16} />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Deskripsi Produk</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckoutForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {checkoutType === 'purchase' ? 'Beli Akun' : 'Rental Akun'}
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-primary-600 font-semibold">
                  {checkoutType === 'rental' && selectedRental
                    ? `${formatCurrency(selectedRental.price)} (${selectedRental.duration})`
                    : formatCurrency(product.price)
                  }
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Masukkan email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Masukkan nomor WhatsApp (628...)"
                  />
                </div>

                {checkoutType === 'purchase' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Info size={16} />
                      <span className="text-sm">
                        Pembelian wajib melalui Xendit. Akun akan dikirim via email setelah pembayaran dikonfirmasi.
                      </span>
                    </div>
                  </div>
                )}

                {checkoutType === 'rental' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Calendar size={16} />
                      <span className="text-sm">
                        Akses rental akan diberikan melalui WhatsApp
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>

          {checkoutType === 'purchase' ? (
                    <button
                      type="button"
            onClick={handleCheckout}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Bayar dengan Xendit
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
