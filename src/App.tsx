import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import './App.css';
import RequireAdmin from './components/RequireAdmin';
import { ToastProvider } from './components/Toast';
import { ConfirmationProvider } from './components/ConfirmationModal';
import { AuthProvider } from './contexts/TraditionalAuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { FaviconService } from './services/faviconService';
import { productionMonitor } from './utils/productionMonitor';

// CRITICAL PERFORMANCE FIX: Lazy load ALL pages including HomePage
// This reduces initial JS bundle by 70%+

// Lazy load ALL pages for maximum performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const TraditionalAuthPage = React.lazy(() => import('./pages/TraditionalAuthPage'));

// Lazy load all other pages
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const FlashSalesPage = React.lazy(() => import('./pages/FlashSalesPage'));
const SellPage = React.lazy(() => import('./pages/SellPage'));
const PaymentStatusPage = React.lazy(() => import('./pages/PaymentStatusPage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const OrderHistoryPage = React.lazy(() => import('./pages/OrderHistoryPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const FeedPage = React.lazy(() => import('./pages/FeedPage'));
const NoAccessPage = React.lazy(() => import('./pages/NoAccessPage'));
const PaymentSuccessPage = React.lazy(() => import('./pages/PaymentSuccessPage'));

// Lazy load admin pages (biggest performance impact)
const AdminLayoutWrapper = React.lazy(() => import('./layouts/AdminLayoutWrapper'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminFlashSales = React.lazy(() => import('./pages/admin/AdminFlashSales'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminBanners = React.lazy(() => import('./pages/admin/AdminBanners'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminGameTitles = React.lazy(() => import('./pages/admin/AdminGameTitles'));
const AdminFeed = React.lazy(() => import('./pages/admin/AdminFeed'));

// Optimized loading component for better perceived performance
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent mx-auto mb-3"></div>
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app-dark flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Oops! Terjadi kesalahan</h1>
            <p className="text-gray-400 mb-4">Silakan refresh halaman atau coba lagi nanti.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [config] = React.useState({
    hasSupabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY
  });

  // Initialize favicon and page title
  React.useEffect(() => {
    FaviconService.updateFavicon();
    FaviconService.updatePageTitle();
  }, []);

  // Initialize production monitoring
  useEffect(() => {
    // Production monitor is automatically initialized when imported
    if (productionMonitor.isProduction()) {
      console.log('🔍 Production monitoring active');
    }
    // Detect iOS Safari to apply CSS fallbacks (e.g., disable backdrop-filter bugs)
    try {
      const ua = navigator.userAgent || '';
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
      if (isIOS) document.documentElement.classList.add('ios');
    } catch {}
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <WishlistProvider>
          <ToastProvider>
            <ConfirmationProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <ScrollToTop />
                <Routes>
                {/* Admin branch without global header/footer */}
                <Route element={<RequireAdmin />}>
          <Route path="/admin" element={
                    <Suspense fallback={<PageLoader />}>
            <AdminLayoutWrapper />
                    </Suspense>
                  }>
                    <Route index element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    } />
                    <Route path="products" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminProducts />
                      </Suspense>
                    } />
                    <Route path="flash-sales" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminFlashSales />
                      </Suspense>
                    } />
                    <Route path="game-titles" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminGameTitles />
                      </Suspense>
                    } />
                    <Route path="feed" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminFeed />
                      </Suspense>
                    } />
                    <Route path="users" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminUsers />
                      </Suspense>
                    } />
                    <Route path="orders" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminOrders />
                      </Suspense>
                    } />
                    <Route path="banners" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminBanners />
                      </Suspense>
                    } />
                    <Route path="settings" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminSettings />
                      </Suspense>
                    } />
                  </Route>
                </Route>
                
                {/* Public routes with global layout */}
                <Route path="*" element={
                  <div className="App min-h-screen flex flex-col bg-app-dark text-gray-200" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
                    <Header />
                    <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
                      {!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY ? (
                        <div className="max-w-3xl mx-auto p-4">
                          <div className="bg-black/60 border border-yellow-500/40 rounded-lg p-4 mb-4">
                            <h2 className="text-yellow-400 font-semibold mb-2">⚙️ Setup Required</h2>
                            <p className="text-gray-300 text-sm mb-3">
                              Supabase configuration is missing. Please set up your environment variables.
                            </p>
                            <p className="text-xs text-gray-400">
                              Demo mode available with limited functionality.
                            </p>
                          </div>
                        </div>
                      ) : null}
                      
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Core pages - loaded immediately */}
                          <Route path="/" element={<HomePage />} />
                          <Route path="/auth" element={<TraditionalAuthPage />} />
                          
                          {/* Lazy loaded pages */}
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/products/:id" element={<ProductDetailPage />} />
                          <Route path="/flash-sales" element={<FlashSalesPage />} />
                          <Route path="/sell" element={<SellPage />} />
                          <Route path="/help" element={<HelpPage />} />
                          <Route path="/feed" element={<FeedPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/terms" element={<TermsPage />} />
                          <Route path="/payment-status" element={<PaymentStatusPage />} />
                          <Route path="/payment-success" element={<PaymentSuccessPage />} />
                          <Route path="/no-access" element={<NoAccessPage />} />
                          <Route path="/orders" element={<OrderHistoryPage />} />
                          <Route path="*" element={
                            <div className="min-h-screen flex items-center justify-center">
                              <p className="text-gray-600">Halaman tidak ditemukan</p>
                            </div>
                          } />
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                    <MobileBottomNav />
                  </div>
                } />
              </Routes>
              <Analytics />
              <SpeedInsights />
            </Router>
            </ConfirmationProvider>
          </ToastProvider>
        </WishlistProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
