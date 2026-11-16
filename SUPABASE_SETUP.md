# Panduan Menghubungkan Aplikasi ABM ke Supabase

Aplikasi ini sudah dilengkapi adapter ganda (**Firebase Firestore** & **Supabase PostgreSQL + Realtime**) sehingga seluruh fitur (Landing Page dinamis, Pendaftaran & Tes Siswa, Rapor View-Only, Dasbor Admin, Ekspor PDF, dan Akun Guru BK) dapat langsung berjalan menggunakan **Supabase** tanpa mengubah komponen UI.

## Langkah 1 — Buat Proyek & Jalankan Skrip SQL

1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard) dan buat proyek baru (atau buka proyek yang sudah ada).
2. Buka menu **SQL Editor** -> **New Query**.
3. Salin seluruh isi file `/supabase/schema.sql` dan klik **Run**.
   Skrip tersebut otomatis membuat:
   - Tabel `public.settings` (profil lembaga & pengaturan rilis hasil) beserta data awal default.
   - Tabel `public.students` (biodata, status tes/review, jawaban, skor 7 bakat & 18 minat, serta evaluasi jurusan).
   - Tabel `public.counselors` (akun Guru BK read-only).
   - Publikasi **Supabase Realtime** (`supabase_realtime`) untuk sinkronisasi instan.
   - Kebijakan **Row Level Security (RLS)**.

## Langkah 2 — Masukkan Kredensial Supabase

1. Di Dashboard Supabase, buka **Project Settings** -> **API**.
2. Salin **Project URL** dan **anon / public key**.
3. Masukkan ke file `.env` (atau `.env.local`) di root proyek:
   ```env
   VITE_BACKEND_PROVIDER="supabase"
   VITE_SUPABASE_URL="https://xxxx.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
   ```
   *(Alternatif: Anda juga dapat langsung mengisi nilai `url` dan `anonKey` di file `/src/supabase.ts`.)*

## Langkah 3 — Mode Pemilihan Backend (`VITE_BACKEND_PROVIDER`)

- `auto` *(default)*: Otomatis menggunakan **Supabase** jika `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` terisi; jika kosong maka menggunakan **Firebase Firestore**.
- `supabase`: Mengarahkan seluruh operasi data dan listener real-time ke Supabase.
- `firebase`: Tetap menggunakan Firebase Firestore.
