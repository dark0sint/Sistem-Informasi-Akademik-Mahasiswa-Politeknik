const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log('===========================================');
  console.log(' SIAKAD API - Sistem Informasi Akademik');
  console.log(` Server berjalan di port ${config.port}`);
  console.log(` Environment       : ${config.nodeEnv}`);
  console.log(` Semester aktif    : ${config.semesterAktif} ${config.tahunAjaranAktif}`);
  console.log('===========================================');
});

// Graceful shutdown untuk deployment di server (systemd/pm2/docker)
process.on('SIGTERM', () => {
  console.log('SIGTERM diterima, menutup server...');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('SIGINT diterima, menutup server...');
  server.close(() => process.exit(0));
});
