import bcrypt from 'bcrypt';
import Joi from 'joi';
import { signToken } from '../../utils/jwt.js';
import { badRequest, unauthorized } from '../../utils/error.js';
import { findUserByEmail, createUser } from './auth.repository.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

export async function registerUser(data) {
  const { error, value } = registerSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const existing = await findUserByEmail(value.email);
  if (existing) {
    throw badRequest('Пользователь с таким email уже существует');
  }

  const hashed = await bcrypt.hash(value.password, 10);

  const user = await createUser({
    name: value.name,
    email: value.email,
    password: hashed,
  });

  const token = signToken({ id: user.id, role: user.role });

  return { user, token };
}

export async function loginUser(data) {
  const { error, value } = loginSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const user = await findUserByEmail(value.email);
  if (!user) {
    throw unauthorized('Неверный email или пароль');
  }

  const match = await bcrypt.compare(value.password, user.password);
  if (!match) {
    throw unauthorized('Неверный email или пароль');
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
    token,
  };
}



