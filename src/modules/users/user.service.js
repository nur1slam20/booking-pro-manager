import { notFound } from '../../utils/error.js';
import { findAllUsers, findUserById, deleteUserById } from './user.repository.js';

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

export async function removeUser(id) {
  const user = await findUserById(id);
  if (!user) {
    throw notFound('Пользователь не найден');
  }
  await deleteUserById(id);
}


