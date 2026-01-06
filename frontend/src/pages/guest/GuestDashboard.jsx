import { useEffect, useState } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCalendar, FiBell, FiDollarSign, FiStar, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';

function GuestDashboard() {
  const { t, i18n } = useTranslation();
  const { guest } = useGuestAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
    reviewsSubmitted: 0
  });
  const [loading, setLoading] = useState(true);

  const formatUsd = (value) => {
    const numberValue = Number(value);
    return new Intl.NumberFormat(i18n.language || 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(numberValue) ? numberValue : 0);
  };

  useEffect(() => {
    fetchStats();
    const onFocus = () => {
      fetchStats();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch real data from backend
      const [bookingsRes, paymentsRes, reviewsRes] = await Promise.all([
        api.get('/guest/my-bookings'),
        api.get('/guest/payments').catch(() => ({ data: { data: [] } })),
        api.get('/guest/my-reviews').catch(() => ({ data: { data: [] } }))
      ]);

      const bookings = bookingsRes.data.data || [];
      const payments = paymentsRes.data.data || [];
      const reviews = reviewsRes.data.data || [];

      const now = new Date();
      const upcomingBookings = bookings.filter(b => 
        new Date(b.check_in_date) > now && 
        (b.status === 'confirmed' || b.status === 'pending')
      );

      const paidPayments = payments.filter((p) => {
        const status = String(p.status || p.payment_status || '').toLowerCase();
        return status === 'completed' || status === 'paid';
      });

      const totalSpent = paidPayments.reduce((sum, p) => {
        const amount = Number(p.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);

      setStats({
        totalBookings: bookings.length,
        upcomingBookings: upcomingBookings.length,
        totalSpent,
        reviewsSubmitted: reviews.length
      });
    } catch (error) {
      toast.error(t('guest.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-purple-100 font-sans">
      {/* Hero Header */}
      <div className="bg-white/80 border-b border-blue-100 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
              <FiUser className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent flex flex-wrap items-center gap-2 mb-1 drop-shadow-lg leading-tight break-words">
              {t('guest.welcome')}, {guest?.first_name} {guest?.last_name}!
            </h1>
            <p className="text-base text-blue-500 font-medium leading-snug break-words">{t('guest.dashboardSubtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-7">
        {/* Statistika kartalari */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-7">
          {/* Stat Card */}
          {[
            {
              key: 'totalBookings',
              icon: <FiCalendar className="w-7 h-7 text-white" />,
              label: t('guest.totalBookings'),
              value: stats.totalBookings,
              delay: 0.1
            },
            {
              key: 'upcomingBookings',
              icon: <FiBell className="w-7 h-7 text-white" />,
              label: t('guest.upcomingBookings'),
              value: stats.upcomingBookings,
              delay: 0.2
            },
            {
              key: 'totalSpent',
              icon: <FiDollarSign className="w-7 h-7 text-white" />,
              label: t('guest.totalSpent'),
              value: formatUsd(stats.totalSpent),
              delay: 0.3
            },
            {
              key: 'reviewsSubmitted',
              icon: <FiStar className="w-7 h-7 text-white" />,
              label: t('guest.reviewsSubmitted'),
              value: stats.reviewsSubmitted,
              delay: 0.4
            }
          ].map((card) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay }}
              className="relative bg-white/90 rounded-2xl shadow-xl p-5 md:p-6 flex items-center gap-5 border-2 border-transparent hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group overflow-hidden min-w-0 h-full"
              style={{
                borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderImageSlice: 1,
              }}
            >
              <div className="w-16 h-16 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                {card.icon}
              </div>

              <div className="min-w-0">
                <div className="text-sm md:text-base font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors leading-snug tw-clamp-2 tw-break-anywhere flex items-center">
                  {card.label}
                </div>
                <div className="text-xl md:text-2xl font-extrabold text-blue-700 group-hover:text-purple-600 transition-colors truncate tabular-nums">
                  {card.value}
                </div>
              </div>

              <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-br from-yellow-200/30 to-yellow-400/10 rounded-bl-full blur-2xl opacity-60 pointer-events-none" />
              <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-60 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Tezkor havolalar + Shaxsiy ma'lumotlar (katta ekranda bo‘sh joyni to‘ldirish uchun yonma-yon) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Quick Links */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {[
              {
                href: "/guest/my-bookings",
                key: 'myBookings',
                title: t('guest.myBookings'),
                desc: t('guest.viewAllBookings'),
                delay: 0.5
              },
              {
                href: "/guest/book-room",
                key: 'bookRoom',
                title: t('guest.bookRoom'),
                desc: t('guest.makeNewBooking'),
                delay: 0.6
              },
              {
                href: "/guest/profile",
                key: 'profile',
                title: t('guest.profile'),
                desc: t('guest.manageProfile'),
                delay: 0.7
              },
              {
                href: "/guest/payment-history",
                key: 'paymentHistory',
                title: t('guest.paymentHistory'),
                desc: t('guest.viewPaymentHistory'),
                delay: 0.8
              }
            ].map((link) => (
              <Link
                key={link.key}
                to={link.href}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: link.delay }}
                  className="group bg-white/90 border-2 rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 flex items-center gap-5 relative overflow-hidden min-w-0 h-full"
                  style={{
                    borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderImageSlice: 1,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-blue-700 group-hover:text-indigo-600 transition-colors truncate">
                      {link.title}
                    </h3>
                    <p className="text-sm text-blue-400 mt-1 group-hover:text-purple-600 transition-colors leading-snug tw-clamp-2 tw-break-anywhere flex items-center">
                      {link.desc}
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 w-16 h-16 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-60 pointer-events-none" />
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Shaxsiy ma'lumotlar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="lg:col-span-1 bg-white/90 border-2 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden h-full"
            style={{
              borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderImageSlice: 1,
            }}
          >
            <h2 className="text-lg font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2 drop-shadow-lg">
              <FiUser className="w-5 h-5 text-blue-600" />
              {t('guest.personalInfo')}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs text-blue-400 font-medium mb-1">{t('auth.email')}</p>
                <p className="font-semibold text-blue-900 text-sm tw-break-anywhere">{guest?.email}</p>
              </div>
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs text-blue-400 font-medium mb-1">{t('guest.phone')}</p>
                <p className="font-semibold text-blue-900 text-sm tw-break-anywhere">{guest?.phone}</p>
              </div>
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs text-blue-400 font-medium mb-1">{t('guest.passportNumber')}</p>
                <p className="font-semibold text-blue-900 text-sm tw-break-anywhere">{guest?.passport_number}</p>
              </div>
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs text-blue-400 font-medium mb-1">{t('guest.nationality')}</p>
                <p className="font-semibold text-blue-900 text-sm tw-break-anywhere">{guest?.nationality}</p>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Link
                to="/guest/profile"
                className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-5 py-2 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 hover:scale-105 transition-all border-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 text-sm"
              >
                {t('guest.editProfile')}
              </Link>
            </div>

            <div className="absolute right-0 bottom-0 w-28 h-28 bg-gradient-to-br from-yellow-200/30 to-yellow-400/10 rounded-tl-full blur-2xl opacity-60 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard;
