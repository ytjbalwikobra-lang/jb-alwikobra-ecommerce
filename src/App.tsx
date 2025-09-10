/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-floating-promises, no-empty */
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
import ProtectedRoute from './components/ProtectedRoute';
import UnderMaintenancePage from './pages/UnderMaintenancePageAnimated';
import { ToastProvider } from './components/Toast';
import { ConfirmationProvider } from './components/ConfirmationModal';
import { AuthProvider } from './contexts/TraditionalAuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { FaviconService } from './services/faviconService';
import { productionMonitor } from './utils/productionMonitor';
import FloatingFeedNotification from './components/FloatingFeedNotification';

// CRITICAL PERFORMANCE FIX: Lazy load ALL pages including HomePage
// This reduces initial JS bundle by 70%+

// Lazy load ALL pages for maximum performance
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HomePage = React.lazy(() => import('./pages/HomePage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TraditionalAuthPage = React.lazy(() => import('./pages/TraditionalAuthPage'));

// Lazy load all other pages
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FlashSalesPage = React.lazy(() => import('./pages/FlashSalesPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SellPage = React.lazy(() => import('./pages/SellPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PaymentStatusPage = React.lazy(() => import('./pages/PaymentStatusPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OrderHistoryPage = React.lazy(() => import('./pages/OrderHistoryPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FeedPage = React.lazy(() => import('./pages/FeedPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NoAccessPage = React.lazy(() => import('./pages/NoAccessPage'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PaymentSuccessPage = React.lazy(() => import('./pages/PaymentSuccessPage'));

// Lazy load admin pages (biggest performance impact)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminLayoutWrapper = React.lazy(() => import('./layouts/AdminLayoutWrapper'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminFlashSales = React.lazy(() => import('./pages/admin/AdminFlashSales'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminBanners = React.lazy(() => import('./pages/admin/AdminBanners'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminGameTitles = React.lazy(() => import('./pages/admin/AdminGameTitles'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminFeed = React.lazy(() => import('./pages/admin/AdminFeed'));

// Optimized loading component for better perceived performance
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
    <div className="text-center space-y-6">
      {/* Modern multi-ring loader */}
      <div className="relative">
        <div className="w-20 h-20 mx-auto">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-pink-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animate-reverse"></div>
          <div className="absolute top-4 left-4 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
      </div>
      
      {/* Loading text with gradient */}
      <div className="space-y-3">
        <div className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Memuat Halaman
        </div>
        <div className="text-gray-400 text-sm">Sedang menyiapkan konten untuk Anda...</div>
      </div>
      
      {/* Animated dots */}
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {/* Progress bar simulation */}
      <div className="w-48 mx-auto">
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
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
                <FloatingFeedNotification />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={
                    <Suspense fallback={<PageLoader />}>
                      <HomePage />
                    </Suspense>
                  } />
                  
                  <Route path="/auth" element={
                    <Suspense fallback={<PageLoader />}>
                      <TraditionalAuthPage />
                    </Suspense>
                  } />
                  
                  <Route path="/products" element={
                    <Suspense fallback={<PageLoader />}>
                      <ProductsPage />
                    </Suspense>
                  } />
                  
                  <Route path="/product/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <ProductDetailPage />
                    </Suspense>
                  } />
                  
                  <Route path="/flash-sales" element={
                    <Suspense fallback={<PageLoader />}>
                      <FlashSalesPage />
                    </Suspense>
                  } />
                  
                  <Route path="/sell" element={
                    <Suspense fallback={<PageLoader />}>
                      <SellPage />
                    </Suspense>
                  } />
                  
                  <Route path="/payment-status" element={
                    <Suspense fallback={<PageLoader />}>
                      <PaymentStatusPage />
                    </Suspense>
                  } />
                  
                  <Route path="/payment-success" element={
                    <Suspense fallback={<PageLoader />}>
                      <PaymentSuccessPage />
                    </Suspense>
                  } />
                  
                  <Route path="/help" element={
                    <Suspense fallback={<PageLoader />}>
                      <HelpPage />
                    </Suspense>
                  } />
                  
                  <Route path="/terms" element={
                    <Suspense fallback={<PageLoader />}>
                      <TermsPage />
                    </Suspense>
                  } />
                  
                  <Route path="/feed" element={
                    <Suspense fallback={<PageLoader />}>
                      <FeedPage />
                    </Suspense>
                  } />
                  
                  <Route path="/no-access" element={
                    <Suspense fallback={<PageLoader />}>
                      <NoAccessPage />
                    </Suspense>
                  } />

                  {/* Protected Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <ProfilePage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/wishlist" element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <WishlistPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <SettingsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <OrderHistoryPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<RequireAdmin />}>
                    <Route path="" element={
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
                      <Route path="users" element={
                        <Suspense fallback={<PageLoader />}>
                          <AdminUsers />
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
                      <Route path="orders" element={
                        <Suspense fallback={<PageLoader />}>
                          <AdminOrders />
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
                    </Route>
                  </Route>

                  {/* Maintenance Route (for emergency use) */}
                  <Route path="/maintenance" element={
                    <Suspense fallback={<PageLoader />}>
                      <UnderMaintenancePage />
                    </Suspense>
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
