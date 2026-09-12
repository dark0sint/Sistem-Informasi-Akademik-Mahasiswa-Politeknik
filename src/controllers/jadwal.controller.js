const db = require('../db');
const config = require('../config');
const { ok } = require('../utils/helpers');

const URUTAN_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** GET /api/jadwal — jadwal kuliah berdasarkan KRS yang sudah Diajukan/Disetujui */
function getJadwal(req, res) {
  const semester = req.query.semester || config.semesterAktif;
  const tahunAjaran = req.query.tahun_ajaran || config.tahunAjaranAktif;

  const krsAktif = db.findMany(
    'krs',
    (k) =>
      k.mahasiswa_id === req.user.mahasiswaId &&
      k.semester === semester &&
      k.tahun_ajaran === tahunAjaran &&
      ['Diajukan', 'Disetujui'].includes(k.status)
  );

  const jadwal = krsAktif
    .map((k) => {
      const kelas = db.findOne('kelas', (kl) => kl.id === k.kelas_id);
      if (!kelas) return null;
      const matkul = db.findOne('matakuliah', (m) => m.id === kelas.matakuliah_id);
      const dosen = db.findOne('dosen', (d) => d.id === kelas.dosen_id);
      return {
        hari: kelas.hari,
        jam_mulai: kelas.jam_mulai,
        jam_selesai: kelas.jam_selesai,
        ruang: kelas.ruang,
        mata_kuliah: matkul ? { kode: matkul.kode, nama: matkul.nama, sks: matkul.sks } : null,
        dosen: dosen ? dosen.nama : null,
        status_krs: k.status
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const hariDiff = URUTAN_HARI.indexOf(a.hari) - URUTAN_HARI.indexOf(b.hari);
      if (hariDiff !== 0) return hariDiff;
      return a.jam_mulai.localeCompare(b.jam_mulai);
    });

  return ok(res, { semester, tahun_ajaran: tahunAjaran, jadwal });
}

module.exports = { getJadwal };
