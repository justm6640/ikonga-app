import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddlewareFactory } from './middleware/auth.js';
import { createNutritionRouter } from './nutrition.routes.js';
import { createFitnessRouter } from './fitness.routes.js';
import { createWellnessRouter } from './wellness.routes.js';

const app = express();
const prisma = new PrismaClient();
const authMiddleware = authMiddlewareFactory({ prisma });
const apiRouter = express.Router();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

const allowedRoles = ['subscriber', 'coach', 'admin'];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.post('/auth/register', async (req, res) => {
  const { email, password, role = 'subscriber', phase_current: phaseCurrent = '' } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role provided.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        phase_current: phaseCurrent,
      },
      select: {
        id: true,
        email: true,
        role: true,
        phase_current: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Unable to register user.' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phase_current: user.phase_current,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Unable to login.' });
  }
});

apiRouter.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

apiRouter.use(createNutritionRouter({ prisma, authMiddleware }));
apiRouter.use(createFitnessRouter({ prisma, authMiddleware }));
apiRouter.use(createWellnessRouter({ prisma, authMiddleware }));

app.use('/api', apiRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend API listening on port ${port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
