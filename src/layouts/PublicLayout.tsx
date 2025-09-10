import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface Props {
  children: React.ReactNode;
}

const PublicLayout: React.FC<Props> = ({ children }) => (
  <div
    className="App min-h-screen flex flex-col bg-app-dark text-gray-200"
    style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
  >
    <Header />
    <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
    <Footer />
    <MobileBottomNav />
  </div>
);

export default PublicLayout;
