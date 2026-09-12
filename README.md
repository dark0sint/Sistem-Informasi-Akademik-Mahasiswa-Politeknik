# SIAKAD API — Sistem Informasi Akademik Mahasiswa Politeknik

REST API untuk portal SIAKAD Mahasiswa, dibangun dengan **Node.js + Express**.
Data disimpan dalam file JSON (`src/data/db.json`) sehingga **tidak butuh instalasi
database server terpisah** dan **tidak ada dependency native** — cocok untuk
deploy cepat ke VPS/shared hosting yang mendukung Node.js.

> Catatan: untuk skala produksi besar (ribuan mahasiswa/concurrent write tinggi),
> disarankan migrasi layer `src/db.js` ke PostgreSQL/MySQL. Kontrak fungsinya
> (`findOne`, `findMany`, `insert`, `updateById`, dst) sudah didesain agar mudah diganti.

## Fitur

| Modul | Deskripsi |
|---|---|
| **Autentikasi & Akun** | Login (JWT), lihat profil akun, ganti password |
| **Portal Profil & Biodata** | Data diri mahasiswa, riwayat status keaktifan, update kontak |
| **KRS Online** | Lihat mata kuliah tersedia, ambil/batalkan MK, cek bentrok jadwal & batas SKS otomatis, submit KRS |
| **Jadwal Kuliah** | Jadwal berdasarkan KRS yang disetujui, terurut per hari |
| **KHS & Transkrip** | Nilai per semester, IPS, IPK, transkrip lengkap |
| **Manajemen Keuangan** | Status tagihan SPP, riwayat cicilan/pembayaran |
| **Akademik & Bimbingan** | Bimbingan akademik (PA), Kerja Praktek/KKN, pengajuan Tugas Akhir |
| **Pengumuman & Notifikasi** | Pengumuman kampus (dengan target audiens), notifikasi real-time per mahasiswa |

## Struktur Proyek

```
siakad-api/
├── package.json
├── .env.example
├── src/
│   ├── server.js          # entry point
│   ├── app.js             # setup express & middleware
│   ├── config.js          # baca environment variable
│   ├── db.js              # layer data (JSON file)
│   ├── seed.js            # data awal/demo
│   ├── data/db.json        # (dibuat otomatis, JANGAN dihapus di production)
│   ├── middleware/
│   │   ├── auth.js         # verifikasi JWT & role
│   │   └── error.js
│   ├── controllers/        # logika bisnis tiap modul
│   └── routes/             # definisi endpoint
```

## Instalasi & Menjalankan di Server

### 1. Prasyarat
- Node.js versi **18 atau lebih baru**
- npm

### 2. Setup

```bash
# Ekstrak/clone project, lalu masuk ke folder
cd siakad-api

# Install dependency
npm install

# Salin file environment lalu sesuaikan (WAJIB ganti JWT_SECRET!)
cp .env.example .env
nano .env

# Generate data awal/demo (WAJIB dijalankan sekali di awal)
npm run seed
```

### 3. Menjalankan

```bash
# Mode biasa
npm start

# Mode development (auto-restart saat file berubah)
npm run dev
```

Secara default API berjalan di `http://localhost:3000`. Cek kesehatan server via:

```bash
curl http://localhost:3000/health
```

### 4. Menjalankan Permanen di Server (disarankan: PM2)

```bash
npm install -g pm2
pm2 start src/server.js --name siakad-api
pm2 save
pm2 startup   # ikuti instruksi yang muncul agar auto-start saat server reboot
```

### 5. Reverse Proxy dengan Nginx (opsional, disarankan untuk production)

```nginx
server {
    listen 80;
    server_name siakad.contoh-politeknik.ac.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Lalu aktifkan HTTPS dengan Certbot: `sudo certbot --nginx -d siakad.contoh-politeknik.ac.id`

## Akun Demo (hasil `npm run seed`)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Mahasiswa | `2201010001` | `mhs123` |
| Mahasiswa | `2201010002` | `mhs123` |

⚠️ **Ganti/hapus akun demo ini sebelum go-live**, dan pastikan `JWT_SECRET` di `.env` diubah menjadi string acak yang kuat.

## Autentikasi

Semua endpoint (kecuali `/api/auth/login`) membutuhkan header:

```
Authorization: Bearer <token>
```

Token didapat dari response `POST /api/auth/login`.

## Ringkasan Endpoint

### Auth
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/login` | Login, body: `{ username, password }` |
| GET | `/api/auth/me` | Info akun yang sedang login |
| PUT | `/api/auth/change-password` | body: `{ password_lama, password_baru }` |

### Profil & Biodata
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/profile` | Biodata + info dosen PA |
| PUT | `/api/profile` | Update `email`, `no_hp`, `alamat`, `foto` |
| GET | `/api/profile/riwayat-status` | Riwayat status keaktifan per semester |

### KRS Online
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/krs/mata-kuliah-tersedia?semester=&tahun_ajaran=` | Daftar kelas yang bisa diprogram |
| GET | `/api/krs?semester=&tahun_ajaran=` | KRS semester aktif mahasiswa |
| POST | `/api/krs` | Ambil kelas, body: `{ kelas_id }` (auto cek bentrok & batas SKS) |
| DELETE | `/api/krs/:id` | Batalkan MK (hanya status "Diambil") |
| POST | `/api/krs/submit` | Finalisasi KRS (Diambil → Diajukan) |
| GET | `/api/krs/riwayat` | Riwayat KRS seluruh semester |

### Jadwal Kuliah
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/jadwal?semester=&tahun_ajaran=` | Jadwal berdasarkan KRS disetujui/diajukan |

### KHS & Transkrip
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/khs?semester=&tahun_ajaran=` | Nilai & IPS semester tertentu |
| GET | `/api/khs/transkrip` | Transkrip lengkap + IPK |

### Keuangan
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/keuangan/tagihan` | Semua tagihan + sisa tagihan |
| GET | `/api/keuangan/tagihan/:id` | Detail 1 tagihan + riwayat bayar |
| GET | `/api/keuangan/riwayat-pembayaran` | Riwayat pembayaran (flat list) |

### Akademik & Bimbingan
| Method | Endpoint | Keterangan |
|---|---|---|
| GET/POST | `/api/akademik/bimbingan` | Riwayat & pengajuan bimbingan PA |
| GET/POST | `/api/akademik/kkn-kp` | Riwayat & pengajuan KP/KKN |
| GET/POST | `/api/akademik/tugas-akhir` | Status & pengajuan judul TA |

### Pengumuman & Notifikasi
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/pengumuman?kategori=` | Daftar pengumuman (sesuai target mahasiswa) |
| GET | `/api/pengumuman/:id` | Detail pengumuman |
| POST | `/api/pengumuman` | *(admin)* Buat pengumuman baru |
| GET | `/api/notifikasi` | Daftar notifikasi + jumlah belum dibaca |
| PUT | `/api/notifikasi/:id/read` | Tandai 1 notifikasi dibaca |
| PUT | `/api/notifikasi/read-all` | Tandai semua notifikasi dibaca |

## Contoh Request

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"2201010001","password":"mhs123"}'

# Ambil profil (pakai token dari hasil login)
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <TOKEN>"

# Ambil mata kuliah di KRS
curl -X POST http://localhost:3000/api/krs \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"kelas_id": 1}'
```

## Catatan Keamanan Production
1. Ganti `JWT_SECRET` dengan nilai acak & rahasia.
2. Jalankan di balik HTTPS (via Nginx + Certbot).
3. Backup rutin file `src/data/db.json`.
4. Pertimbangkan migrasi ke database relasional bila jumlah mahasiswa besar atau butuh akses konkuren tinggi.
5. Hapus/nonaktifkan akun demo sebelum go-live.
