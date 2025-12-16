import { Routes, Route, Link, Navigate } from 'react-router-dom';
import AdminServices from './Services';
import AdminBookings from './Bookings';
import AdminUsers from './Users';

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Админ-панель</h2>
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
        </nav>
        <Routes>
          <Route index element={<Navigate to="/admin/services" replace />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;

