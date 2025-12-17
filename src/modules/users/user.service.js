import Joi from 'joi';
import { notFound, forbidden, badRequest } from '../../utils/error.js';
import { findAllUsers, findUserById, updateUser, deleteUserById } from './user.repository.js';

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).allow(null, '').optional(),
});

export async function getAllUsers() {
  return findAllUsers();
}

export async function getUser(id) {
  const user = await findUserById(id);
  if (!user) {
    throw notFound('Пользователь не найден');
  }
  return user;
}

export async function updateUserProfile(userId, data) {
  const { error, value } = updateProfileSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const user = await updateUser(userId, value);
  if (!user) {
    throw notFound('Пользователь не найден');
  }
  return user;
}

export async function removeUser(id) {
  const user = await findUserById(id);
  if (!user) {
    throw notFound('Пользователь не найден');
  }
  await deleteUserById(id);
}



