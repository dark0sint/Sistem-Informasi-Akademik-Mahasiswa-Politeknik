const router = require('express').Router();
const ctrl = require('../controllers/krs.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('mahasiswa'));

router.get('/mata-kuliah-tersedia', ctrl.getMataKuliahTersedia);
router.get('/riwayat', ctrl.getRiwayatKrs);
router.get('/', ctrl.getKrsAktif);
router.post('/', ctrl.ambilMataKuliah);
router.post('/submit', ctrl.submitKrs);
router.delete('/:id', ctrl.batalkanMataKuliah);

module.exports = router;
