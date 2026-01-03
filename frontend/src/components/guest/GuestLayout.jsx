import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGuestAuth } from '../../context/GuestAuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../common/LanguageSwitcher';

function GuestLayout({ children }) {
  const { t } = useTranslation();
  const { guest, logout } = useGuestAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('guest.logoutSuccess') || 'Tizimdan muvaffaqiyatli chiqdingiz');
      navigate('/guest/login');
    } catch (error) {
      toast.error(t('guest.logoutError') || 'Chiqishda xatolik');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/guest/dashboard', label: t('nav.home') },
    { path: '/guest/my-bookings', label: t('guest.myBookings') },
    { path: '/guest/book-room', label: t('guest.bookRoom') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Navigation */}
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
          <div className="flex justify-between h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Link to="/guest/dashboard" className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-2xl font-bold text-white">C</span>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">Comfort Hub</span>
                  <span className="text-xs text-gray-500">{t('guest.guestPortal')}</span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {/* icon removed */}
                    <span>{item.label}</span>
                  </motion.div>
                  {isActive(item.path) && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side - Profile & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block">
                <LanguageSwitcher variant="dropdown" scrolled={scrolled} />
              </div>

              {/* Profile Dropdown */}
              <div className="relative hidden lg:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {guest?.first_name?.charAt(0)}{guest?.last_name?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {guest?.first_name} {guest?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{guest?.email}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
                    >
                      <Link
                        to="/guest/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors"
                      >
                        <span className="text-xl">👤</span>
                        <span className="text-sm font-medium text-gray-700">{t('guest.profile')}</span>
                      </Link>
                      <Link
                        to="/guest/change-password"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors"
                      >
                        <span className="text-xl">🔒</span>
                        <span className="text-sm font-medium text-gray-700">{t('guest.changePassword')}</span>
                      </Link>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 px-4 py-3 w-full hover:bg-red-50 transition-colors text-red-600"
                        >
                          <span className="text-xl">🚪</span>
                          <span className="text-sm font-medium">{t('nav.logout')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-800 hover:bg-indigo-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-gray-100"
              >
                <div className="px-4 py-6 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-indigo-50'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    <Link
                      to="/guest/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50"
                    >
                      <span className="text-xl">👤</span>
                      <span className="font-semibold">{t('guest.profile')}</span>
                    </Link>
                    <Link
                      to="/guest/change-password"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50"
                    >
                      <span className="text-xl">🔒</span>
                      <span className="font-semibold">{t('guest.changePassword')}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50"
                    >
                      <span className="text-xl">🚪</span>
                      <span className="font-semibold">{t('nav.logout')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Content with top padding for fixed navbar */}
      <main className="pt-20">{children}</main>
    </div>
  );
}

export default GuestLayout;
