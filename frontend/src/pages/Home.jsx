import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../services/services';
import { categoriesApi } from '../services/categories';
import { bookingsApi } from '../services/bookings';
import { aiApi } from '../services/ai';
import { authService } from '../services/auth';

function Home() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stats, setStats] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadAiRecommendations();
    }
  }, [user?.id]); // Зависимость только от user.id, чтобы не перезагружать при каждом рендере

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getAll(1, 100, selectedCategory);
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

  const loadAiRecommendations = async () => {
    if (!user) return;
    try {
      const recommendations = await aiApi.getRecommendations();
      setAiRecommendations(recommendations);
    } catch (err) {
      // Тихая ошибка - AI рекомендации не критичны
      console.error('Ошибка загрузки AI рекомендаций:', err);
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
      {/* Призыв к регистрации/входу для неавторизованных пользователей */}
      {!user && (
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Добро пожаловать в Booking Pro!</h2>
              <p className="text-blue-100">
                Зарегистрируйтесь или войдите, чтобы забронировать услуги и отслеживать свои бронирования
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
              >
                Регистрация
              </Link>
              <Link
                to="/login"
                className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors border-2 border-white"
              >
                Войти
              </Link>
            </div>
          </div>
        </div>
      )}

      {user && stats && (
        <div className="mb-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
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

          {aiRecommendations && (
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">🤖 AI Рекомендации</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {aiRecommendations.service && (
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm opacity-90 mb-1">Рекомендуемая услуга</p>
                    <p className="text-lg font-semibold">{aiRecommendations.service.title}</p>
                    <p className="text-sm opacity-75">{aiRecommendations.service.price} ₸</p>
                  </div>
                )}
                {aiRecommendations.master && (
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm opacity-90 mb-1">Рекомендуемый мастер</p>
                    <p className="text-lg font-semibold">{aiRecommendations.master.name}</p>
                    {aiRecommendations.master.rating > 0 && (
                      <p className="text-sm opacity-75">⭐ {aiRecommendations.master.rating.toFixed(1)}</p>
                    )}
                  </div>
                )}
                {aiRecommendations.time && (
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm opacity-90 mb-1">Рекомендуемое время</p>
                    <p className="text-lg font-semibold">{aiRecommendations.time}</p>
                  </div>
                )}
              </div>
              <p className="text-sm mt-4 opacity-90">{aiRecommendations.reason}</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Наши услуги</h1>
        
        {/* Фильтр по категориям */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Все категории
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
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
              {service.category_name && (
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  {service.category_icon && <span>{service.category_icon}</span>}
                  <span>{service.category_name}</span>
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


