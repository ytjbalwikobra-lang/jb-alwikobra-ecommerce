import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLoader from '../components/PageLoader';

const AdminLayoutWrapper = React.lazy(() => import('../layouts/AdminLayoutWrapper'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('../pages/admin/AdminProducts'));
const AdminFlashSales = React.lazy(() => import('../pages/admin/AdminFlashSales'));
const AdminUsers = React.lazy(() => import('../pages/admin/AdminUsers'));
const AdminBanners = React.lazy(() => import('../pages/admin/AdminBanners'));
const AdminSettings = React.lazy(() => import('../pages/admin/AdminSettings'));
const AdminOrders = React.lazy(() => import('../pages/admin/AdminOrders'));
const AdminGameTitles = React.lazy(() => import('../pages/admin/AdminGameTitles'));
const AdminFeed = React.lazy(() => import('../pages/admin/AdminFeed'));

const AdminRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
        <Route
          path="/"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminLayoutWrapper />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
            path="products"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts />
            </Suspense>
          }
        />
        <Route
            path="flash-sales"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminFlashSales />
            </Suspense>
          }
        />
        <Route
            path="game-titles"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminGameTitles />
            </Suspense>
          }
        />
        <Route
            path="feed"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminFeed />
            </Suspense>
          }
        />
        <Route
            path="users"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminUsers />
            </Suspense>
          }
        />
        <Route
            path="orders"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminOrders />
            </Suspense>
          }
        />
        <Route
            path="banners"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminBanners />
            </Suspense>
          }
        />
        <Route
            path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminSettings />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  </Suspense>
);

export default AdminRoutes;
