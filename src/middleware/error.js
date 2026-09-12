const { fail } = require('../utils/helpers');

function notFoundHandler(req, res) {
  return fail(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);
  return fail(res, err.message || 'Internal server error', err.status || 500);
}

module.exports = { notFoundHandler, errorHandler };
