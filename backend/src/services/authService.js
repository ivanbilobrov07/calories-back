const bcrypt = require('bcrypt');
const { prisma } = require('../prisma/client');
const { signToken } = require('../utils/jwt');
const { createAppError } = require('../utils/appError');

const SALT_ROUNDS = 10;

const register = async ({ email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw createAppError('Email already in use', 409);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, name: true, dailyGoalKcal: true }
  });

  const token = signToken(user.id);
  return { token, user };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw createAppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createAppError('Invalid credentials', 401);

  const token = signToken(user.id);
  return { token, user: { id: user.id, email: user.email, name: user.name, dailyGoalKcal: user.dailyGoalKcal } };
};

module.exports = { register, login };
