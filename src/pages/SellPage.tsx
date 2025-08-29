import React, { useState } from 'react';
import { 
  generateWhatsAppUrl,
  generateSellAccountMessage
} from '../utils/helpers.ts';
import {
  MessageCircle,
  DollarSign,
  Shield,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Gamepad2,
  Trophy,
  Users
} from 'lucide-react';

const SellPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [accountLevel, setAccountLevel] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [accountDetails, setAccountDetails] = useState('');

  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890';

  const gameOptions = [
    'Mobile Legends',
    'PUBG Mobile',
    'Free Fire',
    'Genshin Impact',
    'Call of Duty Mobile',
    'Valorant',
    'Arena of Valor',
    'Clash of Clans',
    'Clash Royale',
    'Honkai Impact',
    'Lainnya'
  ];

  const handleSellAccount = () => {
    const gameInfo = selectedGame || 'Game yang ingin dijual';
    const message = generateSellAccountMessage(gameInfo);
    const whatsappUrl = generateWhatsAppUrl(whatsappNumber, message);
    window.open(whatsappUrl, '_blank');
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Harga Terbaik',
      description: 'Dapatkan harga terbaik untuk akun game Anda dengan sistem evaluasi yang fair dan transparan.'
    },
    {
      icon: Shield,
      title: 'Proses Aman',
      description: 'Transaksi aman dengan escrow system. Uang Anda aman sampai akun berhasil di-transfer.'
    },
    {
      icon: Clock,
      title: 'Proses Cepat',
      description: 'Evaluasi akun dalam 24 jam, pembayaran langsung setelah akun berhasil dijual.'
    },
    {
      icon: Star,
      title: 'Support Profesional',
      description: 'Tim profesional siap membantu proses jual akun dari awal hingga selesai.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Hubungi Admin',
      description: 'Klik tombol WhatsApp untuk menghubungi admin dengan detail akun Anda.'
    },
    {
      number: '02',
      title: 'Evaluasi Akun',
      description: 'Tim kami akan mengevaluasi akun dan memberikan estimasi harga terbaik.'
    },
    {
      number: '03',
      title: 'Konfirmasi Deal',
      description: 'Setujui harga dan syarat, kemudian akun akan diproses untuk dijual.'
    },
    {
      number: '04',
      title: 'Terima Pembayaran',
      description: 'Dapatkan pembayaran langsung setelah akun berhasil terjual ke pembeli.'
    }
  ];

  const popularGames = [
    { name: 'Mobile Legends', count: '500+', icon: Gamepad2 },
    { name: 'PUBG Mobile', count: '350+', icon: Smartphone },
    { name: 'Free Fire', count: '300+', icon: Trophy },
    { name: 'Genshin Impact', count: '200+', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Jual Akun Game Anda
              <span className="text-green-600"> dengan Harga Terbaik</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platform terpercaya untuk menjual akun game Anda. Proses mudah, aman, dan harga kompetitif.
              Sudah dipercaya oleh ribuan gamer di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSellAccount}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle size={20} />
                <span>Mulai Jual Akun</span>
              </button>
              <a
                href="#how-it-works"
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                Cara Kerjanya
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Estimasi Harga Akun Anda
            </h2>
            <p className="text-gray-600">
              Isi form di bawah untuk mendapat estimasi harga akun game Anda
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih game...</option>
                  {gameOptions.map(game => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level/Rank Akun
                </label>
                <input
                  type="text"
                  value={accountLevel}
                  onChange={(e) => setAccountLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: Mythic Glory, Conqueror, dll"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Harga (Opsional)
                </label>
                <input
                  type="text"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: Rp 2.000.000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detail Akun
                </label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Skin, hero, item khusus, dll"
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleSellAccount}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <MessageCircle size={20} />
                <span>Hubungi Admin untuk Evaluasi</span>
                <ArrowRight size={20} />
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Admin akan menghubungi Anda untuk evaluasi lebih lanjut
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Jual di JB Alwikobra?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform terpercaya dengan sistem yang aman dan transparan untuk menjual akun game Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Game Paling Laris Dijual
            </h2>
            <p className="text-gray-600">
              Akun game yang paling banyak dicari pembeli di platform kami
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularGames.map((game, index) => {
              const Icon = game.icon;
              return (
                <div key={index} className="bg-gray-50 p-6 rounded-xl text-center hover:bg-green-50 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{game.name}</h3>
                  <p className="text-sm text-gray-600">{game.count} terjual</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Jual Akun di JB Alwikobra
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Proses yang mudah dan aman untuk menjual akun game Anda dalam 4 langkah sederhana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-gray-300" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <Users size={24} />
                <span className="text-3xl font-bold">5000+</span>
              </div>
              <p className="text-green-100">Akun Terjual</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <Star size={24} />
                <span className="text-3xl font-bold">4.9</span>
              </div>
              <p className="text-green-100">Rating Kepuasan</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <Clock size={24} />
                <span className="text-3xl font-bold">24</span>
              </div>
              <p className="text-green-100">Jam Evaluasi</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-white mb-2">
                <CheckCircle size={24} />
                <span className="text-3xl font-bold">100%</span>
              </div>
              <p className="text-green-100">Transaksi Aman</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Siap Menjual Akun Game Anda?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan gamer lainnya yang sudah mempercayakan penjualan akun mereka kepada kami.
            Proses mudah, aman, dan harga terbaik!
          </p>
          <button
            onClick={handleSellAccount}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
          >
            <MessageCircle size={20} />
            <span>Mulai Jual Akun Sekarang</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellPage;
