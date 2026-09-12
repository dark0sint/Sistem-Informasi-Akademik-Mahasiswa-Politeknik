const router = require('express').Router();
const ctrl = require('../controllers/profile.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('mahasiswa'));

router.get('/', ctrl.getProfile);
router.put('/', ctrl.updateProfile);
router.get('/riwayat-status', ctrl.getRiwayatStatus);

module.exports = router;
