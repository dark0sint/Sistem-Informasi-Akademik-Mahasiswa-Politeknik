const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../utils/helpers');

/** Memverifikasi token JWT pada header Authorization: Bearer <token> */
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 'Token tidak ditemukan, silakan login kembali', 401);

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload; // { userId, username, role, mahasiswaId }
    next();
  } catch (err) {
    return fail(res, 'Token tidak valid atau kadaluarsa', 401);
  }
}

/** Membatasi akses hanya untuk role tertentu, contoh: requireRole('admin') */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 'Anda tidak memiliki akses untuk aksi ini', 403);
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
