import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import AdminServices from './Services';
import AdminBookings from './Bookings';
import AdminUsers from './Users';
import AdminReviews from './Reviews';
import { bookingsApi } from '../../services/bookings';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await bookingsApi.getAdminStats();
      setStats(data);
    } catch (err) {
      // Не логируем 429 ошибки
      if (err.response?.status !== 429) {
        console.error('Ошибка загрузки статистики:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Админ-панель</h2>
      
      {!loading && stats && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Статистика</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.today_bookings || 0}</p>
              <p className="text-sm text-gray-600">Сегодня</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending_bookings || 0}</p>
              <p className="text-sm text-gray-600">Ожидают</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.confirmed_bookings || 0}</p>
              <p className="text-sm text-gray-600">Подтверждено</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.completed_bookings || 0}</p>
              <p className="text-sm text-gray-600">Завершено</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.total_revenue || 0} ₸</p>
              <p className="text-sm text-gray-600">Выручка</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <nav className="mb-6 flex gap-4 border-b pb-4">
          <Link
            to="/admin/services"
            className="text-blue-600 hover:underline font-medium"
          >
            Услуги
          </Link>
          <Link
            to="/admin/bookings"
            className="text-blue-600 hover:underline font-medium"
          >
            Бронирования
          </Link>
              <Link
                to="/admin/users"
                className="text-blue-600 hover:underline font-medium"
              >
                Пользователи
              </Link>
              <Link
                to="/admin/reviews"
                className="text-blue-600 hover:underline font-medium"
              >
                Отзывы
              </Link>
            </nav>
            <Routes>
              <Route index element={<Navigate to="/admin/services" replace />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Routes>
      </div>
    </div>
  );
}

export default Dashboard;

