import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { path: '/dashboard', label: t('nav.dashboard') },
      { path: '/admin/rooms', label: t('nav.rooms') },
      { path: '/bookings', label: t('nav.bookings') },
      { path: '/guests', label: t('nav.guests') },
      { path: '/payments', label: t('nav.payments') },
      { path: '/services', label: t('nav.services') },
      { path: '/room-types', label: t('nav.roomTypes') },
      { path: '/users', label: t('nav.users') },
      { path: '/reviews', label: t('nav.reviews') },
      { path: '/reports', label: t('nav.reports') },
      { path: '/discounts', label: t('nav.discounts') },
      { path: '/messages', label: t('nav.messages') },
    ],
    [t]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-2xl font-bold text-white">C</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Comfort Hub</span>
                <span className="text-xs text-gray-500">{t('admin.roleLabel')}</span>
              </div>
            </Link>
          </motion.div>

          {/* Navigation (scrollable on smaller screens) */}
          <div className="flex-1 mx-6 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {item.label}
                  </motion.div>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="adminActiveNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <LanguageSwitcher variant="dropdown" scrolled={scrolled} />

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
              <span className="text-sm font-semibold text-gray-700 max-w-[160px] truncate">
                {user?.name}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-rose-600 text-white"
              >
                {t('nav.logout')}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
