const db = require('../db');
const { ok, fail } = require('../utils/helpers');

function getMahasiswaOr404(req, res) {
  const mahasiswa = db.findOne('mahasiswa', (m) => m.id === req.user.mahasiswaId);
  if (!mahasiswa) {
    fail(res, 'Data mahasiswa tidak ditemukan', 404);
    return null;
  }
  return mahasiswa;
}

/** GET /api/profile */
function getProfile(req, res) {
  const mahasiswa = getMahasiswaOr404(req, res);
  if (!mahasiswa) return;

  const dosenPa = db.findOne('dosen', (d) => d.id === mahasiswa.dosen_pa_id);

  return ok(res, {
    ...mahasiswa,
    dosen_pa: dosenPa ? { id: dosenPa.id, nama: dosenPa.nama, nip: dosenPa.nip } : null
  });
}

/** PUT /api/profile — hanya field kontak yang bisa diubah mandiri oleh mahasiswa */
function updateProfile(req, res) {
  const mahasiswa = getMahasiswaOr404(req, res);
  if (!mahasiswa) return;

  const editable = ['email', 'no_hp', 'alamat', 'foto'];
  const patch = {};
  for (const field of editable) {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  }

  if (Object.keys(patch).length === 0) {
    return fail(res, 'Tidak ada field valid untuk diperbarui (email, no_hp, alamat, foto)', 400);
  }

  const updated = db.updateById('mahasiswa', mahasiswa.id, patch);
  return ok(res, updated, 'Biodata berhasil diperbarui');
}

/** GET /api/profile/riwayat-status */
function getRiwayatStatus(req, res) {
  const mahasiswa = getMahasiswaOr404(req, res);
  if (!mahasiswa) return;

  const riwayat = db
    .findMany('riwayat_status', (r) => r.mahasiswa_id === mahasiswa.id)
    .sort((a, b) => a.semester - b.semester);

  return ok(res, riwayat);
}

module.exports = { getProfile, updateProfile, getRiwayatStatus };
