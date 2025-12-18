import Joi from 'joi';
import { badRequest, notFound, forbidden } from '../../utils/error.js';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  getBookingWithDetails,
  updateBookingStatus,
  updateBookingStatusWithComment,
  deleteBooking,
  checkBookingConflict,
  getUserBookingStats,
  getAdminStats,
  getTodayBookings,
  getBookingStatusHistory,
} from './booking.repository.js';
import { getServiceById } from '../services/service.repository.js';

const createBookingSchema = Joi.object({
  serviceId: Joi.number().integer().required(),
  date: Joi.date().min('now').required(),
  time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
  masterId: Joi.number().integer().allow(null).optional(),
});

export async function createBookingService(userId, data) {
  const { error, value } = createBookingSchema.validate(data);
  if (error) {
    throw badRequest(error.details[0].message);
  }

  // Проверяем, что дата не в прошлом
  const bookingDate = new Date(value.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    throw badRequest('Нельзя бронировать на прошедшую дату');
  }

  const service = await getServiceById(value.serviceId);
  if (!service) {
    throw notFound('Услуга не найдена');
  }

  if (service.is_active === false) {
    throw badRequest('Эта услуга временно недоступна');
  }

  // Если указан мастер, проверяем его доступность
  if (value.masterId) {
    const { checkMasterAvailability } = await import('../masters/master.repository.js');
    const availability = await checkMasterAvailability(value.masterId, value.date, value.time);
    
    if (!availability.available) {
      throw badRequest(availability.reason || 'Мастер недоступен в это время');
    }

    // Проверяем, что мастер работает с этой услугой
    const { getMasterServices } = await import('../masters/master.repository.js');
    const masterServices = await getMasterServices(value.masterId);
    const hasService = masterServices.some(s => s.id === value.serviceId);
    
    if (!hasService) {
      throw badRequest('Этот мастер не предоставляет данную услугу');
    }
  }

  // Проверяем конфликт бронирований
  const hasConflict = await checkBookingConflict(value.date, value.time, value.serviceId, value.masterId);
  if (hasConflict) {
    throw badRequest('Это время уже занято. Выберите другое время.');
  }

  return createBooking({
    userId,
    serviceId: value.serviceId,
    date: value.date,
    time: value.time,
    masterId: value.masterId || null,
  });
}

export async function getMyBookingsService(userId) {
  return getUserBookings(userId);
}

export async function getAllBookingsService(query) {
  return getAllBookings({ status: query.status });
}

export async function updateBookingStatusService(id, status, adminComment = null, changedBy = null) {
  const allowedStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw badRequest('Недопустимый статус бронирования');
  }

  const booking = await getBookingById(id);
  if (!booking) {
    throw notFound('Бронирование не найдено');
  }

  // Валидация переходов статусов
  const validTransitions = {
    pending: ['confirmed', 'rejected', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    rejected: [], // нельзя изменить
    completed: [], // нельзя изменить
    cancelled: [], // нельзя изменить
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw badRequest(`Нельзя изменить статус с "${booking.status}" на "${status}"`);
  }

  return updateBookingStatusWithComment(id, status, adminComment, changedBy);
}

export async function getBookingDetailsService(id, currentUser) {
  const booking = await getBookingWithDetails(id);
  if (!booking) {
    throw notFound('Бронирование не найдено');
  }

  // Пользователь может видеть только свои бронирования, админ - все
  if (currentUser.role !== 'admin' && booking.user_id !== currentUser.id) {
    throw forbidden('У вас нет доступа к этому бронированию');
  }

  const history = await getBookingStatusHistory(id);
  return {
    ...booking,
    statusHistory: history,
  };
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

  // Пользователь может отменить только pending или confirmed
  if (currentUser.role !== 'admin' && !['pending', 'confirmed'].includes(booking.status)) {
    throw badRequest('Нельзя отменить бронирование со статусом ' + booking.status);
  }

  // Если пользователь отменяет, меняем статус на cancelled вместо удаления
  if (currentUser.role !== 'admin' && booking.user_id === currentUser.id) {
    return updateBookingStatusWithComment(id, 'cancelled', 'Отменено пользователем', currentUser.id);
  }

  await deleteBooking(id);
}

export async function getUserBookingStatsService(userId) {
  return getUserBookingStats(userId);
}

export async function getAdminStatsService() {
  const stats = await getAdminStats();
  const todayBookings = await getTodayBookings();
  return {
    ...stats,
    todayBookings,
  };
}



