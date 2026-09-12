// Skala konversi nilai huruf ke bobot (skala umum politeknik 0-4)
const BOBOT_HURUF = {
  A: 4, AB: 3.5, B: 3, BC: 2.5, C: 2, D: 1, E: 0
};

function nilaiAngkaKeHuruf(angka) {
  if (angka >= 85) return 'A';
  if (angka >= 80) return 'AB';
  if (angka >= 70) return 'B';
  if (angka >= 65) return 'BC';
  if (angka >= 55) return 'C';
  if (angka >= 40) return 'D';
  return 'E';
}

function bobotHuruf(huruf) {
  return BOBOT_HURUF[huruf] ?? 0;
}

/** Hitung batas maksimal SKS yang boleh diambil berdasarkan IPS semester lalu (aturan umum SIAKAD). */
function batasMaksimalSks(ipSemesterLalu) {
  if (ipSemesterLalu === null || ipSemesterLalu === undefined) return 20; // mahasiswa baru
  if (ipSemesterLalu >= 3.5) return 24;
  if (ipSemesterLalu >= 3.0) return 22;
  if (ipSemesterLalu >= 2.5) return 20;
  if (ipSemesterLalu >= 2.0) return 18;
  return 15;
}

/** Cek apakah dua jadwal kelas bentrok (hari sama & jam beririsan). */
function isJadwalBentrok(a, b) {
  if (a.hari !== b.hari) return false;
  const [aMulai, aSelesai] = [a.jam_mulai, a.jam_selesai];
  const [bMulai, bSelesai] = [b.jam_mulai, b.jam_selesai];
  return aMulai < bSelesai && bMulai < aSelesai;
}

function ok(res, data, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function fail(res, message = 'Terjadi kesalahan', status = 400, errors = undefined) {
  return res.status(status).json({ success: false, message, errors });
}

module.exports = {
  nilaiAngkaKeHuruf,
  bobotHuruf,
  batasMaksimalSks,
  isJadwalBentrok,
  ok,
  fail
};
