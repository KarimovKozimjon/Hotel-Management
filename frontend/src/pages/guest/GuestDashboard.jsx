import { useEffect, useState } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import toast from 'react-hot-toast';

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
      // TODO: Backend API dan ma'lumotlarni olish
      // Hozircha test ma'lumotlar
      setStats({
        totalBookings: 0,
        upcomingBookings: 0,
        totalSpent: 0,
        reviewsSubmitted: 0
      });
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Xush kelibsiz, {guest?.first_name} {guest?.last_name}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mehmonlar kabineti
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistika kartalari */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami bronlar</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-3xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kelgusi bronlar</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.upcomingBookings}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-3xl">🔔</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami to'langan</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">${stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sharhlar</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.reviewsSubmitted}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-3xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tezkor havolalar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/guest/my-bookings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mening bronlarim</h3>
                <p className="text-sm text-gray-600 mt-1">Barcha bronlaringizni ko'ring</p>
              </div>
            </div>
          </a>

          <a
            href="/guest/book-room"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-3xl">🏨</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xona bron qilish</h3>
                <p className="text-sm text-gray-600 mt-1">Yangi xona band qiling</p>
              </div>
            </div>
          </a>

          <a
            href="/guest/profile"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profilim</h3>
                <p className="text-sm text-gray-600 mt-1">Shaxsiy ma'lumotlarni tahrirlash</p>
              </div>
            </div>
          </a>
        </div>

        {/* Shaxsiy ma'lumotlar */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shaxsiy ma'lumotlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{guest?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefon</p>
              <p className="font-semibold">{guest?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pasport raqami</p>
              <p className="font-semibold">{guest?.passport_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Millati</p>
              <p className="font-semibold">{guest?.nationality}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard;
