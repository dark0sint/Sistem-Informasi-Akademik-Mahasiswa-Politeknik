const router = require('express').Router();
const ctrl = require('../controllers/keuangan.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('mahasiswa'));

router.get('/tagihan', ctrl.getTagihan);
router.get('/tagihan/:id', ctrl.getTagihanDetail);
router.get('/riwayat-pembayaran', ctrl.getRiwayatPembayaran);

module.exports = router;
