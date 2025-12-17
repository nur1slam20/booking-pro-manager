import { useState, useEffect } from 'react';
import { reviewsApi } from '../services/reviews';
import { bookingsApi } from '../services/bookings';
import { authService } from '../services/auth';

function Reviews() {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });
  const [filter, setFilter] = useState('my'); // 'my' или 'all'
  const [sortBy, setSortBy] = useState('date'); // 'date' или 'rating'
  const [ratingFilter, setRatingFilter] = useState(0); // 0 = все, 1-5 = фильтр по рейтингу
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [bookingsData, myReviewsData, allReviewsData] = await Promise.all([
        bookingsApi.getMy(),
        reviewsApi.getAll(1, 100), // Мои отзывы (фильтруем на frontend)
        reviewsApi.getAll(1, 100, null, null), // Все отзывы (только модерированные)
      ]);

      // Фильтруем завершенные бронирования, на которые еще нет отзыва
      const completed = bookingsData.filter(b => b.status === 'completed');
      const reviewedBookingIds = new Set(myReviewsData.data.map(r => r.booking_id));
      const withoutReview = completed.filter(b => !reviewedBookingIds.has(b.id));

      setCompletedBookings(withoutReview);
      
      // Фильтруем только мои отзывы
      const myReviewsFiltered = myReviewsData.data.filter(r => r.user_id === user?.id);
      setMyReviews(myReviewsFiltered);
      
      // Все модерированные отзывы
      const moderatedReviews = (allReviewsData.data || []).filter(r => r.is_moderated === true);
      setAllReviews(moderatedReviews);
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

  // Фильтрация и сортировка отзывов
  const getFilteredAndSortedReviews = () => {
    const reviewsToShow = filter === 'my' ? myReviews : allReviews;
    
    let filtered = reviewsToShow;
    
    // Фильтр по рейтингу
    if (ratingFilter > 0) {
      filtered = filtered.filter(r => r.rating === ratingFilter);
    }
    
    // Сортировка
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });
    
    return sorted;
  };

  const displayedReviews = getFilteredAndSortedReviews();

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

      {/* Переключатель и фильтры */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('my')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'my'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Мои отзывы ({myReviews.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Все отзывы ({allReviews.length})
            </button>
          </div>

          {filter === 'all' && (
            <>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="date">Сортировка: по дате</option>
                <option value="rating">Сортировка: по рейтингу</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="0">Все рейтинги</option>
                <option value="5">⭐ 5 звезд</option>
                <option value="4">⭐ 4 звезды</option>
                <option value="3">⭐ 3 звезды</option>
                <option value="2">⭐ 2 звезды</option>
                <option value="1">⭐ 1 звезда</option>
              </select>
            </>
          )}
        </div>
      </div>

      {displayedReviews.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">
            {filter === 'my' ? 'Мои отзывы' : 'Все отзывы'}
          </h3>
          <div className="space-y-4">
            {displayedReviews.map((review) => (
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
                    <div className="flex items-center gap-2 mb-2">
                      {review.service_title && (
                        <p className="font-semibold">{review.service_title}</p>
                      )}
                      {review.master_name && (
                        <span className="text-sm text-gray-500">• Мастер: {review.master_name}</span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                    )}
                    {review.is_moderated === false && filter === 'my' && (
                      <p className="text-sm text-yellow-600 mt-2">⏳ Ожидает модерации</p>
                    )}
                    {filter === 'my' && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={async () => {
                            if (confirm('Редактировать отзыв?')) {
                              // Можно добавить редактирование
                              alert('Функция редактирования в разработке');
                            }
                          }}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Удалить отзыв?')) {
                              try {
                                await reviewsApi.delete(review.id);
                                loadData();
                                alert('Отзыв удален');
                              } catch (err) {
                                alert('Ошибка удаления отзыва');
                              }
                            }
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedBookings.length === 0 && displayedReviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 text-lg mb-2">
            {filter === 'my' 
              ? 'У вас пока нет отзывов' 
              : 'Пока нет отзывов в системе'}
          </p>
          {filter === 'my' && completedBookings.length === 0 && (
            <p className="text-sm text-gray-500">
              Завершите бронирование, чтобы оставить отзыв
            </p>
          )}
        </div>
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

