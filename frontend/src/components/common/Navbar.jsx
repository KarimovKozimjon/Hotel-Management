import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [openGroupKey, setOpenGroupKey] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    setOpenGroupKey(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!openGroupKey && !mobileMenuOpen) return;
      const target = e.target;
      if (navRef.current && target instanceof Node && !navRef.current.contains(target)) {
        setOpenGroupKey(null);
        setMobileMenuOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenGroupKey(null);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openGroupKey, mobileMenuOpen]);

  const navGroups = useMemo(
    () => [
      {
        key: 'management',
        label: t('nav.groups.management') || 'Boshqaruv',
        items: [
          { path: '/dashboard', label: t('nav.dashboard') },
          { path: '/admin/rooms', label: t('nav.rooms') },
          { path: '/bookings', label: t('nav.bookings') },
          { path: '/guests', label: t('nav.guests') },
        ],
      },
      {
        key: 'finance',
        label: t('nav.groups.finance') || 'Moliya',
        items: [
          { path: '/payments', label: t('nav.payments') },
          { path: '/reports', label: t('nav.reports') },
          { path: '/discounts', label: t('nav.discounts') },
        ],
      },
      {
        key: 'settings',
        label: t('nav.groups.settings') || 'Sozlamalar',
        items: [
          { path: '/services', label: t('nav.services') },
          { path: '/room-types', label: t('nav.roomTypes') },
          { path: '/users', label: t('nav.users') },
          { path: '/reviews', label: t('nav.reviews') },
          { path: '/messages', label: t('nav.messages') },
        ],
      },
    ],
    [t]
  );

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
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

          {/* Navigation (3 grouped dropdowns, guest-style pills) */}
          <div className="hidden xl:flex flex-1 mx-4 items-center justify-center gap-2">
            {navGroups.map((group) => {
              const anyActiveInGroup = group.items.some((item) => isActive(item.path));
              const isOpen = openGroupKey === group.key;
              const pillActive = anyActiveInGroup || isOpen;

              return (
                <div key={group.key} className="relative">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setOpenGroupKey((prev) => (prev === group.key ? null : group.key))}
                    className={`relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md ${
                      pillActive
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                  >
                    {pillActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg" />
                    )}
                    <span className="relative z-10 truncate max-w-[120px]">{group.label}</span>
                    <span className="relative z-10 opacity-90">
                      <svg
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </motion.button>

                  {isOpen && (
                    <div
                      className="absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden z-50"
                      role="menu"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {group.label}
                        </div>
                      </div>
                      <div className="py-2">
                        {group.items.map((item) => {
                          const active = isActive(item.path);
                          return (
                            <button
                              key={item.path}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenGroupKey(null);
                                navigate(item.path);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${
                                active
                                  ? 'text-indigo-700 bg-indigo-50'
                                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden xl:block">
              <NotificationBell />
            </div>
            <div className="hidden xl:block">
              <LanguageSwitcher variant="dropdown" scrolled={scrolled} />
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="xl:hidden p-2 rounded-lg text-gray-800 hover:bg-indigo-50 absolute top-4 z-50 bg-white/80 border border-gray-200 shadow-md"
              style={{ right: '3rem', transform: 'translateY(0)', padding: '10px' }}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>

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

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-gray-100">
            <div className="px-4 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <LanguageSwitcher variant="dropdown" scrolled={true} />
                </div>
                <div className="text-sm font-semibold text-gray-700 truncate max-w-[50%]">{user?.name}</div>
              </div>

              <div className="space-y-4">
                {navGroups.map((group) => (
                  <div key={group.key} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {group.label}
                    </div>
                    <div className="py-2">
                      {group.items.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate(item.path);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                            isActive(item.path)
                              ? 'text-indigo-700 bg-indigo-50'
                              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-rose-600 text-white"
              >
                {t('nav.logout')}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
