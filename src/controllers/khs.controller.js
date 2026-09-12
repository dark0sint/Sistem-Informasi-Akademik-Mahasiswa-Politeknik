const db = require('../db');
const config = require('../config');
const { ok, fail } = require('../utils/helpers');

function enrichNilai(n) {
  const matkul = db.findOne('matakuliah', (m) => m.id === n.matakuliah_id);
  return {
    mata_kuliah: matkul ? { kode: matkul.kode, nama: matkul.nama } : null,
    sks: n.sks,
    nilai_angka: n.nilai_angka,
    nilai_huruf: n.nilai_huruf,
    bobot: n.bobot
  };
}

function hitungIp(nilaiList) {
  const totalBobotSks = nilaiList.reduce((sum, n) => sum + n.bobot * n.sks, 0);
  const totalSks = nilaiList.reduce((sum, n) => sum + n.sks, 0);
  return totalSks === 0 ? 0 : Number((totalBobotSks / totalSks).toFixed(2));
}

/** GET /api/khs?semester=&tahun_ajaran= */
function getKhs(req, res) {
  const semester = req.query.semester || config.semesterAktif;
  const tahunAjaran = req.query.tahun_ajaran || config.tahunAjaranAktif;

  const nilaiSemester = db.findMany(
    'nilai',
    (n) => n.mahasiswa_id === req.user.mahasiswaId && n.semester === semester && n.tahun_ajaran === tahunAjaran
  );

  if (nilaiSemester.length === 0) {
    return ok(res, { semester, tahun_ajaran: tahunAjaran, ips: 0, total_sks: 0, mata_kuliah: [] }, 'Belum ada nilai untuk semester ini');
  }

  const ips = hitungIp(nilaiSemester);
  const totalSks = nilaiSemester.reduce((sum, n) => sum + n.sks, 0);

  return ok(res, {
    semester,
    tahun_ajaran: tahunAjaran,
    ips,
    total_sks: totalSks,
    mata_kuliah: nilaiSemester.map(enrichNilai)
  });
}

/** GET /api/khs/transkrip */
function getTranskrip(req, res) {
  const semuaNilai = db.findMany('nilai', (n) => n.mahasiswa_id === req.user.mahasiswaId);

  const grouped = {};
  for (const n of semuaNilai) {
    const key = `${n.tahun_ajaran}-${n.semester}`;
    if (!grouped[key]) grouped[key] = { semester: n.semester, tahun_ajaran: n.tahun_ajaran, nilai: [] };
    grouped[key].nilai.push(n);
  }

  const perSemester = Object.values(grouped)
    .sort((a, b) => (a.tahun_ajaran + a.semester).localeCompare(b.tahun_ajaran + b.semester))
    .map((g) => ({
      semester: g.semester,
      tahun_ajaran: g.tahun_ajaran,
      ips: hitungIp(g.nilai),
      total_sks: g.nilai.reduce((s, n) => s + n.sks, 0),
      mata_kuliah: g.nilai.map(enrichNilai)
    }));

  const ipk = hitungIp(semuaNilai);
  const totalSksLulus = semuaNilai.filter((n) => n.bobot > 0).reduce((s, n) => s + n.sks, 0);

  return ok(res, {
    ipk,
    total_sks_lulus: totalSksLulus,
    per_semester: perSemester
  });
}

module.exports = { getKhs, getTranskrip };
