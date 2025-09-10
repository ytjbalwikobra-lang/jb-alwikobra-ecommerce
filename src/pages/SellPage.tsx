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
    <div className="min-h-screen bg-app-dark text-gray-200">
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
  );
};

export default SellPageRefactored;
