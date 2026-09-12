const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/profile', require('./profile.routes'));
router.use('/krs', require('./krs.routes'));
router.use('/jadwal', require('./jadwal.routes'));
router.use('/khs', require('./khs.routes'));
router.use('/keuangan', require('./keuangan.routes'));
router.use('/akademik', require('./akademik.routes'));
router.use('/', require('./pengumuman.routes')); // sudah punya prefix /pengumuman & /notifikasi sendiri

module.exports = router;
