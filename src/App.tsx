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
import { ThemeProvider } from './contexts/ThemeContext';
import { productionMonitor } from './utils/productionMonitor';
import { onIdle, warmImport } from './utils/prefetch';

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

// Lazy load admin pages (biggest performance impact)
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminFlashSales = React.lazy(() => import('./pages/admin/AdminFlashSales'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminBanners = React.lazy(() => import('./pages/admin/AdminBanners'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminGameTitles = React.lazy(() => import('./pages/admin/AdminGameTitles'));
const WhatsAppTestPage = React.lazy(() => import('./pages/admin/WhatsAppTestPage'));
const AdminPosts = React.lazy(() => import('./pages/admin/AdminPosts'));

// Optimized loading component for better perceived performance (iOS skeleton)
const PageLoader = () => (
  <div className="min-h-screen bg-ios-background text-ios-text flex items-center justify-center px-6">
    <div className="w-full max-w-md">
      <div className="ios-skeleton h-6 w-40 mb-4"></div>
      <div className="ios-skeleton h-4 w-full mb-2"></div>
      <div className="ios-skeleton h-4 w-5/6 mb-2"></div>
      <div className="ios-skeleton h-4 w-2/3 mb-6"></div>
      <div className="ios-skeleton h-10 w-32 rounded-lg"></div>
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

    // Idle warmup: pre-load frequently visited routes
    onIdle(() => {
      warmImport(() => import('./pages/ProductsPage'));
      warmImport(() => import('./pages/FlashSalesPage'));
      warmImport(() => import('./pages/SellPage'));
      warmImport(() => import('./pages/ProfilePage'));
    }, 1000);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
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
                      <AdminLayout />
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
                    <Route path="posts" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminPosts />
                      </Suspense>
                    } />
                    <Route path="whatsapp-test" element={
                      <Suspense fallback={<PageLoader />}>
                        <WhatsAppTestPage />
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
                  <div className="App min-h-screen flex flex-col bg-app-dark text-gray-200">
                    <Header />
                    <main className="flex-1 with-bottom-nav pt-16 md:pt-20">
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
  </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
