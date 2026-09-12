const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.get('/me', verifyToken, ctrl.me);
router.put('/change-password', verifyToken, ctrl.changePassword);

module.exports = router;
