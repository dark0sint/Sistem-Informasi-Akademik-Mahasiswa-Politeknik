const db = require('../db');
const { ok, fail } = require('../utils/helpers');

function enrichTagihan(t) {
  const pembayaran = db.findMany('pembayaran', (p) => p.tagihan_id === t.id);
  const totalDibayar = pembayaran.reduce((sum, p) => sum + p.jumlah_bayar, 0);
  return {
    ...t,
    total_dibayar: totalDibayar,
    sisa_tagihan: t.jumlah - totalDibayar,
    riwayat_pembayaran: pembayaran
  };
}

/** GET /api/keuangan/tagihan */
function getTagihan(req, res) {
  const tagihan = db
    .findMany('tagihan', (t) => t.mahasiswa_id === req.user.mahasiswaId)
    .map(enrichTagihan)
    .sort((a, b) => (a.tahun_ajaran + a.semester).localeCompare(b.tahun_ajaran + b.semester));

  return ok(res, tagihan);
}

/** GET /api/keuangan/tagihan/:id */
function getTagihanDetail(req, res) {
  const id = Number(req.params.id);
  const tagihan = db.findOne('tagihan', (t) => t.id === id && t.mahasiswa_id === req.user.mahasiswaId);
  if (!tagihan) return fail(res, 'Tagihan tidak ditemukan', 404);

  return ok(res, enrichTagihan(tagihan));
}

/** GET /api/keuangan/riwayat-pembayaran */
function getRiwayatPembayaran(req, res) {
  const tagihanMilikSaya = db.findMany('tagihan', (t) => t.mahasiswa_id === req.user.mahasiswaId).map((t) => t.id);
  const riwayat = db
    .findMany('pembayaran', (p) => tagihanMilikSaya.includes(p.tagihan_id))
    .sort((a, b) => new Date(b.tanggal_bayar) - new Date(a.tanggal_bayar))
    .map((p) => {
      const tagihan = db.findOne('tagihan', (t) => t.id === p.tagihan_id);
      return { ...p, semester: tagihan?.semester, tahun_ajaran: tagihan?.tahun_ajaran, jenis: tagihan?.jenis };
    });

  return ok(res, riwayat);
}

module.exports = { getTagihan, getTagihanDetail, getRiwayatPembayaran };
