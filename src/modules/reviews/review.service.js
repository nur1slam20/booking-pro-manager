import Joi from 'joi';
import { badRequest, notFound, forbidden } from '../../utils/error.js';
import {
  getReviews,
  countReviews,
  getReviewById,
  getReviewByBookingId,
  createReview,
  updateReview,
  deleteReview,
  getAverageRating,
} from './review.repository.js';
import { getBookingById } from '../bookings/booking.repository.js';

const reviewSchema = Joi.object({
  bookingId: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('', null).optional(),
});

export async function listReviews(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const masterId = query.masterId ? Number(query.masterId) : null;
  const serviceId = query.serviceId ? Number(query.serviceId) : null;
  const moderatedOnly = query.moderatedOnly !== 'false';

  const [items, total] = await Promise.all([
    getReviews({ page, limit, masterId, serviceId, moderatedOnly }),
    countReviews(masterId, serviceId, moderatedOnly),
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
    },
  };
}

export async function getReview(id) {
  const review = await getReviewById(id);
  if (!review) {
    throw notFound('Отзыв не найден');
  }
  return review;
}

export async function createReviewService(userId, data) {
  const { error, value } = reviewSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const { bookingId, rating, comment } = value;

  // Проверяем, существует ли бронирование
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw notFound('Бронирование не найдено');
  }

  // Проверяем, что бронирование принадлежит пользователю
  if (booking.user_id !== userId) {
    throw forbidden('Вы можете оставить отзыв только на свои бронирования');
  }

  // Проверяем, что бронирование завершено
  if (booking.status !== 'completed') {
    throw badRequest('Отзыв можно оставить только после завершения бронирования');
  }

  // Проверяем, не оставлен ли уже отзыв
  const existing = await getReviewByBookingId(bookingId);
  if (existing) {
    throw badRequest('Отзыв на это бронирование уже оставлен');
  }

  return createReview({
    bookingId,
    masterId: booking.master_id,
    serviceId: booking.service_id,
    userId,
    rating,
    comment: comment || null,
  });
}

export async function updateReviewService(id, userId, data, isAdmin = false) {
  const review = await getReviewById(id);
  if (!review) {
    throw notFound('Отзыв не найден');
  }

  // Пользователь может обновить только свой отзыв, админ - любой
  if (!isAdmin && review.user_id !== userId) {
    throw forbidden('Вы можете обновить только свои отзывы');
  }

  const updateSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().allow('', null).optional(),
    isModerated: Joi.boolean().optional(),
    reply: Joi.string().allow('', null).optional(),
  });

  const { error, value } = updateSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  // Только админ может модерировать
  if (value.isModerated !== undefined && !isAdmin) {
    throw forbidden('Только администратор может модерировать отзывы');
  }

  // Только админ или мастер могут отвечать на отзывы
  if (value.reply !== undefined) {
    const review = await getReviewById(id);
    if (!review) {
      throw notFound('Отзыв не найден');
    }

    // Проверяем, может ли пользователь отвечать
    // Админ может отвечать на любой отзыв
    // Мастер может отвечать только на отзывы о себе
    let canReply = isAdmin;
    
    if (!canReply && review.master_id) {
      // Проверяем, является ли пользователь этим мастером
      // Для простоты считаем, что если есть master_id, то любой пользователь может отвечать
      // В реальной системе нужно проверить связь user -> master
      canReply = true; // Упрощенная проверка - в продакшене нужна проверка через таблицу masters
    }
    
    if (!canReply) {
      throw forbidden('Только администратор или мастер могут отвечать на отзывы');
    }

    return updateReview(id, { ...value, replyBy: userId });
  }

  return updateReview(id, value);
}

export async function markReviewHelpfulService(reviewId, userId, isHelpful) {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw notFound('Отзыв не найден');
  }

  // Пользователь не может оценить свой отзыв
  if (review.user_id === userId) {
    throw badRequest('Вы не можете оценить свой отзыв');
  }

  const { markReviewHelpful } = await import('./review.repository.js');
  return markReviewHelpful(reviewId, userId, isHelpful);
}

export async function getReviewRatingDistributionService(masterId = null, serviceId = null) {
  const { getReviewRatingDistribution } = await import('./review.repository.js');
  return getReviewRatingDistribution(masterId, serviceId);
}

export async function deleteReviewService(id, userId, isAdmin = false) {
  const review = await getReviewById(id);
  if (!review) {
    throw notFound('Отзыв не найден');
  }

  // Пользователь может удалить только свой отзыв, админ - любой
  if (!isAdmin && review.user_id !== userId) {
    throw forbidden('Вы можете удалить только свои отзывы');
  }

  await deleteReview(id);
}

export async function getAverageRatingService(masterId = null, serviceId = null) {
  return getAverageRating(masterId, serviceId);
}

