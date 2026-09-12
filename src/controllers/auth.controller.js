const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const { ok, fail } = require('../utils/helpers');

/** POST /api/auth/login */
function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return fail(res, 'Username dan password wajib diisi', 400);

  const user = db.findOne('users', (u) => u.username === username);
  if (!user) return fail(res, 'Username atau password salah', 401);

  const match = bcrypt.compareSync(password, user.password);
  if (!match) return fail(res, 'Username atau password salah', 401);

  const payload = { userId: user.id, username: user.username, role: user.role, mahasiswaId: user.mahasiswa_id };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  return ok(res, {
    token,
    user: { id: user.id, username: user.username, nama: user.nama, role: user.role }
  }, 'Login berhasil');
}

/** GET /api/auth/me */
function me(req, res) {
  const user = db.findOne('users', (u) => u.id === req.user.userId);
  if (!user) return fail(res, 'User tidak ditemukan', 404);
  return ok(res, { id: user.id, username: user.username, nama: user.nama, role: user.role });
}

/** PUT /api/auth/change-password */
function changePassword(req, res) {
  const { password_lama, password_baru } = req.body;
  if (!password_lama || !password_baru) {
    return fail(res, 'Password lama dan password baru wajib diisi', 400);
  }
  if (password_baru.length < 6) {
    return fail(res, 'Password baru minimal 6 karakter', 400);
  }

  const user = db.findOne('users', (u) => u.id === req.user.userId);
  if (!user) return fail(res, 'User tidak ditemukan', 404);

  const match = bcrypt.compareSync(password_lama, user.password);
  if (!match) return fail(res, 'Password lama tidak sesuai', 401);

  const hashed = bcrypt.hashSync(password_baru, 10);
  db.updateById('users', user.id, { password: hashed });

  return ok(res, null, 'Password berhasil diubah');
}

module.exports = { login, me, changePassword };
