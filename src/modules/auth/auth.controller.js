import { registerUser, loginUser } from './auth.service.js';
import pool from '../../config/database.js';

export async function registerController(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginController(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function profileController(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}



