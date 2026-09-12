const db = require('../db');
const { ok, fail } = require('../utils/helpers');

/* ---------------- BIMBINGAN AKADEMIK (PA) ---------------- */

/** GET /api/akademik/bimbingan */
function getBimbingan(req, res) {
  const list = db
    .findMany('bimbingan', (b) => b.mahasiswa_id === req.user.mahasiswaId)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .map((b) => {
      const dosen = db.findOne('dosen', (d) => d.id === b.dosen_pa_id);
      return { ...b, dosen_pa: dosen ? dosen.nama : null };
    });

  return ok(res, list);
}

/** POST /api/akademik/bimbingan — mahasiswa mengajukan sesi/catatan bimbingan baru */
function ajukanBimbingan(req, res) {
  const { topik, tanggal, semester, tahun_ajaran } = req.body;
  if (!topik || !tanggal) return fail(res, 'topik dan tanggal wajib diisi', 400);

  const mahasiswa = db.findOne('mahasiswa', (m) => m.id === req.user.mahasiswaId);
  if (!mahasiswa || !mahasiswa.dosen_pa_id) return fail(res, 'Dosen PA belum ditentukan untuk mahasiswa ini', 400);

  const baru = db.insert('bimbingan', {
    mahasiswa_id: req.user.mahasiswaId,
    dosen_pa_id: mahasiswa.dosen_pa_id,
    tanggal,
    semester: semester || null,
    tahun_ajaran: tahun_ajaran || null,
    topik,
    catatan_dosen: null,
    status: 'Menunggu'
  });

  return ok(res, baru, 'Pengajuan bimbingan akademik berhasil dikirim', 201);
}

/* ---------------- KERJA PRAKTEK / KKN ---------------- */

/** GET /api/akademik/kkn-kp */
function getKknKp(req, res) {
  const list = db
    .findMany('kkn_kp', (k) => k.mahasiswa_id === req.user.mahasiswaId)
    .map((k) => {
      const dosen = db.findOne('dosen', (d) => d.id === k.dosen_pembimbing_id);
      return { ...k, dosen_pembimbing: dosen ? dosen.nama : null };
    });

  return ok(res, list);
}

/** POST /api/akademik/kkn-kp — pengajuan KP/KKN baru */
function ajukanKknKp(req, res) {
  const { jenis, lokasi, tanggal_mulai, tanggal_selesai } = req.body;
  if (!jenis || !lokasi || !tanggal_mulai) {
    return fail(res, 'jenis, lokasi, dan tanggal_mulai wajib diisi', 400);
  }
  if (!['Kerja Praktek', 'KKN'].includes(jenis)) {
    return fail(res, 'jenis harus "Kerja Praktek" atau "KKN"', 400);
  }

  const sedangBerjalan = db.findOne(
    'kkn_kp',
    (k) => k.mahasiswa_id === req.user.mahasiswaId && ['Diajukan', 'Berjalan'].includes(k.status)
  );
  if (sedangBerjalan) return fail(res, 'Anda masih memiliki pengajuan KP/KKN yang sedang berjalan', 409);

  const baru = db.insert('kkn_kp', {
    mahasiswa_id: req.user.mahasiswaId,
    jenis,
    lokasi,
    dosen_pembimbing_id: null,
    tanggal_mulai,
    tanggal_selesai: tanggal_selesai || null,
    status: 'Diajukan',
    nilai: null
  });

  return ok(res, baru, 'Pengajuan Kerja Praktek/KKN berhasil dikirim', 201);
}

/* ---------------- TUGAS AKHIR / SKRIPSI ---------------- */

/** GET /api/akademik/tugas-akhir */
function getTugasAkhir(req, res) {
  const list = db
    .findMany('tugas_akhir', (t) => t.mahasiswa_id === req.user.mahasiswaId)
    .map((t) => {
      const pemb1 = db.findOne('dosen', (d) => d.id === t.dosen_pembimbing_1);
      const pemb2 = db.findOne('dosen', (d) => d.id === t.dosen_pembimbing_2);
      return { ...t, dosen_pembimbing_1: pemb1 ? pemb1.nama : null, dosen_pembimbing_2: pemb2 ? pemb2.nama : null };
    });

  return ok(res, list);
}

/** POST /api/akademik/tugas-akhir — mengajukan judul tugas akhir baru */
function ajukanTugasAkhir(req, res) {
  const { judul } = req.body;
  if (!judul) return fail(res, 'judul wajib diisi', 400);

  const sedangAktif = db.findOne(
    'tugas_akhir',
    (t) => t.mahasiswa_id === req.user.mahasiswaId && t.status !== 'Ditolak' && t.status !== 'Lulus'
  );
  if (sedangAktif) return fail(res, 'Anda sudah memiliki pengajuan Tugas Akhir yang masih aktif', 409);

  const baru = db.insert('tugas_akhir', {
    mahasiswa_id: req.user.mahasiswaId,
    judul,
    dosen_pembimbing_1: null,
    dosen_pembimbing_2: null,
    status: 'Diajukan',
    tanggal_pengajuan: new Date().toISOString().slice(0, 10),
    tanggal_sidang: null,
    nilai: null
  });

  return ok(res, baru, 'Pengajuan judul Tugas Akhir berhasil dikirim', 201);
}

module.exports = {
  getBimbingan,
  ajukanBimbingan,
  getKknKp,
  ajukanKknKp,
  getTugasAkhir,
  ajukanTugasAkhir
};
