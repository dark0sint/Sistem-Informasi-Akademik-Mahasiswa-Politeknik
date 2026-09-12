const db = require('../db');
const { ok, fail } = require('../utils/helpers');

function targetCocok(pengumuman, mahasiswa) {
  if (pengumuman.target === 'all') return true;
  if (pengumuman.target === `angkatan_${mahasiswa.angkatan}`) return true;
  if (pengumuman.target === mahasiswa.prodi) return true;
  return false;
}

/** GET /api/pengumuman?kategori= */
function getPengumuman(req, res) {
  const mahasiswa = db.findOne('mahasiswa', (m) => m.id === req.user.mahasiswaId);
  const { kategori } = req.query;

  let list = db.all('pengumuman').filter((p) => targetCocok(p, mahasiswa));
  if (kategori) list = list.filter((p) => p.kategori.toLowerCase() === kategori.toLowerCase());

  list = list.sort((a, b) => new Date(b.tanggal_terbit) - new Date(a.tanggal_terbit));
  return ok(res, list);
}

/** GET /api/pengumuman/:id */
function getPengumumanDetail(req, res) {
  const id = Number(req.params.id);
  const pengumuman = db.findOne('pengumuman', (p) => p.id === id);
  if (!pengumuman) return fail(res, 'Pengumuman tidak ditemukan', 404);
  return ok(res, pengumuman);
}

/** POST /api/pengumuman — khusus admin, membuat pengumuman baru */
function buatPengumuman(req, res) {
  const { judul, isi, kategori, target } = req.body;
  if (!judul || !isi) return fail(res, 'judul dan isi wajib diisi', 400);

  const baru = db.insert('pengumuman', {
    judul,
    isi,
    kategori: kategori || 'Umum',
    target: target || 'all',
    tanggal_terbit: new Date().toISOString().slice(0, 10),
    penulis: req.user.username
  });

  return ok(res, baru, 'Pengumuman berhasil dipublikasikan', 201);
}

/** GET /api/notifikasi */
function getNotifikasi(req, res) {
  const list = db
    .findMany('notifikasi', (n) => n.mahasiswa_id === req.user.mahasiswaId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = list.filter((n) => !n.dibaca).length;

  return ok(res, { unread_count: unreadCount, notifikasi: list });
}

/** PUT /api/notifikasi/:id/read */
function tandaiDibaca(req, res) {
  const id = Number(req.params.id);
  const notif = db.findOne('notifikasi', (n) => n.id === id && n.mahasiswa_id === req.user.mahasiswaId);
  if (!notif) return fail(res, 'Notifikasi tidak ditemukan', 404);

  const updated = db.updateById('notifikasi', id, { dibaca: true });
  return ok(res, updated, 'Notifikasi ditandai sudah dibaca');
}

/** PUT /api/notifikasi/read-all */
function tandaiSemuaDibaca(req, res) {
  const list = db.findMany('notifikasi', (n) => n.mahasiswa_id === req.user.mahasiswaId && !n.dibaca);
  list.forEach((n) => db.updateById('notifikasi', n.id, { dibaca: true }));
  return ok(res, { jumlah_ditandai: list.length }, 'Semua notifikasi ditandai sudah dibaca');
}

module.exports = {
  getPengumuman,
  getPengumumanDetail,
  buatPengumuman,
  getNotifikasi,
  tandaiDibaca,
  tandaiSemuaDibaca
};
