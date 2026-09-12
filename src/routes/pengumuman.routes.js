const router = require('express').Router();
const ctrl = require('../controllers/pengumuman.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Pengumuman - bisa diakses mahasiswa & admin
router.get('/pengumuman', requireRole('mahasiswa', 'admin'), ctrl.getPengumuman);
router.get('/pengumuman/:id', requireRole('mahasiswa', 'admin'), ctrl.getPengumumanDetail);
router.post('/pengumuman', requireRole('admin'), ctrl.buatPengumuman);

// Notifikasi - khusus mahasiswa
router.get('/notifikasi', requireRole('mahasiswa'), ctrl.getNotifikasi);
router.put('/notifikasi/read-all', requireRole('mahasiswa'), ctrl.tandaiSemuaDibaca);
router.put('/notifikasi/:id/read', requireRole('mahasiswa'), ctrl.tandaiDibaca);

module.exports = router;
