import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLoader from '../components/PageLoader';

const HomePage = React.lazy(() => import('../pages/HomePage'));
const TraditionalAuthPage = React.lazy(() => import('../pages/TraditionalAuthPage'));
const ProductsPage = React.lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('../pages/ProductDetailPage'));
const FlashSalesPage = React.lazy(() => import('../pages/FlashSalesPage'));
const SellPage = React.lazy(() => import('../pages/SellPage'));
const PaymentStatusPage = React.lazy(() => import('../pages/PaymentStatusPage'));
const HelpPage = React.lazy(() => import('../pages/HelpPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const WishlistPage = React.lazy(() => import('../pages/WishlistPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const OrderHistoryPage = React.lazy(() => import('../pages/OrderHistoryPage'));
const TermsPage = React.lazy(() => import('../pages/TermsPage'));
const FeedPage = React.lazy(() => import('../pages/FeedPage'));
const NoAccessPage = React.lazy(() => import('../pages/NoAccessPage'));
const PaymentSuccessPage = React.lazy(() => import('../pages/PaymentSuccessPage'));

const PublicRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<TraditionalAuthPage />} />
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
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Halaman tidak ditemukan</p>
          </div>
        }
      />
    </Routes>
  </Suspense>
);

export default PublicRoutes;
