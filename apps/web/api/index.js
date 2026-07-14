module.exports = (_req, res) => {
  res.statusCode = 503;
  res.end('API not built');
};
