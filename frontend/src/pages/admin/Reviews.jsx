import { useState, useEffect } from 'react';
import { reviewsApi } from '../../services/reviews';
import { authService } from '../../services/auth';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'moderated', 'pending'
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsApi.getAll(1, 100);
      let filtered = response.data || [];
      
      if (filter === 'moderated') {
        filtered = filtered.filter(r => r.is_moderated === true);
      } else if (filter === 'pending') {
        filtered = filtered.filter(r => r.is_moderated === false);
      }
      
      setReviews(filtered);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
      alert('Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, isModerated) => {
    try {
      await reviewsApi.update(reviewId, { isModerated });
      loadReviews();
      alert(isModerated ? 'Отзыв одобрен' : 'Отзыв отклонен');
    } catch (err) {
      alert('Ошибка модерации отзыва');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      alert('Введите ответ');
      return;
    }

    try {
      await reviewsApi.update(selectedReview.id, { reply: replyText });
      setShowReplyModal(false);
      setReplyText('');
      setSelectedReview(null);
      loadReviews();
      alert('Ответ добавлен');
    } catch (err) {
      alert('Ошибка добавления ответа');
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setShowReplyModal(true);
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка отзывов...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Модерация отзывов</h2>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Все ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ожидают модерации
          </button>
          <button
            onClick={() => setFilter('moderated')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'moderated'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Одобренные
          </button>
        </div>
      </div>

      {/* Список отзывов */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Нет отзывов</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
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
                      {review.user_name || 'Пользователь'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    {review.booking_id && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✓ Проверенный
                      </span>
                    )}
                  </div>

                  {review.service_title && (
                    <p className="font-semibold mb-1">{review.service_title}</p>
                  )}
                  {review.master_name && (
                    <p className="text-sm text-gray-600 mb-2">Мастер: {review.master_name}</p>
                  )}

                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}

                  {/* Ответ на отзыв */}
                  {review.reply ? (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-3">
                      <p className="text-sm font-semibold text-blue-700 mb-1">
                        Ответ {review.reply_by_name || 'администратора'}:
                      </p>
                      <p className="text-gray-700 text-sm">{review.reply}</p>
                      <button
                        onClick={() => openReplyModal(review)}
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        Редактировать ответ
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openReplyModal(review)}
                      className="text-sm text-blue-600 hover:underline mb-3"
                    >
                      Ответить на отзыв
                    </button>
                  )}

                  {/* Статистика полезности */}
                  {(review.helpful_count > 0 || review.not_helpful_count > 0) && (
                    <div className="text-xs text-gray-500 mb-2">
                      👍 {review.helpful_count || 0} полезно • 👎 {review.not_helpful_count || 0} не полезно
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        review.is_moderated
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {review.is_moderated ? 'Одобрен' : 'Ожидает модерации'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Действия */}
              <div className="flex gap-2 mt-4">
                {!review.is_moderated && (
                  <button
                    onClick={() => handleModerate(review.id, true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Одобрить
                  </button>
                )}
                {review.is_moderated && (
                  <button
                    onClick={() => handleModerate(review.id, false)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                  >
                    Отклонить
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Удалить отзыв?')) {
                      reviewsApi.delete(review.id).then(() => {
                        loadReviews();
                        alert('Отзыв удален');
                      }).catch(() => {
                        alert('Ошибка удаления');
                      });
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно для ответа */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Ответить на отзыв</h3>
            <textarea
              className="w-full p-2 border rounded-lg mb-4"
              rows="4"
              placeholder="Введите ответ на отзыв..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedReview(null);
                }}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Отмена
              </button>
              <button
                onClick={handleReply}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {selectedReview.reply ? 'Обновить ответ' : 'Отправить ответ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviews;

