import { verifyToken } from '../utils/jwt.js';
import { unauthorized, forbidden } from '../utils/error.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(unauthorized('Требуется авторизация'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(unauthorized('Недействительный или истекший токен'));
  }
}

export function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized('Требуется авторизация'));
    }

    if (req.user.role !== requiredRole) {
      return next(forbidden('Недостаточно прав'));
    }

    next();
  };
}



