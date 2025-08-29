# JB Alwikobra E-commerce

Platform e-commerce untuk jual, beli, dan rental akun game di Indonesia.

## 🚀 Fitur Utama

- Flash Sales (Xendit payment)
- Katalog Produk
- Detail Produk (beli/rental/WA)
- Jual Akun (WA)
- Admin Panel (CRUD)

## 🛠 Tech Stack

- React + TypeScript + Tailwind CSS
- Supabase (PostgreSQL)
- Xendit Integration (mock)
- Deployment: Vercel

## 🏃‍♂️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

- Buat project baru di https://supabase.com
- Copy URL dan anon key
- Jalankan SQL migration di SQL Editor (`supabase/migrations/001_initial_schema.sql`)

### 3. Environment Variables

Buat file `.env.local`:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_XENDIT_PUBLIC_KEY=your_xendit_public_key
REACT_APP_WHATSAPP_NUMBER=6281234567890
REACT_APP_SITE_NAME=JB Alwikobra
REACT_APP_SITE_URL=http://localhost:3000
```

### 4. Run Dev Server

```bash
npm start
```

### 5. Deploy ke Vercel

- Hubungkan repo ke Vercel
- Set environment variables
- Deploy!

---
