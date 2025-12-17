import { getAllUsers, getUser, removeUser } from './user.service.js';

export async function getUsersController(req, res, next) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUserController(req, res, next) {
  try {
    const user = await getUser(Number(req.params.id));
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserController(req, res, next) {
  try {
    await removeUser(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}



