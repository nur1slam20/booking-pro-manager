import { Routes, Route, Link, Navigate } from 'react-router-dom';

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Админ-панель</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <nav className="mb-6 flex gap-4 border-b pb-4">
          <Link to="/admin/services" className="text-blue-600 hover:underline">Услуги</Link>
          <Link to="/admin/bookings" className="text-blue-600 hover:underline">Бронирования</Link>
        </nav>
        <Routes>
          <Route index element={<Navigate to="/admin/services" replace />} />
          <Route path="services" element={<div><p>Управление услугами (базовая версия)</p><p>Для полного функционала используйте API напрямую</p></div>} />
          <Route path="bookings" element={<div><p>Управление бронированиями (базовая версия)</p><p>Для полного функционала используйте API напрямую</p></div>} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;

