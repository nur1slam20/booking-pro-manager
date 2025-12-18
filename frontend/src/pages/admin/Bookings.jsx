import { useState, useEffect } from 'react';
import { bookingsApi } from '../../services/bookings';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getAll();
      setBookings(data || []);
    } catch (err) {
      console.error('Ошибка загрузки бронирований:', err);
      alert('Ошибка загрузки бронирований');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus, adminComment = '') => {
    try {
      const comment = adminComment || prompt('Комментарий (необязательно):');
      await bookingsApi.updateStatus(id, newStatus, comment || null);
      loadBookings();
    } catch (err) {
      alert('Ошибка обновления статуса: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить бронирование?')) return;
    try {
      await bookingsApi.delete(id);
      loadBookings();
    } catch (err) {
      alert('Ошибка удаления бронирования');
    }
  };

  const filteredBookings = filter
    ? bookings.filter((b) => b.status === filter)
    : bookings;

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Управление бронированиями</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Все статусы</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Услуга</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Мастер</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Время</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Комментарий</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.user_name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.service_title || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.master_name || 'Не указан'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : booking.status === 'completed'
                        ? 'bg-purple-100 text-purple-800'
                        : booking.status === 'cancelled'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {booking.admin_comment || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Подтвердить
                      </button>
                      <button
                        onClick={() => handleStatusChange(booking.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Отклонить
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Завершить
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">Нет бронирований</div>
        )}
      </div>
    </div>
  );
}

export default AdminBookings;


