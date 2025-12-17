import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../services/services';
import { bookingsApi } from '../services/bookings';
import { authService } from '../services/auth';

function Home() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user?.id]); // Зависимость только от user.id, чтобы не перезагружать при каждом рендере

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getAll();
      // Фильтруем только активные услуги
      const activeServices = (response.data || []).filter(s => s.is_active !== false);
      setServices(activeServices);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки услуг. Убедитесь, что backend запущен.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return; // Не загружаем если нет пользователя
    try {
      const statsData = await bookingsApi.getMyStats();
      setStats(statsData);
    } catch (err) {
      // Не логируем ошибки статистики, чтобы не засорять консоль
      if (err.response?.status !== 429) {
        console.error('Ошибка загрузки статистики:', err);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка услуг...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <div>
      {user && stats && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Моя статистика</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
              <p className="text-sm text-gray-600">Всего бронирований</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
              <p className="text-sm text-gray-600">Активных</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
              <p className="text-sm text-gray-600">Ожидают подтверждения</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.completed || 0}</p>
              <p className="text-sm text-gray-600">Завершенных</p>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Наши услуги</h1>
      {services.length === 0 ? (
        <p className="text-gray-600">Услуги пока не добавлены</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
              {service.is_active === false && (
                <div className="mb-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded inline-block">
                  Недоступна
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{service.title}</h2>
              <p className="text-gray-600 mb-4">{service.description || 'Описание отсутствует'}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{service.price} ₸</p>
                  <p className="text-sm text-gray-500">Длительность: {service.duration} мин</p>
                </div>
                {user ? (
                  <Link
                    to="/bookings"
                    state={{ serviceId: service.id }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    style={{ pointerEvents: service.is_active === false ? 'none' : 'auto' }}
                  >
                    {service.is_active === false ? 'Недоступна' : 'Забронировать'}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Войти для бронирования
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;


