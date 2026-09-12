/**
 * Jalankan: npm run seed
 * Mengisi ulang database (data/db.json) dengan data awal/demo.
 * HATI-HATI: skrip ini akan MENIMPA seluruh data yang ada.
 */
const bcrypt = require('bcryptjs');
const db = require('./db');

function hash(pw) {
  return bcrypt.hashSync(pw, 10);
}

function run() {
  const data = {
    sequences: {},
    users: [],
    mahasiswa: [],
    dosen: [],
    matakuliah: [],
    kelas: [],
    krs: [],
    nilai: [],
    tagihan: [],
    pembayaran: [],
    bimbingan: [],
    kkn_kp: [],
    tugas_akhir: [],
    pengumuman: [],
    notifikasi: [],
    riwayat_status: []
  };

  let id = (col) => {
    data.sequences[col] = (data.sequences[col] || 0) + 1;
    return data.sequences[col];
  };

  // ---------- DOSEN ----------
  const dosen1 = { id: id('dosen'), nama: 'Dr. Budi Santoso, M.Kom', nip: '198005152005011001', prodi: 'D3 Teknik Informatika' };
  const dosen2 = { id: id('dosen'), nama: 'Siti Aminah, S.Kom., M.T.', nip: '198207202006042002', prodi: 'D3 Teknik Informatika' };
  const dosen3 = { id: id('dosen'), nama: 'Rina Kurniawati, S.T., M.Eng.', nip: '198501012010012003', prodi: 'D3 Teknik Informatika' };
  data.dosen.push(dosen1, dosen2, dosen3);

  // ---------- MAHASISWA ----------
  const mhs1 = {
    id: id('mahasiswa'), nim: '2201010001', nama: 'Ahmad Fahrezi',
    prodi: 'D3 Teknik Informatika', angkatan: 2022, semester_sekarang: 7,
    status_aktif: 'Aktif', email: 'ahmad.fahrezi@mhs.polkam.ac.id',
    no_hp: '081234567890', alamat: 'Jl. Merdeka No. 10, Bandar Lampung',
    foto: null, dosen_pa_id: dosen1.id
  };
  const mhs2 = {
    id: id('mahasiswa'), nim: '2201010002', nama: 'Dewi Lestari',
    prodi: 'D3 Teknik Informatika', angkatan: 2022, semester_sekarang: 7,
    status_aktif: 'Aktif', email: 'dewi.lestari@mhs.polkam.ac.id',
    no_hp: '081298765432', alamat: 'Jl. Sudirman No. 22, Bandar Lampung',
    foto: null, dosen_pa_id: dosen2.id
  };
  data.mahasiswa.push(mhs1, mhs2);

  // ---------- USERS (login) ----------
  data.users.push(
    { id: id('users'), username: 'admin', password: hash('admin123'), role: 'admin', mahasiswa_id: null, nama: 'Administrator SIAKAD' },
    { id: id('users'), username: mhs1.nim, password: hash('mhs123'), role: 'mahasiswa', mahasiswa_id: mhs1.id, nama: mhs1.nama },
    { id: id('users'), username: mhs2.nim, password: hash('mhs123'), role: 'mahasiswa', mahasiswa_id: mhs2.id, nama: mhs2.nama }
  );

  // ---------- RIWAYAT STATUS ----------
  data.riwayat_status.push(
    { id: id('riwayat_status'), mahasiswa_id: mhs1.id, semester: 1, tahun_ajaran: '2022/2023', status: 'Aktif', keterangan: 'Mahasiswa baru' },
    { id: id('riwayat_status'), mahasiswa_id: mhs1.id, semester: 2, tahun_ajaran: '2022/2023', status: 'Aktif', keterangan: '-' },
    { id: id('riwayat_status'), mahasiswa_id: mhs1.id, semester: 3, tahun_ajaran: '2023/2024', status: 'Aktif', keterangan: '-' },
    { id: id('riwayat_status'), mahasiswa_id: mhs1.id, semester: 4, tahun_ajaran: '2023/2024', status: 'Aktif', keterangan: '-' },
    { id: id('riwayat_status'), mahasiswa_id: mhs1.id, semester: 5, tahun_ajaran: '2024/2025', status: 'Aktif', keterangan: '-' },
    { id: id('riwayat_status'), mahasiswa_id: mhs1.id, semester: 6, tahun_ajaran: '2024/2025', status: 'Aktif', keterangan: '-' },
    { id: id('riwayat_status'), mahasiswa_id: mhs1.id, semester: 7, tahun_ajaran: '2025/2026', status: 'Aktif', keterangan: 'Semester berjalan' }
  );

  // ---------- MATA KULIAH ----------
  const mk = [
    { kode: 'IF301', nama: 'Basis Data Lanjut', sks: 3, semester: 5, prodi: 'D3 Teknik Informatika' },
    { kode: 'IF302', nama: 'Pemrograman Web', sks: 3, semester: 5, prodi: 'D3 Teknik Informatika' },
    { kode: 'IF303', nama: 'Jaringan Komputer', sks: 2, semester: 5, prodi: 'D3 Teknik Informatika' },
    { kode: 'IF401', nama: 'Rekayasa Perangkat Lunak', sks: 3, semester: 7, prodi: 'D3 Teknik Informatika' },
    { kode: 'IF402', nama: 'Kecerdasan Buatan', sks: 3, semester: 7, prodi: 'D3 Teknik Informatika' },
    { kode: 'IF403', nama: 'Keamanan Sistem Informasi', sks: 2, semester: 7, prodi: 'D3 Teknik Informatika' },
    { kode: 'IF404', nama: 'Kerja Praktek', sks: 2, semester: 7, prodi: 'D3 Teknik Informatika' },
    { kode: 'IF405', nama: 'Tugas Akhir', sks: 4, semester: 7, prodi: 'D3 Teknik Informatika' }
  ].map((m) => ({ id: id('matakuliah'), ...m }));
  data.matakuliah.push(...mk);

  // ---------- KELAS (semester aktif: Ganjil 2025/2026) ----------
  const semesterAktif = 'Ganjil';
  const tahunAjaranAktif = '2025/2026';
  const kelas = [
    { matakuliah_id: mk[3].id, dosen_id: dosen1.id, hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruang: 'Lab 1', kuota: 35 },
    { matakuliah_id: mk[4].id, dosen_id: dosen2.id, hari: 'Senin', jam_mulai: '10:30', jam_selesai: '13:00', ruang: 'Ruang 2.1', kuota: 35 },
    { matakuliah_id: mk[5].id, dosen_id: dosen3.id, hari: 'Selasa', jam_mulai: '08:00', jam_selesai: '10:00', ruang: 'Lab 2', kuota: 35 },
    { matakuliah_id: mk[6].id, dosen_id: dosen1.id, hari: 'Rabu', jam_mulai: '13:00', jam_selesai: '15:00', ruang: 'Ruang 2.2', kuota: 40 }
  ].map((k) => ({ id: id('kelas'), semester: semesterAktif, tahun_ajaran: tahunAjaranAktif, ...k }));
  data.kelas.push(...kelas);

  // ---------- KRS semester lalu (Genap 2024/2025) - sudah disetujui, ada nilai ----------
  const kelasLalu = [
    { matakuliah_id: mk[0].id, dosen_id: dosen1.id, hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruang: 'Lab 1', kuota: 35 },
    { matakuliah_id: mk[1].id, dosen_id: dosen2.id, hari: 'Selasa', jam_mulai: '08:00', jam_selesai: '10:30', ruang: 'Lab 2', kuota: 35 },
    { matakuliah_id: mk[2].id, dosen_id: dosen3.id, hari: 'Rabu', jam_mulai: '08:00', jam_selesai: '09:40', ruang: 'Ruang 2.1', kuota: 35 }
  ].map((k) => ({ id: id('kelas'), semester: 'Genap', tahun_ajaran: '2024/2025', ...k }));
  data.kelas.push(...kelasLalu);

  const nilaiHuruf = ['A', 'AB', 'B'];
  const bobot = { A: 4, AB: 3.5, B: 3 };
  kelasLalu.forEach((k, idx) => {
    data.krs.push({
      id: id('krs'), mahasiswa_id: mhs1.id, kelas_id: k.id,
      semester: k.semester, tahun_ajaran: k.tahun_ajaran, status: 'Disetujui'
    });
    const matkul = mk.find((m) => m.id === k.matakuliah_id);
    data.nilai.push({
      id: id('nilai'), mahasiswa_id: mhs1.id, kelas_id: k.id, matakuliah_id: k.matakuliah_id,
      semester: k.semester, tahun_ajaran: k.tahun_ajaran,
      nilai_angka: 78 + idx * 5, nilai_huruf: nilaiHuruf[idx], bobot: bobot[nilaiHuruf[idx]], sks: matkul.sks
    });
  });

  // KRS semester berjalan mahasiswa 1 (baru "Diambil", belum submit final)
  data.krs.push({
    id: id('krs'), mahasiswa_id: mhs1.id, kelas_id: kelas[0].id,
    semester: semesterAktif, tahun_ajaran: tahunAjaranAktif, status: 'Diambil'
  });

  // ---------- TAGIHAN & PEMBAYARAN ----------
  const tagihanLalu = {
    id: id('tagihan'), mahasiswa_id: mhs1.id, semester: 'Genap', tahun_ajaran: '2024/2025',
    jenis: 'SPP', jumlah: 4500000, status: 'Lunas', jatuh_tempo: '2025-02-15'
  };
  const tagihanAktif = {
    id: id('tagihan'), mahasiswa_id: mhs1.id, semester: semesterAktif, tahun_ajaran: tahunAjaranAktif,
    jenis: 'SPP', jumlah: 4500000, status: 'Belum Lunas', jatuh_tempo: '2025-09-30'
  };
  data.tagihan.push(tagihanLalu, tagihanAktif);

  data.pembayaran.push(
    { id: id('pembayaran'), tagihan_id: tagihanLalu.id, tanggal_bayar: '2025-01-20', jumlah_bayar: 2000000, metode: 'Virtual Account BNI', keterangan: 'Cicilan 1' },
    { id: id('pembayaran'), tagihan_id: tagihanLalu.id, tanggal_bayar: '2025-02-10', jumlah_bayar: 2500000, metode: 'Virtual Account BNI', keterangan: 'Pelunasan' },
    { id: id('pembayaran'), tagihan_id: tagihanAktif.id, tanggal_bayar: '2025-08-25', jumlah_bayar: 1500000, metode: 'Virtual Account Mandiri', keterangan: 'Cicilan 1' }
  );

  // ---------- BIMBINGAN AKADEMIK ----------
  data.bimbingan.push({
    id: id('bimbingan'), mahasiswa_id: mhs1.id, dosen_pa_id: dosen1.id,
    tanggal: '2025-08-20', semester: semesterAktif, tahun_ajaran: tahunAjaranAktif,
    topik: 'Konsultasi rencana studi semester 7', catatan_dosen: 'Disarankan fokus RPL dan Tugas Akhir', status: 'Selesai'
  });

  // ---------- KKN / KP ----------
  data.kkn_kp.push({
    id: id('kkn_kp'), mahasiswa_id: mhs1.id, jenis: 'Kerja Praktek',
    lokasi: 'PT Teknologi Nusantara', dosen_pembimbing_id: dosen2.id,
    tanggal_mulai: '2025-06-01', tanggal_selesai: '2025-07-31',
    status: 'Selesai', nilai: 'A'
  });

  // ---------- TUGAS AKHIR ----------
  data.tugas_akhir.push({
    id: id('tugas_akhir'), mahasiswa_id: mhs1.id,
    judul: 'Rancang Bangun Sistem Informasi Akademik Berbasis Web pada Politeknik XYZ',
    dosen_pembimbing_1: dosen1.id, dosen_pembimbing_2: dosen3.id,
    status: 'Sedang Bimbingan', tanggal_pengajuan: '2025-08-01', tanggal_sidang: null, nilai: null
  });

  // ---------- PENGUMUMAN ----------
  data.pengumuman.push(
    { id: id('pengumuman'), judul: 'Jadwal Pengisian KRS Semester Ganjil 2025/2026', isi: 'Pengisian KRS dibuka mulai 1 - 10 September 2025 melalui portal SIAKAD.', kategori: 'Akademik', target: 'all', tanggal_terbit: '2025-08-25', penulis: 'BAAK' },
    { id: id('pengumuman'), judul: 'Batas Akhir Pembayaran SPP Semester Ganjil', isi: 'Mahasiswa diwajibkan melunasi SPP paling lambat 30 September 2025 agar dapat mengikuti UTS.', kategori: 'Keuangan', target: 'all', tanggal_terbit: '2025-09-01', penulis: 'BAUK' },
    { id: id('pengumuman'), judul: 'Pendaftaran Sidang Tugas Akhir Periode Ganjil', isi: 'Mahasiswa semester akhir yang telah menyelesaikan bimbingan dapat mendaftar sidang TA mulai 1 November 2025.', kategori: 'Akademik', target: 'angkatan_2022', tanggal_terbit: '2025-09-05', penulis: 'Program Studi' }
  );

  // ---------- NOTIFIKASI ----------
  data.notifikasi.push(
    { id: id('notifikasi'), mahasiswa_id: mhs1.id, judul: 'KRS Belum Final', pesan: 'Anda masih memiliki mata kuliah berstatus "Diambil". Segera lakukan submit KRS.', tipe: 'krs', dibaca: false, created_at: '2025-09-08T08:00:00Z' },
    { id: id('notifikasi'), mahasiswa_id: mhs1.id, judul: 'Tagihan SPP Belum Lunas', pesan: 'Sisa tagihan SPP semester ini sebesar Rp 3.000.000, jatuh tempo 30 September 2025.', tipe: 'keuangan', dibaca: false, created_at: '2025-09-09T08:00:00Z' },
    { id: id('notifikasi'), mahasiswa_id: mhs1.id, judul: 'Jadwal Bimbingan Akademik', pesan: 'Anda telah menyelesaikan sesi bimbingan akademik dengan Dr. Budi Santoso.', tipe: 'akademik', dibaca: true, created_at: '2025-08-20T10:00:00Z' }
  );

  db.resetAll(data);
  console.log('✅ Seed data berhasil dibuat.');
  console.log('---------------------------------------------');
  console.log('Akun demo:');
  console.log('  Admin      -> username: admin       | password: admin123');
  console.log('  Mahasiswa  -> username: 2201010001   | password: mhs123');
  console.log('  Mahasiswa  -> username: 2201010002   | password: mhs123');
  console.log('---------------------------------------------');
}

run();
