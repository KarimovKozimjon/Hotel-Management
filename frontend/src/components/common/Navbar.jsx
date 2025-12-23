import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold">
            Mehmonxona Boshqaruv Tizimi
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.dashboard')}
            </Link>
            <Link to="/admin/rooms" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.rooms')}
            </Link>
            <Link to="/bookings" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.bookings')}
            </Link>
            <Link to="/guests" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.guests')}
            </Link>
            <Link to="/payments" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.payments')}
            </Link>
            <Link to="/services" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.services')}
            </Link>
            <Link to="/room-types" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.roomTypes')}
            </Link>
            <Link to="/users" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.users')}
            </Link>
            <Link to="/reviews" className="hover:bg-blue-700 px-3 py-2 rounded">
              {t('nav.reviews')}
            </Link>
            <Link to="/reports" className="hover:bg-blue-700 px-3 py-2 rounded">
              Hisobotlar
            </Link>
            <Link to="/discounts" className="hover:bg-blue-700 px-3 py-2 rounded">
              Chegirmalar
            </Link>
            <Link to="/messages" className="hover:bg-blue-700 px-3 py-2 rounded">
              Xabarlar
            </Link>
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* Language Switcher */}
            <LanguageSwitcher variant="dropdown" />
            
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
