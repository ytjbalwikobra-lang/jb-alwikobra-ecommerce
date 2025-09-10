import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { SettingsService } from '../services/settingsService';
import { Product, Customer, RentalOption } from '../types';
import { calculateTimeRemaining } from '../utils/helpers';
import { getCurrentUserProfile, isLoggedIn, getAuthUserId } from '../services/authService';
import { createXenditInvoice } from '../services/paymentService';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';

interface LocationState {
  fromFlashSaleCard?: boolean;
  fromCatalogPage?: boolean;
}

interface UseProductDetailReturn {
  // Product data
  product: Product | null;
  loading: boolean;
  related: Product[];
  
  // Navigation state
  cameFromFlashSaleCard: boolean;
  cameFromCatalogPage: boolean;
  
  // Image gallery
  selectedImage: number;
  setSelectedImage: (index: number) => void;
  images: string[];
  
  // Flash sale
  isFlashSaleActive: boolean;
  timeRemaining: ReturnType<typeof calculateTimeRemaining> | null;
  effectivePrice: number;
  
  // Rental
  selectedRental: RentalOption | null;
  setSelectedRental: (rental: RentalOption | null) => void;
  
  // Checkout
  showCheckoutForm: boolean;
  setShowCheckoutForm: (show: boolean) => void;
  checkoutType: 'purchase' | 'rental';
  setCheckoutType: (type: 'purchase' | 'rental') => void;
  customer: Customer;
  setCustomer: (customer: Customer) => void;
  isPhoneValid: boolean;
  setIsPhoneValid: (valid: boolean) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  creatingInvoice: boolean;
  
  // WhatsApp
  whatsappNumber: string;
  
  // SEO
  productJsonLd: object | null;
  currentUrl: string;
  
  // Actions
  handleBackToCatalog: () => void;
  handleShare: () => Promise<void>;
  handleWishlistToggle: () => void;
  handlePurchase: () => void;
  handleRental: (rentalOption: RentalOption) => void;
  handleWhatsAppContact: (type: 'purchase' | 'rental') => void;
  handleCheckout: () => Promise<void>;
}

export const useProductDetail = (): UseProductDetailReturn => {
  const { id } = useParams<{ id: string }>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
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
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890'
  );
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof calculateTimeRemaining> | null>(null);
  
  // Navigation state
  const locationState = location.state as LocationState | null;
  const cameFromFlashSaleCard = Boolean(locationState?.fromFlashSaleCard);
  const cameFromCatalogPage = Boolean(locationState?.fromCatalogPage);
  
  // Current URL for sharing
  const currentUrl = window.location.href;
  
  // Build image gallery
  const images = useMemo(() => {
    if (!product) return [];
    
    const baseList: string[] = (product.images && product.images.length > 0)
      ? product.images.slice(0, 15)
      : (product.image ? [product.image] : []);
    
    if (baseList.length < 5) {
      const needed = 5 - baseList.length;
      const placeholders = Array.from(
        { length: needed }, 
        (_, i) => `https://source.unsplash.com/collection/190727/400x400?sig=${i}`
      );
      return [...baseList, ...placeholders];
    }
    
    return baseList.slice(0, 15);
  }, [product]);
  
  // Flash sale logic
  const isFlashSaleActive = useMemo(() => {
    return cameFromFlashSaleCard && 
           product?.isFlashSale && 
           timeRemaining && 
           !timeRemaining.isExpired;
  }, [cameFromFlashSaleCard, product?.isFlashSale, timeRemaining]);
  
  // Effective price calculation
  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    
    if (isFlashSaleActive && product.originalPrice && product.originalPrice > product.price) {
      return product.price; // sale price when active via flash sale navigation
    }
    
    // Not from flash sale or no active sale: show original/base price
    return product.originalPrice && product.originalPrice > 0 ? product.originalPrice : product.price;
  }, [product, isFlashSaleActive]);
  
  // Product JSON-LD for SEO
  const productJsonLd = useMemo(() => {
    if (!product) return null;
    
    const imgs = product.images && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);
      
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
        availability: product.stock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        url: currentUrl,
      },
    } as const;
  }, [product, currentUrl]);
  
  // Load WhatsApp settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await SettingsService.get();
        if (settings?.whatsappNumber) {
          setWhatsappNumber(settings.whatsappNumber);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    void loadSettings();
  }, []);
  
  // Load product data
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

    
    void fetchProduct();
  }, [id, cameFromFlashSaleCard]);  // Prefill customer if logged in
  useEffect(() => {
    const loadCustomerData = async () => {
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
    };
    
    void loadCustomerData();
  }, []);
  
  // Live countdown state (updates every second when viewing from flash sale)
  useEffect(() => {
    if (!cameFromFlashSaleCard || !product?.flashSaleEndTime) {
      setTimeRemaining(null);
      return;
    }
    
    // Set immediately
    setTimeRemaining(calculateTimeRemaining(product.flashSaleEndTime));
    
    const timer = setInterval(() => {
      if (product.flashSaleEndTime) {
        setTimeRemaining(calculateTimeRemaining(product.flashSaleEndTime));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cameFromFlashSaleCard, product?.flashSaleEndTime]);
  
  // Load related products after product loads
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product) return;
      
      try {
        const relatedProducts = await ProductService.getRelatedProductsByProduct(product, 3);
        setRelated(relatedProducts);
      } catch (error) {
        console.error('Error loading related products:', error);
      }
    };
    
    void loadRelatedProducts();
  }, [product]);
  
  // Action handlers
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
      text: `Lihat ${product.name} di JB Alwikobra - ${effectivePrice.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`,
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

  const handlePurchase = () => {
    setCheckoutType('purchase');
    setShowCheckoutForm(true);
    setAcceptedTerms(false);
  };

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
      // Generate rental message
      message = `Halo, saya tertarik untuk rental ${product.name} selama ${selectedRental.duration} dengan harga ${selectedRental.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}. Link produk: ${currentUrl}`;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
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
            user_id: uid || undefined,
          }
        });
        
        console.log('[ProductDetail] Invoice response:', invoice);
        
        if (invoice?.invoice_url) {
          // reset flag; browser will navigate away
          setCreatingInvoice(false);
          window.location.href = invoice.invoice_url;
          return;
        }
      } catch (error: unknown) {
        console.error('[ProductDetail] Invoice creation failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        showToast(`Gagal membuat invoice: ${errorMessage}`, 'error');
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

  return {
    // Product data
    product,
    loading,
    related,
    
    // Navigation state
    cameFromFlashSaleCard,
    cameFromCatalogPage,
    
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
    setCheckoutType,
    customer,
    setCustomer,
    isPhoneValid,
    setIsPhoneValid,
    acceptedTerms,
    setAcceptedTerms,
    creatingInvoice,
    
    // WhatsApp
    whatsappNumber,
    
    // SEO
    productJsonLd,
    currentUrl,
    
    // Actions
    handleBackToCatalog,
    handleShare,
    handleWishlistToggle,
    handlePurchase,
    handleRental,
    handleWhatsAppContact,
    handleCheckout,
  };
};
