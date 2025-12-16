import { useState, useEffect } from 'react';
import { servicesApi } from '../../services/services';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getAll(1, 100);
      setServices(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
      alert('Ошибка загрузки услуг');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await servicesApi.update(editingService.id, {
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          duration: parseInt(formData.duration),
        });
      } else {
        await servicesApi.create({
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          duration: parseInt(formData.duration),
        });
      }
      setShowForm(false);
      setEditingService(null);
      setFormData({ title: '', description: '', price: '', duration: '' });
      loadServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка сохранения услуги');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить услугу?')) return;
    try {
      await servicesApi.delete(id);
      loadServices();
    } catch (err) {
      alert('Ошибка удаления услуги');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Управление услугами</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingService(null);
            setFormData({ title: '', description: '', price: '', duration: '' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Отмена' : '+ Добавить услугу'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h4 className="text-lg font-bold mb-4">
            {editingService ? 'Редактировать услугу' : 'Новая услуга'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Название</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Цена (₸)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Длительность (мин)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {editingService ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Длительность</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{service.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.price} ₸</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.duration} мин</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminServices;

