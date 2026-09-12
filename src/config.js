require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_jangan_dipakai_di_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  nodeEnv: process.env.NODE_ENV || 'development',
  semesterAktif: process.env.SEMESTER_AKTIF || 'Ganjil',
  tahunAjaranAktif: process.env.TAHUN_AJARAN_AKTIF || '2025/2026'
};
