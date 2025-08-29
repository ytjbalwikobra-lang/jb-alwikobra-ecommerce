import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import MobileBottomNav from './components/MobileBottomNav.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import FlashSalesPage from './pages/FlashSalesPage.tsx';
import SellPage from './pages/SellPage.tsx';
import PaymentStatusPage from './pages/PaymentStatusPage.tsx';
import HelpPage from './pages/HelpPage.tsx';
import './App.css';
import OrderHistoryPage from './pages/OrderHistoryPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminProducts from './pages/admin/AdminProducts.tsx';
import AdminFlashSales from './pages/admin/AdminFlashSales.tsx';
import AdminUsers from './pages/admin/AdminUsers.tsx';
import RequireAdmin from './components/RequireAdmin.tsx';
import { ToastProvider } from './components/Toast.tsx';

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
        <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
            <p className="text-gray-300 mb-4">Error: {this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering...');
  console.log('Environment:', {
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
    hasSupabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY
  });

  return (
    <ErrorBoundary>
      <ToastProvider>
      <Router>
        <ScrollToTop />
  <div className="App min-h-screen flex flex-col bg-app-dark text-gray-200">
          <Header />
      <main className="flex-1 pb-16 md:pb-0">
            {!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY ? (
              <div className="max-w-3xl mx-auto p-4">
                <div className="bg-black/60 border border-yellow-500/40 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 font-semibold">Konfigurasi Supabase belum lengkap.</p>
                  <p className="text-gray-300 text-sm">Aplikasi tetap menampilkan data contoh agar tidak blank. Setel REACT_APP_SUPABASE_URL dan REACT_APP_SUPABASE_ANON_KEY di environment.</p>
                </div>
              </div>
            ) : null}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/flash-sales" element={<FlashSalesPage />} />
              <Route path="/sell" element={<SellPage />} />
        <Route path="/help" element={<HelpPage />} />
              <Route path="/payment-status" element={<PaymentStatusPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="flash-sales" element={<AdminFlashSales />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
              </Route>
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Halaman tidak ditemukan</p></div>} />
            </Routes>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
