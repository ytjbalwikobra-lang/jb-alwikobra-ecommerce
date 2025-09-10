import React from 'react';
import { useSellPage } from '../hooks/useSellPage';
import HeroSection from '../components/sell/HeroSection';
import PopularGames from '../components/sell/PopularGames';
import SellForm from '../components/sell/SellForm';
import BenefitsSection from '../components/sell/BenefitsSection';
import StepsSection from '../components/sell/StepsSection';
import StatsSection from '../components/sell/StatsSection';
import CTASection from '../components/sell/CTASection';

const SellPageRefactored: React.FC = () => {
  const {
    formData,
    gameOptions,
    popularGames,
    loadingGames,
    handleFormChange,
    handlePriceChange,
    handleSellAccount,
  } = useSellPage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-200">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Hero Section */}
        <HeroSection onSellAccount={handleSellAccount} />

        {/* Popular Games Section */}
        <PopularGames games={popularGames} loading={loadingGames} />

        {/* Sell Form Section */}
        <SellForm
          formData={formData}
          gameOptions={gameOptions}
          onFormChange={handleFormChange}
          onPriceChange={handlePriceChange}
          onSubmit={handleSellAccount}
        />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Steps Section */}
        <StepsSection />

        {/* Stats Section */}
        <StatsSection />

        {/* CTA Section */}
        <CTASection onSellAccount={handleSellAccount} />
      </div>
    </div>
  );
};

export default SellPageRefactored;
