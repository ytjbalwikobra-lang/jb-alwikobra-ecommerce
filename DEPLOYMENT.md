# Deployment Guide - JB Alwikobra E-commerce

## Prerequisites

Sebelum melakukan deployment, pastikan Anda sudah memiliki:

1. **GitHub Repository** - Project sudah di-push ke GitHub
2. **Supabase Account** - Database backend sudah setup
3. **Vercel Account** - Platform deployment
4. **Xendit Account** - Payment gateway (opsional untuk testing)
5. **WhatsApp Business** - Untuk komunikasi

---

## 🗄️ Setup Database (Supabase)

### 1. Buat Project Baru
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik "New project"
3. Isi nama project: `jb-alwikobra-ecommerce`
4. Pilih region terdekat (Singapore untuk Indonesia)
5. Set password yang kuat
6. Klik "Create new project"

### 2. Setup Database Schema
1. Tunggu project selesai dibuat (≈2 menit)
2. Buka **SQL Editor** dari sidebar
3. Copy-paste seluruh content dari file `supabase/migrations/001_initial_schema.sql`
4. Klik **Run** untuk menjalankan migration
5. Pastikan semua tabel berhasil dibuat

### 3. Ambil API Keys
1. Buka **Settings** > **API**
2. Copy **Project URL** dan **anon public key**
3. Simpan untuk konfigurasi environment variables

---

## 🚀 Deployment ke Vercel

### 1. Persiapan Repository
```bash
# Pastikan semua file sudah di-commit
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"New Project"**
3. Import repository dari GitHub
4. Pilih repository `jb-alwikobra-ecommerce`

### 3. Configure Project
1. **Project Name**: `jb-alwikobra-ecommerce`
2. **Framework Preset**: Create React App (auto-detected)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `build` (default)

### 4. Environment Variables
Tambahkan environment variables berikut di Vercel:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# Xendit Configuration (Optional for testing)
REACT_APP_XENDIT_PUBLIC_KEY=xnd_public_test_your_key_here

# WhatsApp Configuration
REACT_APP_WHATSAPP_NUMBER=6281234567890

# Site Configuration
REACT_APP_SITE_NAME=JB Alwikobra
REACT_APP_SITE_URL=https://your-domain.vercel.app
```

### 5. Deploy
1. Klik **"Deploy"**
2. Tunggu proses build selesai (≈3-5 menit)
3. Website akan tersedia di domain Vercel

---

## 🔧 Post-Deployment Setup

### 1. Update Site URL
Setelah deployment berhasil:
1. Copy domain Vercel (contoh: `https://jb-alwikobra-ecommerce.vercel.app`)
2. Update environment variable `REACT_APP_SITE_URL` di Vercel
3. Redeploy untuk apply perubahan

### 2. Custom Domain (Opsional)
Untuk menggunakan domain custom:
1. Beli domain di provider (Namecheap, GoDaddy, dll)
2. Di Vercel Dashboard, buka project > Settings > Domains
3. Tambahkan custom domain
4. Update DNS records sesuai instruksi Vercel
5. Update `REACT_APP_SITE_URL` dengan domain baru

### 3. Test Functionality
Pastikan fitur-fitur berikut berfungsi:
- [x] Loading data produk dari Supabase
- [x] Navigation antar halaman
- [x] WhatsApp integration
- [x] Flash sale countdown timer
- [x] Responsive design
- [x] Form validations

---

## 🔒 Production Security

### 1. Supabase Security
```sql
-- Enable RLS pada tabel sensitif
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy untuk read-only access
CREATE POLICY "Products viewable by everyone" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Flash sales viewable by everyone" 
ON flash_sales FOR SELECT 
USING (true);
```

### 2. Environment Security
- ❌ Jangan commit file `.env` ke repository
- ✅ Gunakan environment variables di Vercel
- ✅ Regenerate API keys secara berkala
- ✅ Monitor usage di Supabase dashboard

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Enable di Project Settings > Analytics
- Monitor performance dan user behavior

### 2. Supabase Monitoring
- Monitor API usage di Dashboard
- Set up alerts untuk unusual activity
- Backup database secara berkala

### 3. Error Tracking (Opsional)
Integrate dengan Sentry untuk error monitoring:
```bash
npm install @sentry/react @sentry/tracing
```

---

## 🔄 Continuous Deployment

Vercel otomatis redeploy ketika:
- Push ke branch `main`
- Merge pull request
- Update environment variables

### Auto-Deploy Workflow
```
1. Developer push code
2. Vercel trigger build
3. Run tests (jika ada)
4. Build production
5. Deploy to live site
6. Notify team (opsional)
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues
1. Check Supabase project status
2. Verify API keys di environment variables
3. Check network connectivity

### WhatsApp Link Issues
1. Verify phone number format (+62...)
2. Test message encoding
3. Check mobile device compatibility

---

## 📞 Support

Jika mengalami masalah deployment:

1. **Check Vercel Logs**: Project > Functions tab
2. **Check Browser Console**: F12 > Console tab
3. **Supabase Logs**: Project > Logs & monitoring
4. **GitHub Issues**: Create issue di repository

---

## 🎯 Next Steps

Setelah deployment berhasil:
- [ ] Setup Google Analytics
- [ ] Configure custom domain
- [ ] Setup monitoring alerts
- [ ] Create backup strategy
- [ ] Plan feature updates
- [ ] Setup staging environment

**🎉 Selamat! Website JB Alwikobra sudah live dan siap digunakan!**
