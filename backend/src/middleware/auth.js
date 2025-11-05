import jwt from 'jsonwebtoken';

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
