const router = require('express').Router();
const ctrl = require('../controllers/khs.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('mahasiswa'));

router.get('/transkrip', ctrl.getTranskrip);
router.get('/', ctrl.getKhs);

module.exports = router;
