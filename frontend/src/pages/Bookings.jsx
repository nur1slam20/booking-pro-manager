import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingsApi } from '../services/bookings';
import { servicesApi } from '../services/services';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const serviceIdFromState = location.state?.serviceId;

  const [formData, setFormData] = useState({
    serviceId: serviceIdFromState || '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBookings();
    loadServices();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getMy();
      setBookings(data);
    } catch (err) {
      console.error('Ошибка загрузки бронирований:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await servicesApi.getAll();
      setServices(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await bookingsApi.create(formData);
      setFormData({ serviceId: '', date: '', time: '' });
      loadBookings();
      alert('Бронирование создано успешно!');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания бронирования');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Мои бронирования</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">Создать новое бронирование</h3>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Услуга</label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Выберите услугу</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title} - {service.price} ₸
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Дата</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Время</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Создание...' : 'Создать бронирование'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Список бронирований</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-600">У вас пока нет бронирований</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="font-bold">{booking.service_title || 'Услуга'}</p>
                <p>Дата: {booking.date}</p>
                <p>Время: {booking.time}</p>
                <p className="capitalize">Статус: {booking.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;

