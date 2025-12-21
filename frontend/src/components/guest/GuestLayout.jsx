import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGuestAuth } from '../../context/GuestAuthContext';
import toast from 'react-hot-toast';

function GuestLayout({ children }) {
  const { guest, logout } = useGuestAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Tizimdan muvaffaqiyatli chiqdingiz');
      navigate('/guest/login');
    } catch (error) {
      toast.error('Chiqishda xatolik');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/guest/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">🏨 Hotel</span>
                <span className="ml-2 text-sm text-gray-600">Mehmonlar kabineti</span>
              </Link>

              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link
                  to="/guest/dashboard"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/guest/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏠 Bosh sahifa
                </Link>

                <Link
                  to="/guest/my-bookings"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/guest/my-bookings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📋 Mening bronlarim
                </Link>

                <Link
                  to="/guest/book-room"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/guest/book-room')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏨 Xona bron qilish
                </Link>

                <Link
                  to="/guest/profile"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/guest/profile')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 Profilim
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {guest?.first_name} {guest?.last_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  Chiqish
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}

export default GuestLayout;
