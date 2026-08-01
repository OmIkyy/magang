# 🗄️ Supabase SQL Database Schema - Jurnal Magang SMK

Folder ini berisi berkas SQL yang siap digunakan untuk setup database **Supabase SQL Editor**.

## 📄 File:
- `/supabase/schema.sql` : Skrip DDL lengkap untuk membuat tabel `students`, `teachers`, `attendance_records`, `journal_records`, `passwords`, indeks performa, serta default RLS security policies.

---

## 🚀 Cara Memasang di Supabase:

1. Buka Dashboard Proyek Supabase Anda: [https://app.supabase.com](https://app.supabase.com)
2. Masuk ke proyek Anda, lalu klik menu **SQL Editor** di panel sebelah kiri.
3. Klik **New Query** (atau query baru).
4. Salin seluruh isi berkas `/supabase/schema.sql`.
5. Tempel (Paste) ke dalam editor SQL Supabase.
6. Klik tombol **Run** (atau tombol hijau ▶️) di sudut kanan bawah.
7. Semua tabel (`students`, `teachers`, `attendance_records`, `journal_records`, `passwords`) beserta akun default Guru akan langsung dibuat otomatis.

---

## 🔒 Keamanan & Anti-DDoS:
- Semua tabel sudah dilengkapi dengan Row Level Security (RLS) bawaan Supabase.
- Pengindeksan (`CREATE INDEX`) sudah diatur pada kolom utama untuk memastikan performa query sangat cepat dan stabil.
