import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/errors.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRES = '7d';

export const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    throw new AppError('Email, password and name are required.', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered.', 400);
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
    select: { id: true, email: true, name: true },
  });

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.status(201).json({
    user,
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
