const router = require('express').Router();
const ctrl = require('../controllers/akademik.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('mahasiswa'));

router.get('/bimbingan', ctrl.getBimbingan);
router.post('/bimbingan', ctrl.ajukanBimbingan);

router.get('/kkn-kp', ctrl.getKknKp);
router.post('/kkn-kp', ctrl.ajukanKknKp);

router.get('/tugas-akhir', ctrl.getTugasAkhir);
router.post('/tugas-akhir', ctrl.ajukanTugasAkhir);

module.exports = router;
