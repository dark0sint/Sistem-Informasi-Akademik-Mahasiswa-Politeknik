const router = require('express').Router();
const ctrl = require('../controllers/jadwal.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('mahasiswa'));

router.get('/', ctrl.getJadwal);

module.exports = router;
