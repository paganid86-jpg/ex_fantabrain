export function errorHandler(err, req, res, next) {
  console.error(`[${req.method}] ${req.path}`, err.message || err);
  res.status(err.status || 500).json({ error: err.message || 'Errore interno del server' });
}
