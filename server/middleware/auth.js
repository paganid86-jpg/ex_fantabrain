import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorizzato' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}

export function authenticateAdmin(req, res, next) {
  if (!process.env.ADMIN_SECRET || req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Accesso negato' });
  }
  next();
}
