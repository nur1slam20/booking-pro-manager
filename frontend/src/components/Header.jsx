import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Booking Pro
          </Link>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/bookings" className="hover:underline">Мои бронирования</Link>
                <Link to="/profile" className="hover:underline">Профиль</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:underline">Админ-панель</Link>
                )}
                <button onClick={onLogout} className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">Войти</Link>
                <Link to="/register" className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800">
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;


