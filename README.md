# JB Alwikobra E-commerce

Platform e-commerce untuk jual, beli, dan rental akun game di Indonesia dengan fokus pada kemudahan dan keamanan transaksi.

## 🚀 Fitur Utama

### ✨ Flash Sales
- Sistem flash sale dengan countdown timer real-time
- Diskon hingga 70% untuk produk terpilih
- Integrasi payment gateway Xendit untuk transaksi flash sale
- Form checkout yang wajib diisi: Nama, Email, No. Telepon

### 🎮 Katalog Produk
- Tampilan produk dengan horizontal scroll yang responsif
- Filter berdasarkan game, harga, dan kategori
- Search functionality yang powerful
- Kartu produk yang clean tanpa CTA (CTA hanya di detail page)

### 📱 Halaman Detail Produk
- Informasi lengkap tentang akun game
- CTA untuk pembelian via Xendit payment gateway
- Opsi rental akun dengan varian harga dan durasi
- WhatsApp integration untuk rental dan konsultasi
- Gallery gambar dengan thumbnail navigation
- Trust badges dan review system

### 🏠 Jual Akun
- CTA langsung ke WhatsApp Admin
- Form pre-filled dengan informasi produk
- Link tracking untuk follow-up

### ⚙️ Admin Panel (Coming Soon)
- CRUD operasi untuk produk
- Manajemen flash sales
- Pengaturan opsi rental
- Dashboard analytics

## 🎨 Desain

### Color Scheme
- **Primary**: Pink (#ec4899, #f472b6)
- **Accent**: Hitam (#000000) & Putih (#ffffff)
- **Secondary**: Abu-abu untuk teks dan background

### Style Guidelines
- Clean dan modern design
- Mobile-first responsive approach
- Fokus pada user experience dan kemudahan navigasi
- Consistent spacing dan typography
- Smooth animations dan transitions

## 🛠 Tech Stack

### Frontend
- **React 18** dengan TypeScript
- **Tailwind CSS** untuk styling
- **React Router** untuk navigation
- **Lucide React** untuk icons
- **Axios** untuk HTTP requests

### Backend & Database
- **Supabase** (PostgreSQL) sebagai backend
- **Real-time subscriptions** untuk live updates
- **Row Level Security** untuk data protection

### Payment & Communication
- **Xendit** untuk payment gateway
- **WhatsApp API** untuk komunikasi dan rental booking

### Deployment
- **Vercel** untuk hosting dan continuous deployment
- **GitHub** untuk version control

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+ dan npm
- Account Supabase
- Account Xendit (untuk payment)
- WhatsApp Business account

### 1. Clone Repository
```bash
git clone https://github.com/your-username/jb-alwikobra-ecommerce.git
cd jb-alwikobra-ecommerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase
1. Buat project baru di [Supabase](https://supabase.com)
2. Copy URL dan anon key dari Settings > API
3. Jalankan SQL migration di SQL Editor:
   ```sql
   -- Copy dan paste content dari supabase/migrations/001_initial_schema.sql
   ```
4. Jalankan juga file berikut di SQL Editor untuk RLS & kolom user_id:
   ```sql
   -- Copy dari supabase/migrations/002_enable_rls.sql
   -- Copy dari supabase/migrations/003_add_user_id_to_orders.sql
   ```

### 4. Environment Variables
Buat file `.env.local` di root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_XENDIT_PUBLIC_KEY=your_xendit_public_key
REACT_APP_WHATSAPP_NUMBER=6281234567890
REACT_APP_SITE_NAME=JB Alwikobra
REACT_APP_SITE_URL=http://localhost:3000
```

Tambahkan environment server (di Vercel Project Settings):

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_CALLBACK_TOKEN=optional_shared_token_from_xendit
```

### 5. Start Development Server
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

### 6. Build untuk Production
```bash
npm run build
```

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   └── ProductCard.tsx # Product display card
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── ProductsPage.tsx # Product catalog
│   ├── ProductDetailPage.tsx # Product detail
│   └── OrderHistoryPage.tsx # Order history (login only)
├── services/           # API services
│   ├── supabase.ts     # Supabase client
│   ├── productService.ts # Product API calls
│   ├── paymentService.ts # Xendit invoice client
│   └── authService.ts    # Auth helpers (profile auto-fill)
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
│   └── helpers.ts      # Helper functions
└── App.tsx            # Main app component
```

## 🚀 Deployment ke Vercel

### 1. Persiapan
1. Push code ke GitHub repository
2. Connect Vercel ke GitHub account

### 2. Deploy
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import GitHub repository
4. Set environment variables di Vercel settings
5. Deploy!

### 3. Environment Variables di Vercel
Tambahkan semua environment variables yang sama seperti di `.env.local`:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_XENDIT_PUBLIC_KEY`
- `REACT_APP_WHATSAPP_NUMBER`
- `REACT_APP_SITE_NAME`
- `REACT_APP_SITE_URL` (ganti dengan domain Vercel)

## 🔧 Development

### Database Schema
Database schema lengkap tersedia di `supabase/migrations/001_initial_schema.sql` yang mencakup:
- **products**: Data produk dan akun game
- **rental_options**: Opsi rental untuk setiap produk
- **flash_sales**: Data flash sale dan harga khusus
- **orders**: Riwayat transaksi dan pemesanan

### API Integration

#### Supabase
- Real-time data fetching
- Automatic subscription untuk live updates
- Optimized queries dengan proper indexing

#### Xendit Payment
- Secure payment processing
- Multiple payment methods
- Automatic confirmation handling

#### WhatsApp Integration
- Pre-filled message templates
- Deep linking untuk langsung ke chat
- Product information auto-populated

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Basic e-commerce functionality
- [x] Product catalog dan detail pages
- [x] Flash sales dengan countdown timer
- [x] WhatsApp integration
- [x] Responsive design

### Phase 2
- [ ] Admin dashboard dan CMS
- [ ] User authentication dan profiles
- [ ] Wishlist dan favorites
- [ ] Review dan rating system
- [ ] Advanced search dan filters

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Loyalty program
- [ ] Multi-vendor support
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 📞 Contact

**JB Alwikobra Team**
- Email: admin@jbalwikobra.com
- WhatsApp: +62 812-3456-7890
- Website: [https://jbalwikobra.com](https://jbalwikobra.com)

---

**Made with ❤️ for Indonesian Gamers**
