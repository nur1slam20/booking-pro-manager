import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mastersApi } from '../services/masters';
import { reviewsApi } from '../services/reviews';

// Компонент для отображения отзывов мастера
function MasterReviews({ masterId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState([]);

  useEffect(() => {
    if (masterId) {
      loadReviews();
      loadRating();
      loadRatingDistribution();
    }
  }, [masterId]);

  const loadReviews = async () => {
    try {
      const response = await reviewsApi.getAll(1, 10, masterId);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRating = async () => {
    try {
      const data = await reviewsApi.getAverageRating(masterId);
      setRating(data);
    } catch (err) {
      console.error('Ошибка загрузки рейтинга:', err);
    }
  };

  const loadRatingDistribution = async () => {
    try {
      const data = await reviewsApi.getRatingDistribution(masterId);
      setRatingDistribution(data);
    } catch (err) {
      console.error('Ошибка загрузки распределения:', err);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Загрузка отзывов...</div>;
  }

  const moderatedReviews = reviews.filter(r => r.is_moderated === true);

  return (
    <div className="mb-4">
      <h4 className="font-bold mb-2">Отзывы:</h4>
      {rating && rating.total_reviews > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <span className="text-2xl text-yellow-500">⭐</span>
              <span className="text-xl font-bold">{Number(rating.average_rating).toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-600">
              ({rating.total_reviews} {rating.total_reviews === 1 ? 'отзыв' : rating.total_reviews < 5 ? 'отзыва' : 'отзывов'})
            </span>
          </div>

          {/* График распределения рейтингов */}
          {ratingDistribution.length > 0 && (
            <div className="mb-3 bg-gray-50 p-3 rounded">
              <p className="text-xs font-semibold mb-2 text-gray-700">Распределение оценок:</p>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const dist = ratingDistribution.find(d => d.rating === star);
                  const count = dist ? dist.count : 0;
                  const percentage = rating.total_reviews > 0 
                    ? (count / rating.total_reviews) * 100 
                    : 0;
                  
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs w-8">{star} ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {moderatedReviews.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {moderatedReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-gray-50 p-3 rounded text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= review.rating ? 'text-yellow-500 text-xs' : 'text-gray-300 text-xs'}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {review.user_name || 'Пользователь'}
                    </span>
                    {review.booking_id && (
                      <span className="text-xs bg-green-100 text-green-700 px-1 rounded">
                        ✓
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 text-xs mb-1">{review.comment}</p>
                  )}
                  {review.reply && (
                    <div className="bg-blue-50 border-l-2 border-blue-400 pl-2 mt-1">
                      <p className="text-xs text-blue-700 font-semibold">Ответ:</p>
                      <p className="text-xs text-gray-600">{review.reply}</p>
                    </div>
                  )}
                  {review.helpful_count > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      👍 {review.helpful_count} {review.helpful_count === 1 ? 'человеку' : 'людям'} полезно
                    </p>
                  )}
                </div>
              ))}
              {moderatedReviews.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  И еще {moderatedReviews.length - 3} {moderatedReviews.length - 3 === 1 ? 'отзыв' : 'отзывов'}...
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Пока нет отзывов</p>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">Пока нет отзывов</p>
      )}
    </div>
  );
}

function Masters() {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState(null);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const response = await mastersApi.getAll(1, 100);
      const mastersList = response.data || [];
      
      // Загружаем рейтинги для каждого мастера
      const mastersWithRatings = await Promise.all(
        mastersList.map(async (master) => {
          try {
            const rating = await reviewsApi.getAverageRating(master.id);
            return { ...master, averageRating: rating };
          } catch (err) {
            return { ...master, averageRating: { average_rating: 0, total_reviews: 0 } };
          }
        })
      );
      
      setMasters(mastersWithRatings);
    } catch (err) {
      console.error('Ошибка загрузки мастеров:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterClick = async (masterId) => {
    try {
      const details = await mastersApi.getDetails(masterId);
      setSelectedMaster(details);
    } catch (err) {
      console.error('Ошибка загрузки деталей мастера:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка мастеров...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Наши мастера</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {masters.map((master) => (
          <div
            key={master.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleMasterClick(master.id)}
          >
            {master.photo && (
              <img
                src={master.photo}
                alt={master.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Master';
                }}
              />
            )}
            <h3 className="text-xl font-bold mb-2">{master.name}</h3>
            {master.bio && <p className="text-gray-600 text-sm mb-2">{master.bio}</p>}
            <div className="flex items-center justify-between">
              <div>
                {master.experience > 0 && (
                  <p className="text-sm text-gray-500">Опыт: {master.experience} лет</p>
                )}
                {master.averageRating?.average_rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{Number(master.averageRating.average_rating).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({master.averageRating.total_reviews} отзывов)
                    </span>
                  </div>
                )}
              </div>
              {master.is_active ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Активен</span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Неактивен</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedMaster && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">{selectedMaster.name}</h3>
              <button
                onClick={() => setSelectedMaster(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedMaster.photo && (
              <img
                src={selectedMaster.photo}
                alt={selectedMaster.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Master';
                }}
              />
            )}

            {selectedMaster.bio && (
              <p className="text-gray-700 mb-4">{selectedMaster.bio}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Опыт</p>
                <p className="text-lg font-semibold">{selectedMaster.experience} лет</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Рейтинг</p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <p className="text-lg font-semibold">
                    {selectedMaster.rating > 0 ? Number(selectedMaster.rating).toFixed(1) : 'Нет оценок'}
                  </p>
                </div>
              </div>
            </div>

            {selectedMaster.services && selectedMaster.services.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold mb-2">Услуги:</h4>
                <div className="space-y-2">
                  {selectedMaster.services.map((service) => (
                    <div key={service.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">{service.title}</p>
                      <p className="text-sm text-gray-600">{service.price} ₸ • {service.duration} мин</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MasterReviews masterId={selectedMaster.id} />

            <Link
              to="/bookings"
              className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
            >
              Записаться к мастеру
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Masters;

