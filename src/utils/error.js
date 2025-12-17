export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFound(message = 'Ресурс не найден') {
  return new AppError(message, 404);
}

export function badRequest(message = 'Некорректные данные') {
  return new AppError(message, 400);
}

export function unauthorized(message = 'Не авторизован') {
  return new AppError(message, 401);
}

export function forbidden(message = 'Доступ запрещен') {
  return new AppError(message, 403);
}

export function errorMiddleware(err, req, res, next) {
  const status = err.statusCode || 500;
  const message =
    err.message || 'Внутренняя ошибка сервера. Попробуйте позже.';

  res.status(status).json({
    status,
    message,
  });
}



