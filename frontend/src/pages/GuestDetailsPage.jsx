import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRoomTypeLabel } from '../utils/roomTypeLabel';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

function GuestDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    completedStays: 0,
    cancelledBookings: 0,
    averageRating: 0,
    lastVisit: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const formatUsd = (amount) => {
    const numericAmount = Number(amount ?? 0);
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD'
    }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return t('common.notAvailable');
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return t('common.notAvailable');
    return new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const resolveStatusLabel = (status) => {
    const bookingKey = `booking.status.${status}`;
    const paymentKey = `admin.pages.payments.status.${status}`;

    const bookingTranslated = t(bookingKey);
    if (bookingTranslated && bookingTranslated !== bookingKey) return bookingTranslated;

    const paymentTranslated = t(paymentKey);
    if (paymentTranslated && paymentTranslated !== paymentKey) return paymentTranslated;

    return status;
  };

  useEffect(() => {
    fetchGuestDetails();
  }, [id]);

  const fetchGuestDetails = async () => {
    try {
      const [guestRes, bookingsRes, paymentsRes, reviewsRes] = await Promise.all([
        api.get(`/guests/${id}`),
        api.get('/bookings'),
        api.get('/payments'),
        api.get('/reviews')
      ]);

      const guestData = guestRes.data;
      const allBookings = bookingsRes.data.data || bookingsRes.data;
      const allPayments = paymentsRes.data.data || paymentsRes.data;
      const allReviews = reviewsRes.data;

      // Filter guest's data
      const guestBookings = allBookings.filter(b => b.guest_id === parseInt(id));
      const guestPayments = allPayments.filter(p => {
        const booking = guestBookings.find(b => b.id === p.booking_id);
        return booking !== undefined;
      });
      const guestReviews = allReviews.filter(r => r.guest_id === parseInt(id));

      setGuest(guestData);
      setBookings(guestBookings);
      setPayments(guestPayments);
      setReviews(guestReviews);

      // Calculate stats
      const totalSpent = guestPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const completedStays = guestBookings.filter(b => b.status === 'checked_out').length;
      const cancelledBookings = guestBookings.filter(b => b.status === 'cancelled').length;
      
      const avgRating = guestReviews.length > 0
        ? guestReviews.reduce((sum, r) => sum + r.rating, 0) / guestReviews.length
        : 0;

      const sortedBookings = [...guestBookings].sort((a, b) => 
        new Date(b.check_out_date) - new Date(a.check_out_date)
      );
      const lastVisit = sortedBookings.length > 0 ? sortedBookings[0].check_out_date : null;

      setStats({
        totalBookings: guestBookings.length,
        totalSpent,
        completedStays,
        cancelledBookings,
        averageRating: avgRating.toFixed(1),
        lastVisit
      });

    } catch (error) {
      toast.error(t('admin.pages.guestDetails.toast.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
      checked_in: { bg: 'bg-green-100', text: 'text-green-800' },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
      completed: { bg: 'bg-green-100', text: 'text-green-800' },
      failed: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {resolveStatusLabel(status)}
      </span>
    );
  };

  if (loading) {
    return <Loader className="h-96" />;
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('admin.pages.guestDetails.notFound')}</p>
        <button
          onClick={() => navigate('/guests')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/guests')}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mehmon Profili</h1>
        </div>
      </div>

      {/* Guest Profile Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{guest.first_name} {guest.last_name}</h2>
              <p className="text-blue-100">{guest.email}</p>
              <p className="text-blue-100">{guest.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">{t('admin.pages.guestDetails.labels.id')}:</p>
            <p className="text-xl font-semibold">#{guest.id}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('admin.pages.guestDetails.stats.totalBookings')}</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
            </div>
            <svg className="w-12 h-12 text-blue-600 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('admin.pages.guestDetails.stats.totalSpent')}</p>
              <p className="text-3xl font-bold text-green-600">{formatUsd(stats.totalSpent)}</p>
            </div>
            <svg className="w-12 h-12 text-green-600 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('admin.pages.guestDetails.stats.completedStays')}</p>
              <p className="text-3xl font-bold text-purple-600">{stats.completedStays}</p>
            </div>
            <svg className="w-12 h-12 text-purple-600 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('admin.pages.guestDetails.stats.averageRating')}</p>
              <p className="text-3xl font-bold text-yellow-600">⭐ {stats.averageRating}</p>
            </div>
            <svg className="w-12 h-12 text-yellow-600 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('admin.pages.guestDetails.tabs.overview')}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-medium ${activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('admin.pages.guestDetails.tabs.bookings', { value: bookings.length })}
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-medium ${activeTab === 'payments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('admin.pages.guestDetails.tabs.payments', { value: payments.length })}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('admin.pages.guestDetails.tabs.reviews', { value: reviews.length })}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('admin.pages.guestDetails.sections.personalInfo')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.pages.guestDetails.fields.fullName')}:</span>
                      <span className="font-medium">{guest.first_name} {guest.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.pages.guestDetails.fields.email')}:</span>
                      <span className="font-medium">{guest.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.pages.guestDetails.fields.phone')}:</span>
                      <span className="font-medium">{guest.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.pages.guestDetails.fields.address')}:</span>
                      <span className="font-medium">{guest.address || t('common.notAvailable')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('admin.pages.guestDetails.sections.statistics')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.pages.guestDetails.fields.lastVisit')}:</span>
                      <span className="font-medium">
                        {stats.lastVisit ? formatDate(stats.lastVisit) : t('admin.pages.guestDetails.notVisitedYet')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.pages.guestDetails.fields.cancelledBookings')}:</span>
                      <span className="font-medium text-red-600">{stats.cancelledBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.pages.guestDetails.fields.registeredAt')}:</span>
                      <span className="font-medium">{formatDate(guest.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('admin.pages.guestDetails.sections.recentActivity')}</h3>
                <div className="space-y-3">
                  {bookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{t('admin.pages.guestDetails.bookingLabel', { value: booking.booking_number })}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.bookings.booking')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.bookings.room')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.bookings.checkIn')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.bookings.checkOut')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.bookings.amount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.bookings.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.booking_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoomTypeLabel(booking.room?.room_type, t)} #{booking.room?.room_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(booking.check_in_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(booking.check_out_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatUsd(booking.total_amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.payments.id')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.payments.booking')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.payments.amount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.payments.method')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.payments.date')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.guestDetails.tables.payments.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">#{payment.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {bookings.find(b => b.id === payment.booking_id)?.booking_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatUsd(payment.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{payment.payment_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('admin.pages.guestDetails.empty.reviews')}</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <span className="text-xl font-bold">{review.rating}/5</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    {review.booking_id && (
                      <p className="text-xs text-gray-500 mt-2">
                        {t('admin.pages.guestDetails.reviewBookingLabel', {
                          value: bookings.find(b => b.id === review.booking_id)?.booking_number || t('common.notAvailable')
                        })}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuestDetailsPage;
