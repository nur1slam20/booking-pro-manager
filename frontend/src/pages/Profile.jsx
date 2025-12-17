import { useState, useEffect } from 'react';
import { usersApi } from '../services/users';
import { authService } from '../services/auth';

function Profile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Обновляем данные пользователя из localStorage
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updated = await usersApi.updateProfile(formData);
      setUser(updated);
      // Обновляем в localStorage
      localStorage.setItem('user', JSON.stringify(updated));
      setIsEditing(false);
      setMessage('Профиль успешно обновлен!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Ошибка обновления профиля: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Профиль</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Редактировать
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <p className="text-lg text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400">Email нельзя изменить</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Роль</label>
              <p className="text-lg capitalize">{user?.role}</p>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    phone: user?.phone || '',
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Имя</label>
              <p className="text-lg">{user?.name}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Телефон</label>
              <p className="text-lg">{user?.phone || 'Не указан'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Роль</label>
              <p className="text-lg capitalize">{user?.role}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;


