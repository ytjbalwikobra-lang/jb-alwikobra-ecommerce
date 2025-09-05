# 🚀 PANDUAN MIGRASI DATABASE MANUAL

## Langkah-langkah Eksekusi Migrasi

### Metode 1: Via Supabase Dashboard (RECOMMENDED)

1. **Buka Supabase Dashboard**
   - Kunjungi: https://app.supabase.com/
   - Login ke akun Anda
   - Pilih project: `supabase-cyan-house` atau `supabase-fuchsia-jacket`

2. **Buka SQL Editor**
   - Di sidebar kiri, klik "SQL Editor"
   - Klik "New query" untuk membuat query baru

3. **Copy dan Execute Migration**
   - Buka file: `/workspaces/jb-alwikobra-ecommerce/supabase/manual_migration.sql`
   - Copy seluruh konten file tersebut
   - Paste ke SQL Editor di Supabase Dashboard
   - Klik "Run" untuk menjalankan migration

4. **Verifikasi Hasil**
   - Check bagian output di bawah query
   - Harus muncul pesan "Migration completed successfully!"
   - Note jumlah tiers, game_titles, dan products yang ter-update

### Metode 2: Via Supabase CLI (jika koneksi berhasil)

1. **Reset Password Database**
   - Buka: https://app.supabase.com/project/[PROJECT_REF]/settings/database
   - Reset database password menjadi: `$#JbAlwikobra2025`
   - Tunggu beberapa menit hingga password ter-update

2. **Link Project Ulang**
   ```bash
   npx supabase link --project-ref xeithuvgldzxnggxadri
   # Masukkan password: $#JbAlwikobra2025
   ```

3. **Deploy Manual Migration**
   ```bash
   npx supabase db push --include-all
   ```

### Metode 3: Individual Migration Files

Jika prefer menjalankan migration satu per satu:

1. **Migration 007** - Buat tabel baru:
   ```sql
   -- Copy dan run isi file: 007_create_tier_and_game_title_tables.sql
   ```

2. **Migration 008** - Update struktur products:
   ```sql
   -- Copy dan run isi file: 008_update_products_table_structure.sql
   ```

3. **Migration 009** - Finalisasi:
   ```sql
   -- Copy dan run isi file: 009_finalize_dynamic_structure.sql
   ```

## ✅ Verifikasi Post-Migration

Setelah migration berhasil, jalankan query ini untuk verifikasi:

```sql
-- Check tabel baru
SELECT 'tiers' as table_name, COUNT(*) as count FROM tiers
UNION ALL
SELECT 'game_titles' as table_name, COUNT(*) as count FROM game_titles
UNION ALL
SELECT 'products_with_details' as table_name, COUNT(*) as count FROM products_with_details;

-- Check foreign key relationships
SELECT 
    p.name,
    t.name as tier_name,
    gt.name as game_title_name
FROM products p
LEFT JOIN tiers t ON p.tier_id = t.id
LEFT JOIN game_titles gt ON p.game_title_id = gt.id
LIMIT 5;
```

## 🎯 Expected Results

Setelah migration berhasil:

- ✅ Tabel `tiers` dengan 3 records (Reguler, Pelajar, Premium)
- ✅ Tabel `game_titles` dengan 5 records (ML, Valorant, Genshin, PUBG, FF)
- ✅ Kolom `tier_id` dan `game_title_id` ditambahkan ke tabel `products`
- ✅ Foreign key constraints ter-setup
- ✅ View `products_with_details` tersedia
- ✅ Sample products baru dengan dynamic relationships

## 🔧 Troubleshooting

### Jika ada error "table already exists":
- Migration script sudah handle dengan `IF NOT EXISTS`
- Tidak masalah, migration akan skip tabel yang sudah ada

### Jika foreign key constraint gagal:
- Check apakah data di products table valid
- Pastikan tier dan game_title columns memiliki nilai yang match

### Jika RLS policy error:
- Drop policy yang existing terlebih dahulu
- Re-run policy creation statements

## 📞 Support

Jika mengalami kendala:
1. Screenshot error message
2. Check Supabase Dashboard logs
3. Verifikasi database password correct
4. Pastikan project reference ID benar

## 🎉 Next Steps

Setelah migration berhasil:
1. Test aplikasi frontend di: `npm start`
2. Verify product cards menampilkan dynamic styling
3. Check filters menggunakan dynamic data
4. Confirm price filters sudah dihapus

---

**Current Migration Status**: Ready to execute
**Recommended Method**: Supabase Dashboard SQL Editor
**File to Execute**: `/supabase/manual_migration.sql`
