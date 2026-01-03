import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isPathActive = (to) => {
    if (!to) return false;
    if (location.pathname === to) return true;
    return location.pathname.startsWith(`${to}/`);
  };

  const NavDropdown = ({ id, label, items }) => {
    const isOpen = openMenu === id;
    const isActive = items?.some((item) => isPathActive(item.to));

    return (
      <div className="relative">
        <motion.button
          type="button"
          onClick={() => setOpenMenu(isOpen ? null : id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
            isActive
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          {label}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-white/90' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        {isActive && (
          <motion.div
            layoutId="staffActiveTab"
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white/95 shadow-xl overflow-hidden z-50 backdrop-blur-md"
            >
              {items.map((item) => {
                const itemActive = isPathActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpenMenu(null)}
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${
                      itemActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-indigo-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-xl font-extrabold text-white">C</span>
              </motion.div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg sm:text-xl font-extrabold text-gray-900 whitespace-nowrap">Comfort Hub</span>
                <span className="hidden sm:block text-xs text-gray-500 whitespace-nowrap">{t('nav.dashboard')}</span>
              </div>
            </Link>
          </motion.div>

          <div className="flex items-center gap-3 min-w-0">
            <div ref={menuRef} className="hidden lg:flex items-center gap-1 min-w-0">
              <NavDropdown
                id="management"
                label={t('nav.management')}
                items={[
                  { to: '/admin/rooms', label: t('nav.rooms') },
                  { to: '/room-types', label: t('nav.roomTypes') },
                  { to: '/services', label: t('nav.services') }
                ]}
              />
              <NavDropdown
                id="operations"
                label={t('nav.operations')}
                items={[
                  { to: '/dashboard', label: t('nav.dashboard') },
                  { to: '/bookings', label: t('nav.bookings') },
                  { to: '/guests', label: t('nav.guests') },
                  { to: '/payments', label: t('nav.payments') },
                  { to: '/reviews', label: t('nav.reviews') }
                ]}
              />
              <NavDropdown
                id="admin"
                label={t('nav.admin')}
                items={[
                  { to: '/users', label: t('nav.users') },
                  { to: '/reports', label: t('nav.reports') },
                  { to: '/messages', label: t('nav.messages') }
                ]}
              />
            </div>

            <NotificationBell scrolled={scrolled} />
            <LanguageSwitcher variant="dropdown" scrolled={scrolled} />

            <div className="flex items-center gap-2 ml-1">
              <span className="hidden sm:inline text-sm text-gray-700 max-w-[140px] truncate">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 sm:px-4 py-2.5 rounded-lg shadow hover:from-pink-600 hover:to-red-500 transition text-sm font-semibold"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
