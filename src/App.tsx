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
      <Router>
        <ScrollToTop />
  <div className="App min-h-screen flex flex-col bg-app-dark text-gray-200">
          <Header />
      <main className="flex-1 pb-16 md:pb-0">
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
              <Route path="/admin" element={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Admin panel akan segera tersedia</p></div>} />
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Halaman tidak ditemukan</p></div>} />
            </Routes>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
