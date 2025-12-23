import { useEffect, useState } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCalendar, FiBell, FiDollarSign, FiStar, FiClipboard, FiHome, FiUser } from 'react-icons/fi';

function GuestDashboard() {
  const { guest } = useGuestAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
    reviewsSubmitted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

      const paidPayments = payments.filter(p => p.payment_status === 'paid');
      const totalSpent = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setStats({
        totalBookings: bookings.length,
        upcomingBookings: upcomingBookings.length,
        totalSpent: totalSpent.toFixed(2),
        reviewsSubmitted: reviews.length
      });
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-yellow-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-yellow-200 font-serif">Yuklanmoqda...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700 flex items-center gap-3 mb-1">
              <FiUser className="w-8 h-8 text-blue-600" />
              Xush kelibsiz, {guest?.first_name} {guest?.last_name}!
            </h1>
            <p className="text-base md:text-lg text-blue-400">
              Mehmonlar kabineti — Sizning shaxsiy panelingiz
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistika kartalari */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-7 flex items-center gap-5 hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <FiCalendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 mb-1">Jami bronlar</div>
              <div className="text-gray-500 text-sm">{stats.totalBookings}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-7 flex items-center gap-5 hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <FiBell className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 mb-1">Kelgusi bronlar</div>
              <div className="text-gray-500 text-sm">{stats.upcomingBookings}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-7 flex items-center gap-5 hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <FiDollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 mb-1">Jami to'langan</div>
              <div className="text-gray-500 text-sm">${stats.totalSpent.toLocaleString()}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-7 flex items-center gap-5 hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <FiStar className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 mb-1">Sharhlar</div>
              <div className="text-gray-500 text-sm">{stats.reviewsSubmitted}</div>
            </div>
          </motion.div>
        </div>

        {/* Tezkor havolalar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.a
            href="/guest/my-bookings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="group bg-white border border-blue-100 rounded-xl p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 group-hover:scale-110 transition-transform">
                <FiClipboard className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-700">Mening bronlarim</h3>
                <p className="text-sm text-blue-400 mt-1">Barcha bronlaringizni ko'ring</p>
              </div>
            </div>
          </motion.a>

          <motion.a
            href="/guest/book-room"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="group bg-white border border-blue-100 rounded-xl p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 group-hover:scale-110 transition-transform">
                <FiHome className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-700">Xona bron qilish</h3>
                <p className="text-sm text-blue-400 mt-1">Yangi xona band qiling</p>
              </div>
            </div>
          </motion.a>

          <motion.a
            href="/guest/profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="group bg-white border border-blue-100 rounded-xl p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 group-hover:scale-110 transition-transform">
                <FiUser className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-700">Profilim</h3>
                <p className="text-sm text-blue-400 mt-1">Shaxsiy ma'lumotlarni tahrirlash</p>
              </div>
            </div>
          </motion.a>
        </div>

        {/* Shaxsiy ma'lumotlar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white border border-blue-100 rounded-xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
            <FiUser className="w-6 h-6 text-blue-600" />
            Shaxsiy ma'lumotlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-400 font-medium mb-1">Email</p>
              <p className="font-semibold text-blue-900">{guest?.email}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-400 font-medium mb-1">Telefon</p>
              <p className="font-semibold text-blue-900">{guest?.phone}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-400 font-medium mb-1">Pasport raqami</p>
              <p className="font-semibold text-blue-900">{guest?.passport_number}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-400 font-medium mb-1">Millati</p>
              <p className="font-semibold text-blue-900">{guest?.nationality}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GuestDashboard;
