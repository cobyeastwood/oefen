// Overwritten by web:build-api. Tracked so Vercel detects /api.
module.exports = (_req, res) => {
  res.statusCode = 503;
  res.end('API not built');
};
