import { useState, useEffect } from 'react';
import { reviewsApi } from '../services/reviews';
import { bookingsApi } from '../services/bookings';
import { authService } from '../services/auth';

function Reviews() {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [bookingsData, reviewsData] = await Promise.all([
        bookingsApi.getMy(),
        reviewsApi.getAll(1, 100),
      ]);

      // Фильтруем завершенные бронирования, на которые еще нет отзыва
      const completed = bookingsData.filter(b => b.status === 'completed');
      const reviewedBookingIds = new Set(reviewsData.data.map(r => r.booking_id));
      const withoutReview = completed.filter(b => !reviewedBookingIds.has(b.id));

      setCompletedBookings(withoutReview);
      setReviews(reviewsData.data || []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewsApi.create({
        bookingId: selectedBooking.id,
        rating: formData.rating,
        comment: formData.comment,
      });
      alert('Отзыв успешно добавлен!');
      setShowReviewForm(false);
      setSelectedBooking(null);
      setFormData({ rating: 5, comment: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка создания отзыва');
    }
  };

  const openReviewForm = (booking) => {
    setSelectedBooking(booking);
    setShowReviewForm(true);
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Отзывы</h2>

      {completedBookings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2">Завершенные бронирования без отзыва:</h3>
          <div className="space-y-2">
            {completedBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{booking.service_title}</p>
                  {booking.master_name && <p className="text-sm text-gray-600">Мастер: {booking.master_name}</p>}
                  <p className="text-sm text-gray-500">{booking.date} в {booking.time}</p>
                </div>
                <button
                  onClick={() => openReviewForm(booking)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Оставить отзыв
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Мои отзывы</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    {review.service_title && (
                      <p className="font-semibold mb-1">{review.service_title}</p>
                    )}
                    {review.master_name && (
                      <p className="text-sm text-gray-600 mb-1">Мастер: {review.master_name}</p>
                    )}
                    {review.comment && <p className="text-gray-700">{review.comment}</p>}
                    {review.is_moderated === false && (
                      <p className="text-sm text-yellow-600 mt-2">⏳ Ожидает модерации</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedBookings.length === 0 && reviews.length === 0 && (
        <p className="text-gray-600">У вас пока нет завершенных бронирований для отзыва</p>
      )}

      {showReviewForm && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Оставить отзыв</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <p className="font-semibold mb-2">{selectedBooking.service_title}</p>
                {selectedBooking.master_name && (
                  <p className="text-sm text-gray-600 mb-2">Мастер: {selectedBooking.master_name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Оценка</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-3xl ${
                        star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Комментарий (необязательно)</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="4"
                  placeholder="Оставьте отзыв о вашем опыте..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;

