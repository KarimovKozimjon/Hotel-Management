import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function MyBookingsPage() {
  const { guest } = useGuestAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/guest/my-bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.error('Booking fetch error:', error.response || error);
      toast.error(error.response?.data?.message || 'Bronlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Kutilmoqda' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tasdiqlangan' },
      checked_in: { bg: 'bg-green-100', text: 'text-green-800', label: 'Kirish amalga oshirilgan' },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Chiqish amalga oshirilgan' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bekor qilingan' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Mening bronlarim 📋</h1>
          <p className="mt-1 text-sm text-gray-500">
            Barcha bronlaringizni bu yerda ko'ring
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bronlar topilmadi</h3>
            <p className="text-gray-600 mb-6">Siz hali hech qanday xona bronlamagansiz</p>
            <a
              href="/guest/book-room"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Xona bron qilish
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bron #{booking.id}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Yaratilgan: {formatDate(booking.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Xona</p>
                      <p className="font-semibold text-gray-900">
                        {booking.room?.room_type?.name} - Xona #{booking.room?.room_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kirish sanasi</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_in_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Chiqish sanasi</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_out_date)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kattalar soni</p>
                      <p className="font-semibold text-gray-900">{booking.number_of_adults}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bolalar soni</p>
                      <p className="font-semibold text-gray-900">{booking.number_of_children || 0}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Jami summa</p>
                      <p className="text-xl font-bold text-green-600">${booking.total_price}</p>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-1">Maxsus so'rovlar</p>
                      <p className="text-gray-900">{booking.special_requests}</p>
                    </div>
                  )}

                  {booking.status === 'checked_out' && !booking.review && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                        onClick={() => {
                          // TODO: Sharh qoldirish modali
                          toast.info('Sharh qoldirish funksiyasi qo\'shilmoqda');
                        }}
                      >
                        ⭐ Sharh qoldirish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;
