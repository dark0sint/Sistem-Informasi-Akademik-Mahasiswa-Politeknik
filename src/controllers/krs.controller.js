const db = require('../db');
const config = require('../config');
const { ok, fail } = require('../utils/helpers');
const { batasMaksimalSks, isJadwalBentrok } = require('../utils/helpers');

function enrichKelas(kelas) {
  const matkul = db.findOne('matakuliah', (m) => m.id === kelas.matakuliah_id);
  const dosen = db.findOne('dosen', (d) => d.id === kelas.dosen_id);
  const jumlahDiambil = db.findMany('krs', (k) => k.kelas_id === kelas.id && k.status !== 'Dibatalkan').length;
  return {
    ...kelas,
    matakuliah: matkul ? { id: matkul.id, kode: matkul.kode, nama: matkul.nama, sks: matkul.sks } : null,
    dosen: dosen ? { id: dosen.id, nama: dosen.nama } : null,
    kuota_terisi: jumlahDiambil,
    kuota_sisa: kelas.kuota - jumlahDiambil
  };
}

/** Hitung IPS semester terakhir mahasiswa (dipakai untuk batas maksimal SKS). */
function hitungIpsSemesterLalu(mahasiswaId) {
  const semuaNilai = db.findMany('nilai', (n) => n.mahasiswa_id === mahasiswaId);
  if (semuaNilai.length === 0) return null;

  // ambil kombinasi semester+tahun_ajaran terakhir
  const terakhir = [...semuaNilai].sort((a, b) => (a.tahun_ajaran + a.semester).localeCompare(b.tahun_ajaran + b.semester)).pop();
  const nilaiSemesterTerakhir = semuaNilai.filter(
    (n) => n.semester === terakhir.semester && n.tahun_ajaran === terakhir.tahun_ajaran
  );

  const totalBobotSks = nilaiSemesterTerakhir.reduce((sum, n) => sum + n.bobot * n.sks, 0);
  const totalSks = nilaiSemesterTerakhir.reduce((sum, n) => sum + n.sks, 0);
  return totalSks === 0 ? null : Number((totalBobotSks / totalSks).toFixed(2));
}

/** GET /api/krs/mata-kuliah-tersedia */
function getMataKuliahTersedia(req, res) {
  const semester = req.query.semester || config.semesterAktif;
  const tahunAjaran = req.query.tahun_ajaran || config.tahunAjaranAktif;

  const kelasTersedia = db.findMany('kelas', (k) => k.semester === semester && k.tahun_ajaran === tahunAjaran);
  const hasil = kelasTersedia.map(enrichKelas);

  return ok(res, hasil);
}

/** GET /api/krs — KRS semester aktif milik mahasiswa */
function getKrsAktif(req, res) {
  const semester = req.query.semester || config.semesterAktif;
  const tahunAjaran = req.query.tahun_ajaran || config.tahunAjaranAktif;

  const krsList = db.findMany(
    'krs',
    (k) => k.mahasiswa_id === req.user.mahasiswaId && k.semester === semester && k.tahun_ajaran === tahunAjaran && k.status !== 'Dibatalkan'
  );

  const hasil = krsList.map((k) => {
    const kelas = db.findOne('kelas', (kl) => kl.id === k.kelas_id);
    return { krs_id: k.id, status: k.status, kelas: kelas ? enrichKelas(kelas) : null };
  });

  const totalSks = hasil.reduce((sum, h) => sum + (h.kelas?.matakuliah?.sks || 0), 0);

  return ok(res, { semester, tahun_ajaran: tahunAjaran, total_sks: totalSks, mata_kuliah: hasil });
}

/** POST /api/krs — mengambil satu kelas mata kuliah */
function ambilMataKuliah(req, res) {
  const { kelas_id } = req.body;
  if (!kelas_id) return fail(res, 'kelas_id wajib diisi', 400);

  const kelas = db.findOne('kelas', (k) => k.id === Number(kelas_id));
  if (!kelas) return fail(res, 'Kelas tidak ditemukan', 404);

  const semester = kelas.semester;
  const tahunAjaran = kelas.tahun_ajaran;

  // Cek sudah pernah ambil kelas yang sama
  const sudahAmbil = db.findOne(
    'krs',
    (k) => k.mahasiswa_id === req.user.mahasiswaId && k.kelas_id === kelas.id && k.status !== 'Dibatalkan'
  );
  if (sudahAmbil) return fail(res, 'Anda sudah memprogram kelas ini', 409);

  // Cek kuota
  const kelasEnriched = enrichKelas(kelas);
  if (kelasEnriched.kuota_sisa <= 0) return fail(res, 'Kuota kelas sudah penuh', 409);

  // Ambil KRS aktif mahasiswa saat ini untuk cek bentrok jadwal & batas SKS
  const krsAktifSaatIni = db.findMany(
    'krs',
    (k) => k.mahasiswa_id === req.user.mahasiswaId && k.semester === semester && k.tahun_ajaran === tahunAjaran && k.status !== 'Dibatalkan'
  );

  for (const krs of krsAktifSaatIni) {
    const kelasLain = db.findOne('kelas', (kl) => kl.id === krs.kelas_id);
    if (kelasLain && isJadwalBentrok(kelas, kelasLain)) {
      const matkulLain = db.findOne('matakuliah', (m) => m.id === kelasLain.matakuliah_id);
      return fail(res, `Jadwal bentrok dengan mata kuliah "${matkulLain?.nama}" pada hari ${kelasLain.hari}`, 409);
    }
  }

  const matkul = db.findOne('matakuliah', (m) => m.id === kelas.matakuliah_id);
  const totalSksSaatIni = krsAktifSaatIni.reduce((sum, k) => {
    const kl = db.findOne('kelas', (x) => x.id === k.kelas_id);
    const mk = kl ? db.findOne('matakuliah', (m) => m.id === kl.matakuliah_id) : null;
    return sum + (mk?.sks || 0);
  }, 0);

  const ipsLalu = hitungIpsSemesterLalu(req.user.mahasiswaId);
  const batasSks = batasMaksimalSks(ipsLalu);

  if (totalSksSaatIni + matkul.sks > batasSks) {
    return fail(
      res,
      `Melebihi batas maksimal SKS (${batasSks} SKS) berdasarkan IPS terakhir Anda (${ipsLalu ?? 'belum ada'})`,
      409
    );
  }

  const krsBaru = db.insert('krs', {
    mahasiswa_id: req.user.mahasiswaId,
    kelas_id: kelas.id,
    semester,
    tahun_ajaran: tahunAjaran,
    status: 'Diambil'
  });

  return ok(res, krsBaru, 'Mata kuliah berhasil diprogram', 201);
}

/** DELETE /api/krs/:id — membatalkan pengambilan mata kuliah (hanya jika belum submit final) */
function batalkanMataKuliah(req, res) {
  const id = Number(req.params.id);
  const krs = db.findOne('krs', (k) => k.id === id && k.mahasiswa_id === req.user.mahasiswaId);
  if (!krs) return fail(res, 'Data KRS tidak ditemukan', 404);

  if (krs.status !== 'Diambil') {
    return fail(res, 'KRS yang sudah diajukan/disetujui tidak dapat dibatalkan mandiri, hubungi bagian akademik', 409);
  }

  db.updateById('krs', krs.id, { status: 'Dibatalkan' });
  return ok(res, null, 'Mata kuliah berhasil dibatalkan dari KRS');
}

/** POST /api/krs/submit — finalisasi KRS semester aktif (status Diambil -> Diajukan) */
function submitKrs(req, res) {
  const semester = req.body.semester || config.semesterAktif;
  const tahunAjaran = req.body.tahun_ajaran || config.tahunAjaranAktif;

  const krsDiambil = db.findMany(
    'krs',
    (k) => k.mahasiswa_id === req.user.mahasiswaId && k.semester === semester && k.tahun_ajaran === tahunAjaran && k.status === 'Diambil'
  );

  if (krsDiambil.length === 0) {
    return fail(res, 'Tidak ada mata kuliah berstatus "Diambil" untuk diajukan', 400);
  }

  krsDiambil.forEach((k) => db.updateById('krs', k.id, { status: 'Diajukan' }));

  return ok(res, { jumlah_diajukan: krsDiambil.length }, 'KRS berhasil diajukan, menunggu persetujuan dosen PA');
}

/** GET /api/krs/riwayat — riwayat KRS seluruh semester */
function getRiwayatKrs(req, res) {
  const semua = db.findMany('krs', (k) => k.mahasiswa_id === req.user.mahasiswaId && k.status !== 'Dibatalkan');

  const grouped = {};
  for (const k of semua) {
    const key = `${k.tahun_ajaran}-${k.semester}`;
    if (!grouped[key]) grouped[key] = { semester: k.semester, tahun_ajaran: k.tahun_ajaran, mata_kuliah: [] };
    const kelas = db.findOne('kelas', (kl) => kl.id === k.kelas_id);
    grouped[key].mata_kuliah.push({ status: k.status, kelas: kelas ? enrichKelas(kelas) : null });
  }

  return ok(res, Object.values(grouped));
}

module.exports = {
  getMataKuliahTersedia,
  getKrsAktif,
  ambilMataKuliah,
  batalkanMataKuliah,
  submitKrs,
  getRiwayatKrs
};
