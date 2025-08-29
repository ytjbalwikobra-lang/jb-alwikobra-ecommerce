import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import FlashSalesPage from './pages/FlashSalesPage.tsx';
import SellPage from './pages/SellPage.tsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/flash-sales" element={<FlashSalesPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/admin" element={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Admin panel akan segera tersedia</p></div>} />
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Halaman tidak ditemukan</p></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
