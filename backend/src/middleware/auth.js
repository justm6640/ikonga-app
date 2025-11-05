import jwt from 'jsonwebtoken';

export function createAuthMiddleware(prisma) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be defined');
  }

  return async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        phase_current: user.phase_current,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }

      return res.status(401).json({ message: 'Invalid token' });
export function authMiddlewareFactory({ prisma }) {
  if (!prisma) {
    throw new Error('Prisma client is required to create auth middleware.');
  }

  return async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing.' });
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing.' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          phase_current: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  };
}
