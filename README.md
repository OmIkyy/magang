# 🚀 Jurnal Magang Digital SMK (Gamefied Edition)

Aplikasi **Jurnal & Presensi Magang Digital Gamifikasi** untuk Siswa & Guru SMK. Dibuat dengan **React + Vite + Tailwind CSS (Pixel Art Gaming Theme)**, siap dideploy ke **GitHub**, **Supabase**, dan **Vercel**.

---

## 📁 Struktur Folder Proyek

```text
jurnal-magang-smk/
├── supabase/
│   └── schema.sql        # File SQL LENGKAP untuk Supabase SQL Editor
├── src/
│   ├── components/       # Komponen UI Gamifikasi & Form
│   ├── data/             # Mock Data & Preset
│   ├── lib/              # Client Supabase & Utility
│   ├── services/         # Storage Service (Lokal + Supabase Support)
│   ├── App.tsx           # Entry Point Aplikasi
│   └── main.tsx          # React Root
├── public/               # Asset statis
├── vercel.json           # Konfigurasi SPA rewrite untuk Vercel
├── .env.example          # Contoh Variabel Lingkungan / Environment Variables
├── package.json          # Package & Dependensi NPM
└── README.md             # Panduan Cara Deploy
```

---

## 🛠️ PANDUAN DEPLOYMENT (GitHub, Supabase & Vercel)

### 1️⃣ LANGKAH 1: UPLOAD KE GITHUB

1. Buka terminal di folder komputer Anda dan jalankan perintah:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit jurnal magang smk"
   ```
2. Buat repository baru di [GitHub](https://github.com/new).
3. Hubungkan local repository dan push ke GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO.git
   git push -u origin main
   ```

---

### 2️⃣ LANGKAH 2: SETUP SUPABASE DATABASE

1. Buka dashboard [Supabase](https://supabase.com) dan buat **New Project**.
2. Setelah project selesai dibuat, buka menu **SQL Editor** di sidebar kiri.
3. Klik **New Query**.
4. Buka file `supabase/schema.sql` di repository ini, lalu **Copy (Salin) seluruh isinya** dan **Paste (Tempel)** ke dalam SQL Editor Supabase.
5. Klik tombol **Run** (Ctrl + Enter) untuk membuat seluruh Tabel, Index, Policy RLS, dan Data Awal.
6. Masuk ke menu **Project Settings** -> **API** di Supabase, lalu catat:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **anon public key** (contoh: `eyJhbGci...`)

---

### 3️⃣ LANGKAH 3A: DEPLOY KE VERCEL

1. Buka dashboard [Vercel](https://vercel.com) dan klik **Add New** -> **Project**.
2. Import repository GitHub yang baru saja Anda upload.
3. Di bagian **Environment Variables**, tambahkan 2 variabel berikut:
   - `VITE_SUPABASE_URL` = (Project URL Supabase Anda)
   - `VITE_SUPABASE_ANON_KEY` = (anon public key Supabase Anda)
4. Klik **Deploy**.
5. Selesai! Website Jurnal Magang SMK Anda siap digunakan secara online. 🎉

---

### 4️⃣ LANGKAH 3B: DEPLOY KE SERVER NODE.JS / VPS DENGAN PM2

Aplikasi ini dilengkapi backend Node.js Express server (`server.ts`) dan file konfigurasi PM2 (`ecosystem.config.cjs`) siap pakai.

1. **Clone Repository di Server / VPS**:
   ```bash
   git clone https://github.com/USERNAME_ANDA/NAMA_REPO.git
   cd NAMA_REPO
   ```

2. **Install Dependensi & Build Project**:
   ```bash
   npm install
   npm run build
   ```

3. **Jalankan dengan PM2**:
   ```bash
   # Install PM2 jika belum ada
   npm install -g pm2

   # Jalankan aplikasi dengan PM2 cluster
   pm2 start ecosystem.config.cjs

   # Simpan konfigurasi PM2 agar otomatis jalan saat server reboot
   pm2 save
   pm2 startup
   ```

4. **Cek Status & Log PM2**:
   ```bash
   pm2 status
   pm2 logs jurnal-magang-smk
   ```

---

## 🔑 AKUN DEMO DEFAULT

### 🎓 Akun Siswa:
* **Username**: `rahma` | **Password**: `rahma123` (Kelas TKJ)
* **Username**: `ahmad` | **Password**: `ahmad123` (Kelas TKJ)
* **Username**: `siti`  | **Password**: `siti123`  (Kelas DKP)
* **Username**: `budi`  | **Password**: `budi123`  (Kelas RPL)

### 👨‍🏫 Akun Guru Pembimbing:
* **Username**: `guru`   | **Password**: `guru123`
* **Username**: `bu_sri` | **Password**: `sri123`
