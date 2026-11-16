# Panduan Deploy Aplikasi ABM ke Vercel

Aplikasi ini siap di-deploy ke **Vercel** sebagai aplikasi React + Vite dengan backend **Supabase** (atau Firebase).

## 1. Persiapan Sebelum Deploy
1. Pastikan Anda sudah menjalankan seluruh isi file **`supabase/schema.sql`** di **Supabase Dashboard → SQL Editor** agar tabel `settings`, `students`, dan `counselors` tersedia.
2. Push atau upload proyek ini ke repositori Git (**GitHub**, **GitLab**, atau **Bitbucket**).

## 2. Pengaturan Proyek di Vercel
1. Masuk ke [https://vercel.com/new](https://vercel.com/new) dan pilih repositori proyek ini (**Import**).
2. Pastikan pengaturan build (otomatis terbaca dari `vercel.json`):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## 3. Environment Variables di Vercel
Pada bagian **Environment Variables** sebelum klik **Deploy** (atau melalui **Project Settings → Environment Variables**), tambahkan variabel berikut:

| Key | Value |
| --- | --- |
| `VITE_BACKEND_PROVIDER` | `supabase` |
| `VITE_SUPABASE_URL` | `https://vnzxkbufsqjszhjcxkye.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(Publishable / Anon Key Supabase Anda)* |

> **Penting:** Jangan pernah memasukkan **Secret Key (`sb_secret_...`)** ke Environment Variables berawalan `VITE_` karena variabel `VITE_*` ikut terbaca di browser.

## 4. Deploy & Verifikasi
Klik **Deploy**. Setelah proses build selesai, buka URL produksi Vercel Anda dan uji:
- Halaman depan (Landing Page) memuat profil lembaga.
- Pendaftaran & pengerjaan tes siswa tersimpan ke tabel `students` di Supabase.
- **Portal Admin** & **Portal Guru BK** dapat memantau hasil secara *real-time* serta mengekspor PDF.
