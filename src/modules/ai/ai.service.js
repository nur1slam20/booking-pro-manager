import { getUserBookings } from '../bookings/booking.repository.js';
import { getAllServices } from '../services/service.repository.js';
import { getAllMasters } from '../masters/master.repository.js';
import { getAverageRating } from '../reviews/review.repository.js';

/**
 * AI Recommendation Service
 * Простой алгоритм рекомендаций на основе истории бронирований пользователя
 */
export async function getRecommendationsService(userId) {
  // Получаем историю бронирований пользователя
  const userBookings = await getUserBookings(userId);

  // Если нет истории, возвращаем популярные услуги и мастеров
  if (userBookings.length === 0) {
    const [services, masters] = await Promise.all([
      getAllServices({ page: 1, limit: 10, activeOnly: true }),
      getAllMasters({ page: 1, limit: 5, activeOnly: true }),
    ]);

    // Рекомендуем услугу с лучшим рейтингом или первую доступную
    const recommendedService = services.data[0] || null;

    // Рекомендуем мастера с лучшим рейтингом
    const recommendedMaster = masters.data.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] || null;

    return {
      service: recommendedService,
      master: recommendedMaster,
      time: '10:00', // Дефолтное время
      reason: 'Нет истории бронирований. Рекомендуем популярные услуги.',
    };
  }

  // Анализируем историю
  const completedBookings = userBookings.filter(b => b.status === 'completed');
  
  // Находим самую частую услугу
  const serviceCounts = {};
  const masterCounts = {};
  
  completedBookings.forEach(booking => {
    serviceCounts[booking.service_id] = (serviceCounts[booking.service_id] || 0) + 1;
    if (booking.master_id) {
      masterCounts[booking.master_id] = (masterCounts[booking.master_id] || 0) + 1;
    }
  });

  // Рекомендуем самую частую услугу
  const recommendedServiceId = Object.keys(serviceCounts).sort(
    (a, b) => serviceCounts[b] - serviceCounts[a]
  )[0];

  // Рекомендуем самого частого мастера
  const recommendedMasterId = Object.keys(masterCounts).sort(
    (a, b) => masterCounts[b] - masterCounts[a]
  )[0];

  // Получаем детали
  const { getServiceById } = await import('../services/service.repository.js');
  const { getMasterById } = await import('../masters/master.repository.js');

  const [recommendedService, recommendedMaster] = await Promise.all([
    recommendedServiceId ? getServiceById(Number(recommendedServiceId)) : null,
    recommendedMasterId ? getMasterById(Number(recommendedMasterId)) : null,
  ]);

  // Рекомендуем время на основе истории (самое частое время или утро)
  const timeCounts = {};
  completedBookings.forEach(booking => {
    const hour = booking.time.split(':')[0];
    timeCounts[hour] = (timeCounts[hour] || 0) + 1;
  });

  const recommendedHour = Object.keys(timeCounts).sort(
    (a, b) => timeCounts[b] - timeCounts[a]
  )[0] || '10';

  const recommendedTime = `${recommendedHour.padStart(2, '0')}:00`;

  return {
    service: recommendedService,
    master: recommendedMaster,
    time: recommendedTime,
    reason: 'Рекомендации основаны на вашей истории бронирований.',
    stats: {
      totalBookings: userBookings.length,
      completedBookings: completedBookings.length,
      favoriteService: recommendedService?.title,
      favoriteMaster: recommendedMaster?.name,
    },
  };
}

