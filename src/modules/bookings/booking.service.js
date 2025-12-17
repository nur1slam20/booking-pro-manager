import Joi from 'joi';
import { badRequest, notFound, forbidden } from '../../utils/error.js';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} from './booking.repository.js';
import { getServiceById } from '../services/service.repository.js';

const createBookingSchema = Joi.object({
  serviceId: Joi.number().integer().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
});

export async function createBookingService(userId, data) {
  const { error, value } = createBookingSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  const service = await getServiceById(value.serviceId);
  if (!service) {
    throw notFound('Услуга не найдена');
  }

  return createBooking({
    userId,
    serviceId: value.serviceId,
    date: value.date,
    time: value.time,
  });
}

export async function getMyBookingsService(userId) {
  return getUserBookings(userId);
}

export async function getAllBookingsService(query) {
  return getAllBookings({ status: query.status });
}

export async function updateBookingStatusService(id, status) {
  if (!['pending', 'confirmed', 'rejected'].includes(status)) {
    throw badRequest('Недопустимый статус бронирования');
  }

  const booking = await updateBookingStatus(id, status);
  if (!booking) {
    throw notFound('Бронирование не найдено');
  }
  return booking;
}

export async function deleteBookingService(id, currentUser) {
  const booking = await getBookingById(id);
  if (!booking) {
    throw notFound('Бронирование не найдено');
  }

  // Пользователь может удалить только свои, админ — любые
  if (currentUser.role !== 'admin' && booking.user_id !== currentUser.id) {
    throw forbidden('Вы не можете удалить это бронирование');
  }

  await deleteBooking(id);
}



