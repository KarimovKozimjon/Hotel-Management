import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiClipboard, FiCreditCard, FiDownload, FiStar, FiXCircle } from 'react-icons/fi';
import { FaRegStar, FaStar } from 'react-icons/fa';

function MyBookingsPage() {
  const { guest } = useGuestAuth();
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewedBookingIds, setReviewedBookingIds] = useState([]);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [cancelModal, setCancelModal] = useState(null);

  const getLocale = () => {
    const lang = (i18n.language || 'en').toLowerCase();
    if (lang.startsWith('uz')) return 'uz-UZ';
    if (lang.startsWith('ru')) return 'ru-RU';
    return 'en-US';
  };

  const getBookingStatusKey = (status) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'confirmed':
        return 'confirmed';
      case 'checked_in':
        return 'checkedIn';
      case 'checked_out':
        return 'checkedOut';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/guest/my-bookings');
      const bookingsData = response.data.data || [];
      console.log('Fetched bookings:', bookingsData);
      setBookings(bookingsData);

      // Mark bookings that already have reviews
      try {
        const reviewsRes = await api.get('/guest/my-reviews');
        const reviews = reviewsRes.data?.data || [];
        const ids = reviews
          .map((r) => r?.booking_id)
          .filter((id) => id !== null && id !== undefined);
        setReviewedBookingIds(ids);
      } catch {
        // Non-fatal: UI will still allow trying to review; backend prevents duplicates.
      }
    } catch (error) {
      console.error('Booking fetch error:', error.response || error);
      toast.error(error.response?.data?.message || (t('guest.bookings.fetchError') || 'Bronlarni yuklashda xatolik'));
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
      cancelled: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const badge = badges[status] || badges.pending;
    const statusKey = getBookingStatusKey(status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {t(`booking.status.${statusKey}`) || status}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePayment = async () => {
    if (!paymentModal || !paymentModal.total_price) {
      toast.error(t('guest.payments.amountMissing') || "To'lov summasi topilmadi");
      return;
    }

    try {
      // Manual payment (cash/card)
      const paymentData = {
        booking_id: paymentModal.id,
        amount: parseFloat(paymentModal.total_price),
        payment_method: paymentMethod,
        transaction_id: `TXN-${Date.now()}`,
        notes: `To'lov ${paymentMethod} orqali amalga oshirildi`
      };

      console.log('Sending payment data:', paymentData);

      const response = await api.post('/payments', paymentData);

      toast.success(t('guest.payments.success') || "To'lov muvaffaqiyatli amalga oshirildi!");
      
      // Immediately update the booking in state to show payment status
      const updatedBookings = bookings.map(booking => {
        if (booking.id === paymentModal.id) {
          return {
            ...booking,
            payment: response.data
          };
        }
        return booking;
      });
      setBookings(updatedBookings);
      
      setPaymentModal(null);
      setPaymentMethod('card');
      
      // Fetch fresh data from server
      setTimeout(() => {
        fetchBookings();
      }, 500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || (t('guest.payments.error') || "To'lovda xatolik yuz berdi");
      toast.error(errorMsg);
      console.error('Payment error:', error.response?.data);
    }
  };

  const getCompletedPayment = (booking) => {
    const payments = Array.isArray(booking?.payments) ? booking.payments : [];
    const paymentFromArray = payments.find((p) => {
      const status = String(p?.status ?? p?.payment_status ?? '').toLowerCase();
      return status === 'completed' || status === 'paid';
    });

    if (paymentFromArray) return paymentFromArray;

    const singlePayment = booking?.payment;
    if (!singlePayment) return null;

    const singleStatus = String(singlePayment?.status ?? singlePayment?.payment_status ?? '').toLowerCase();
    if (singleStatus === 'completed' || singleStatus === 'paid') return singlePayment;

    return null;
  };

  const getPaymentStatus = (booking) => {
    return getCompletedPayment(booking) ? 'paid' : 'unpaid';
  };

  const handleReview = async () => {
    try {
      if (!guest?.id) {
        toast.error(t('guest.sessionExpired') || 'Session expired');
        return;
      }

      const rating = Number(reviewData.rating);
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        toast.error(t('guest.reviews.ratingLabel') || 'Baho (1-5 yulduz)');
        return;
      }
      await api.post('/reviews', {
        booking_id: reviewModal.id,
        guest_id: guest.id,
        rating,
        comment: reviewData.comment || null
      });
      toast.success(t('guest.reviews.addSuccess') || "Sharh muvaffaqiyatli qo'shildi!");
      setReviewedBookingIds((prev) => (prev.includes(reviewModal.id) ? prev : [...prev, reviewModal.id]));
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (error) {
      const apiError = error?.response?.data;
      const message =
        apiError?.error ||
        apiError?.message ||
        (apiError?.errors ? JSON.stringify(apiError.errors) : null) ||
        (t('guest.reviews.addError') || "Sharh qo'shishda xatolik yuz berdi");
      toast.error(message);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.post(`/bookings/${cancelModal.id}/cancel`);
      toast.success(t('guest.bookings.cancelSuccess') || 'Bron bekor qilindi');
      setCancelModal(null);
      fetchBookings();
    } catch (error) {
      toast.error(t('guest.bookings.cancelError') || 'Bronni bekor qilishda xatolik');
    }
  };

  const handleDownloadInvoice = (bookingId) => {
    const url = `http://localhost:8000/api/invoices/booking/${bookingId}`;
    window.open(url, '_blank');
    toast.success(t('guest.bookings.invoiceDownloading') || 'Invoice yuklanmoqda...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-yellow-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-yellow-200 font-serif">{t('common.loading') || 'Yuklanmoqda...'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-purple-100 font-sans">
      {/* Hero Header */}
      <div className="bg-white/80 border-b border-blue-100 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
              <FiClipboard className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent flex flex-wrap items-center gap-3 mb-1 drop-shadow-lg min-w-0 break-words">
              {t('guest.myBookings') || 'Mening bronlarim'}
              <span className="text-blue-700">•</span>
              <span className="text-blue-700 truncate">{guest?.first_name} {guest?.last_name}</span>
            </h1>
            <p className="text-base text-blue-500 font-medium break-words">
              {t('guest.bookings.subtitle') || "Barcha bronlaringizni bu yerda ko'ring"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 border-2 rounded-2xl shadow-xl p-12 text-center relative overflow-hidden"
            style={{
              borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderImageSlice: 1,
            }}
          >
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
              <FiClipboard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{t('guest.bookings.emptyTitle') || 'Bronlar topilmadi'}</h3>
            <p className="text-blue-400 mb-6">{t('guest.bookings.emptyDescription') || "Siz hali hech qanday xona bronlamagansiz"}</p>
            <a
              href="/guest/book-room"
              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-6 py-2.5 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              {t('guest.bookRoom') || 'Xona bron qilish'}
            </a>
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-70 pointer-events-none" />
          </motion.div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.25) }}
                className="bg-white/90 border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                style={{
                  borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderImageSlice: 1,
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-blue-700">
                        {t('guest.bookings.bookingNumber') || 'Bron'} #{booking.id}
                      </h3>
                      <p className="text-sm text-blue-400 mt-1">
                        {t('guest.bookings.createdAt') || 'Yaratilgan'}: {formatDate(booking.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('guest.bookings.room') || 'Xona'}</p>
                      <p className="font-semibold text-blue-900 truncate">
                        {booking.room?.room_type?.name} - {t('guest.bookings.room') || 'Xona'} #{booking.room?.room_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.checkIn') || 'Kirish sanasi'}</p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(booking.check_in_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.checkOut') || 'Chiqish sanasi'}</p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(booking.check_out_date)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.adults') || 'Kattalar soni'}</p>
                      <p className="font-semibold text-blue-900">{booking.number_of_adults}</p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.children') || 'Bolalar soni'}</p>
                      <p className="font-semibold text-blue-900">{booking.number_of_children || 0}</p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.totalPrice') || 'Jami summa'}</p>
                      <p className="text-xl font-bold text-green-600 truncate">${booking.total_price}</p>
                      {getPaymentStatus(booking) === 'paid' ? (
                        <div className="mt-1">
                          <span className="text-xs text-green-600 font-semibold">✓ {t('guest.payments.paid') || "To'langan"}</span>
                          {(() => {
                            const payment = getCompletedPayment(booking);
                            return payment && (
                              <div className="text-xs text-blue-400 mt-1">
                                {payment.payment_method === 'card' && (t('guest.payments.method.cardShort') || '💳 Karta')}
                                {payment.payment_method === 'cash' && (t('guest.payments.method.cashShort') || '💵 Naqd')}
                                {!['card', 'cash'].includes(payment.payment_method) && payment.payment_method}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-xs text-red-600 font-semibold">✗ {t('guest.payments.unpaid') || "To'lanmagan"}</span>
                      )}
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-blue-400 mb-1">{t('booking.specialRequests') || "Maxsus so'rovlar"}</p>
                      <p className="text-blue-900">{booking.special_requests}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    {/* Download Invoice Button */}
                    <button
                      onClick={() => handleDownloadInvoice(booking.id)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 hover:scale-[1.03] transition-all font-semibold inline-flex items-center justify-center text-sm sm:text-base"
                    >
                      <FiDownload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {t('guest.bookings.invoice') || 'Invoice'}
                    </button>

                    {/* Payment Button */}
                    {(booking.status === 'confirmed' || booking.status === 'pending') && getPaymentStatus(booking) === 'unpaid' && (
                      <button
                        onClick={() => setPaymentModal(booking)}
                        className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-xl shadow hover:bg-green-700 hover:scale-[1.03] transition-all font-semibold text-sm sm:text-base"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t('guest.payments.pay') || "To'lov qilish"}
                        </span>
                      </button>
                    )}

                    {/* Cancel Button */}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => setCancelModal(booking)}
                        className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-xl shadow hover:bg-red-700 hover:scale-[1.03] transition-all font-semibold text-sm sm:text-base"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <FiXCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t('common.cancel') || 'Bekor qilish'}
                        </span>
                      </button>
                    )}

                    {/* Review Button */}
                    {booking.status === 'checked_out' && !(booking.review || reviewedBookingIds.includes(booking.id)) && (
                      <button
                        className="bg-yellow-500 text-white px-4 sm:px-6 py-2 rounded-xl shadow hover:bg-yellow-600 hover:scale-[1.03] transition-all font-semibold text-sm sm:text-base"
                        onClick={() => setReviewModal(booking)}
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <FiStar className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t('guest.reviews.leaveReview') || 'Sharh qoldirish'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-70 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 inline-flex items-center gap-2">
              <FiCreditCard className="w-6 h-6 text-indigo-600" />
              {t('payment.title') || "To'lov qilish"}
            </h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">{t('guest.bookings.bookingNumberLabel') || 'Bron raqami'}:</span>
                  <span className="font-semibold">#{paymentModal.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">{t('guest.bookings.room') || 'Xona'}:</span>
                  <span className="font-semibold text-right">
                    {paymentModal.room?.room_type?.name} - #{paymentModal.room?.room_number}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">{t('booking.totalPrice') || 'Jami summa'}:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    ${paymentModal.total_price || '0.00'}
                  </span>
                </div>
                {!paymentModal.total_price && (
                  <p className="text-xs text-red-500 mt-1">
                    {t('guest.payments.warningAmountMissing') || 'Ogohlantirish: Summa topilmadi'}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  {t('payment.method') || "To'lov usuli"}
                </label>

                <div className="space-y-2">
                  <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2 sm:mr-3"
                    />
                    <div>
                      <div className="font-semibold text-sm sm:text-base">💳 Bank kartasi</div>
                      <div className="text-xs sm:text-sm text-gray-500">Visa, Mastercard, Humo, UzCard</div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2 sm:mr-3"
                    />
                    <div>
                      <div className="font-semibold text-sm sm:text-base">💵 Naqd pul</div>
                      <div className="text-xs sm:text-sm text-gray-500">{t('guest.payments.cashHint') || "Resepshonda to'lash"}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setPaymentModal(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-300 font-semibold text-sm sm:text-base"
              >
                {t('common.cancel') || 'Bekor qilish'}
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 font-semibold text-sm sm:text-base"
              >
                {t('guest.payments.payNow') || "To'lash"}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 inline-flex items-center gap-2">
              <FiStar className="w-6 h-6 text-yellow-500" />
              {t('guest.reviews.leaveReview') || 'Sharh qoldirish'}
            </h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">{t('guest.bookings.room') || 'Xona'}:</span>
                  <span className="font-semibold text-right">
                    {reviewModal.room?.room_type?.name} - #{reviewModal.room?.room_number}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  {t('guest.reviews.ratingLabel') || 'Baho (1-5 yulduz)'}
                </label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`p-1 rounded-md transition-colors ${
                        star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-500`}
                      aria-label={`rate-${star}`}
                    >
                      {star <= reviewData.rating ? (
                        <FaStar className="w-7 h-7 sm:w-8 sm:h-8" />
                      ) : (
                        <FaRegStar className="w-7 h-7 sm:w-8 sm:h-8" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  {t('guest.reviews.commentLabel') || 'Izoh'}
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                  placeholder={t('guest.reviews.commentPlaceholder') || 'Tajribangiz haqida yozing...'}
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewData({ rating: 5, comment: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-300 font-semibold text-sm sm:text-base"
              >
                {t('common.cancel') || 'Bekor qilish'}
              </button>
              <button
                onClick={handleReview}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-xl hover:bg-yellow-600 font-semibold text-sm sm:text-base"
              >
                {t('common.submit') || 'Yuborish'}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Booking Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-gray-100"
            >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-600 inline-flex items-center gap-2">
              <FiAlertTriangle className="w-6 h-6" />
              {t('guest.bookings.cancelTitle') || 'Bronni bekor qilish'}
            </h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg mb-4">
                <p className="text-sm sm:text-base text-gray-700 mb-2">
                  {t('guest.bookings.cancelConfirm') || 'Siz ushbu bronni bekor qilmoqchimisiz?'}
                </p>
                <div className="mt-3 space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('guest.bookings.bookingNumberLabel') || 'Bron raqami'}:</span>
                    <span className="font-semibold">#{cancelModal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('guest.bookings.room') || 'Xona'}:</span>
                    <span className="font-semibold text-right">
                      {cancelModal.room?.room_type?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.totalPrice') || 'Summa'}:</span>
                    <span className="font-semibold text-red-600">
                      ${cancelModal.total_price}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 inline-flex gap-2">
                <FiAlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{t('guest.bookings.cancelPolicy') || "Bekor qilish shartlari: Kelishdan 24 soat oldin bekor qilsangiz, pul to'liq qaytariladi."}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-300 font-semibold text-sm sm:text-base"
              >
                {t('guest.bookings.cancelNo') || "Yo'q, saqlash"}
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 font-semibold text-sm sm:text-base"
              >
                {t('guest.bookings.cancelYes') || 'Ha, bekor qilish'}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyBookingsPage;
