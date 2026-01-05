import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

function MyBookingsPage() {
  const { t, i18n } = useTranslation();
  const { guest } = useGuestAuth();
  const reduceMotion = useReducedMotion();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [cancelModal, setCancelModal] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/guest/my-bookings');
      const bookingsData = response.data.data || [];
      console.log('Fetched bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Booking fetch error:', error.response || error);
      toast.error(error.response?.data?.message || t('guest.bookings.toast.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('guest.bookingStatus.pending') },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('guest.bookingStatus.confirmed') },
      checked_in: { bg: 'bg-green-100', text: 'text-green-800', label: t('guest.bookingStatus.checkedIn') },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('guest.bookingStatus.checkedOut') },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('guest.bookingStatus.cancelled') }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (date) => {
    const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'uz' ? 'uz-UZ' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePayment = async () => {
    if (!paymentModal || !paymentModal.total_price) {
      toast.error(t('payment.amountMissing'));
      return;
    }

    try {
      // Manual payment (cash/card)
      const paymentData = {
        booking_id: paymentModal.id,
        amount: parseFloat(paymentModal.total_price),
        payment_method: paymentMethod,
        transaction_id: `TXN-${Date.now()}`,
        notes: t('guest.bookingsPage.paymentNotes', {
          method:
            paymentMethod === 'card'
              ? t('payment.card')
              : paymentMethod === 'cash'
                ? t('payment.cash')
                : paymentMethod
        })
      };

      console.log('Sending payment data:', paymentData);

      const response = await api.post('/payments', paymentData, {
        headers: { 'X-Auth-Context': 'guest' }
      });

      toast.success(t('payment.paymentSuccess'));
      
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
      const errorMsg = error.response?.data?.message || t('payment.paymentError');
      toast.error(errorMsg);
      console.error('Payment error:', error.response?.data);
    }
  };

  const getPaymentStatus = (booking) => {
    // Check if payment exists for this booking
    // payments can be an array or single object
    const payment = Array.isArray(booking.payments) 
      ? booking.payments.find(p => p.status === 'completed')
      : booking.payment;
      
    if (payment && payment.status === 'completed') {
      return 'paid';
    }
    return 'unpaid';
  };

  const handleReview = async () => {
    if (!reviewModal?.id) {
      toast.error(t('guest.reviews.toast.addError'));
      return;
    }

    if (!guest?.id) {
      toast.error(t('guest.toast.sessionExpired'));
      return;
    }

    try {
      await api.post(
        '/reviews',
        {
          booking_id: reviewModal.id,
          guest_id: guest.id,
          rating: reviewData.rating,
          comment: reviewData.comment
        },
        {
          headers: { 'X-Auth-Context': 'guest' }
        }
      );
      toast.success(t('guest.reviews.toast.added'));

      // Optimistically mark booking as reviewed so the button fades immediately
      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.id !== reviewModal.id) return booking;
          const existingReviews = Array.isArray(booking.reviews) ? booking.reviews : [];
          return {
            ...booking,
            reviews: [
              ...existingReviews,
              {
                booking_id: reviewModal.id,
                guest_id: guest.id,
                rating: reviewData.rating,
                comment: reviewData.comment,
                created_at: new Date().toISOString(),
              },
            ],
          };
        })
      );

      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (error) {
      const apiData = error.response?.data;
      const firstValidationError = apiData?.errors
        ? Object.values(apiData.errors).flat()?.[0]
        : null;

      const message =
        apiData?.message ||
        apiData?.error ||
        firstValidationError ||
        t('guest.reviews.toast.addError');

      toast.error(message);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.post(`/bookings/${cancelModal.id}/cancel`);
      toast.success(t('guest.bookings.toast.cancelled'));
      setCancelModal(null);
      fetchBookings();
    } catch (error) {
      toast.error(t('guest.bookings.toast.cancelError'));
    }
  };

  const handleDownloadInvoice = (bookingId) => {
    const url = `http://localhost:8000/api/invoices/booking/${bookingId}`;
    window.open(url, '_blank');
    toast.success(t('guest.invoice.toast.downloading'));
  };

  const listVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.07,
            delayChildren: 0.08,
          },
    },
  };

  const itemVariants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 18, scale: 0.985, filter: 'blur(6px)' },
    show: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: { type: 'spring', stiffness: 320, damping: 26, mass: 0.7 },
        },
  };

  const modalOverlayMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } },
  };

  const modalPanelMotion = {
    initial: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' },
    animate: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: { type: 'spring', stiffness: 380, damping: 30, mass: 0.7 },
        },
    exit: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: 10,
          scale: 0.99,
          filter: 'blur(4px)',
          transition: { duration: 0.16, ease: 'easeIn' },
        },
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-blue-50 flex items-center justify-center"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={
            reduceMotion
              ? { duration: 0.1 }
              : { type: 'spring', stiffness: 320, damping: 28, mass: 0.7 }
          }
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-500">{t('common.loading')}</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-blue-50"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <motion.div
        className="bg-white border-b border-blue-100 shadow-sm"
        initial={reduceMotion ? false : { opacity: 0, y: -10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={
          reduceMotion
            ? { duration: 0.1 }
            : { type: 'spring', stiffness: 320, damping: 28, mass: 0.7 }
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-blue-700">{t('guest.myBookings')}</h1>
          <p className="mt-1 text-sm text-blue-400">
            {t('guest.bookings.subtitle')}
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <motion.div
            className="bg-white border border-blue-100 rounded-lg shadow-sm p-12 text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.985, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={
              reduceMotion
                ? { duration: 0.1 }
                : { type: 'spring', stiffness: 320, damping: 26, mass: 0.7 }
            }
          >
            <span className="text-6xl mb-4 block" aria-hidden="true">—</span>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{t('guest.bookings.emptyTitle')}</h3>
            <p className="text-blue-400 mb-6">{t('guest.bookings.emptySubtitle')}</p>
            <Link
              to="/guest/book-room"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {t('guest.bookRoom')}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                variants={itemVariants}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -2, boxShadow: '0 16px 35px rgba(2,6,23,0.08)' }
                }
                transition={reduceMotion ? undefined : { type: 'spring', stiffness: 340, damping: 28 }}
                className="bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700">
                        {t('guest.bookingsPage.bookingNumber', { id: booking.id })}
                      </h3>
                      <p className="text-sm text-blue-400 mt-1">
                        {t('guest.bookingsPage.createdAt')}: {formatDate(booking.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('guest.bookingsPage.room')}</p>
                      <p className="font-semibold text-blue-900">
                        {booking.room?.room_type?.name} - {t('guest.bookRoomPage.roomNumberShort', { number: booking.room?.room_number })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.checkIn')}</p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(booking.check_in_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.checkOut')}</p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(booking.check_out_date)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.adults')}</p>
                      <p className="font-semibold text-blue-900">{booking.number_of_adults}</p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.children')}</p>
                      <p className="font-semibold text-blue-900">{booking.number_of_children || 0}</p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">{t('booking.totalPrice')}</p>
                      <p className="text-xl font-bold text-green-600">${booking.total_price}</p>
                      {getPaymentStatus(booking) === 'paid' ? (
                        <div className="mt-1">
                          <span className="text-xs text-green-600 font-semibold">{t('payment.paid')}</span>
                          {(() => {
                            const payment = Array.isArray(booking.payments) 
                              ? booking.payments.find(p => p.status === 'completed')
                              : booking.payment;
                            return payment && (
                              <div className="text-xs text-blue-400 mt-1">
                                {payment.payment_method === 'card' && t('payment.card')}
                                {payment.payment_method === 'cash' && t('payment.cash')}
                                {!['card', 'cash'].includes(payment.payment_method) && payment.payment_method}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-xs text-red-600 font-semibold">{t('payment.unpaid')}</span>
                      )}
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-blue-400 mb-1">{t('booking.specialRequests')}</p>
                      <p className="text-blue-900">{booking.special_requests}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    {/* Download Invoice Button */}
                    <button
                      onClick={() => handleDownloadInvoice(booking.id)}
                      className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold inline-flex items-center justify-center text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t('guest.bookingsPage.invoice')}
                    </button>

                    {/* Payment Button */}
                    {booking.status === 'confirmed' && getPaymentStatus(booking) === 'unpaid' && (
                      <button
                        onClick={() => setPaymentModal(booking)}
                        className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base"
                      >
                        {t('guest.bookingsPage.payAction')}
                      </button>
                    )}

                    {/* Cancel Button */}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => setCancelModal(booking)}
                        className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 font-semibold text-sm sm:text-base"
                      >
                        {t('common.cancel')}
                      </button>
                    )}

                    {/* Review Button */}
                    {booking.status === 'checked_out' && (() => {
                      const hasReview =
                        Boolean(booking.review) ||
                        (Array.isArray(booking.reviews) && booking.reviews.length > 0);

                      return (
                      <button
                        type="button"
                        disabled={hasReview}
                        className={
                          hasReview
                            ? 'bg-yellow-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base opacity-50 cursor-not-allowed'
                            : 'bg-yellow-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold text-sm sm:text-base'
                        }
                        onClick={() => {
                          if (hasReview) return;
                          setReviewModal(booking);
                        }}
                      >
                        {t('guest.bookingsPage.leaveReview')}
                      </button>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence initial={false}>
        {paymentModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            {...(reduceMotion ? { initial: false } : {})}
            {...modalOverlayMotion}
          >
            <motion.div
              className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
              {...(reduceMotion ? { initial: false } : {})}
              {...modalPanelMotion}
            >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('payment.title')}</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">{t('guest.bookingsPage.bookingNumberLabel')}:</span>
                  <span className="font-semibold">#{paymentModal.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">{t('guest.bookingsPage.room')}:</span>
                  <span className="font-semibold text-right">
                    {paymentModal.room?.room_type?.name} - {t('guest.bookRoomPage.roomNumberShort', { number: paymentModal.room?.room_number })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">{t('payment.totalAmount')}:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    ${paymentModal.total_price || '0.00'}
                  </span>
                </div>
                {!paymentModal.total_price && (
                  <p className="text-xs text-red-500 mt-1">
                    {t('payment.amountMissing')}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  {t('payment.method')}
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
                      <div className="font-semibold text-sm sm:text-base">{t('payment.card')}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{t('guest.bookingsPage.payment.cardHint')}</div>
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
                      <div className="font-semibold text-sm sm:text-base">{t('payment.cash')}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{t('guest.bookingsPage.payment.cashHint')}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setPaymentModal(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold text-sm sm:text-base"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base"
              >
                {t('guest.bookingsPage.payNow')}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence initial={false}>
        {reviewModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            {...(reduceMotion ? { initial: false } : {})}
            {...modalOverlayMotion}
          >
            <motion.div
              className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
              {...(reduceMotion ? { initial: false } : {})}
              {...modalPanelMotion}
            >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('guest.bookingsPage.leaveReview')}</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">{t('guest.bookingsPage.room')}:</span>
                  <span className="font-semibold text-right">
                    {reviewModal.room?.room_type?.name} - {t('guest.bookRoomPage.roomNumberShort', { number: reviewModal.room?.room_number })}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  {t('guest.bookingsPage.ratingLabel')}
                </label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-2xl sm:text-3xl ${
                        star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      {star <= reviewData.rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  {t('guest.bookingsPage.commentLabel')}
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                  placeholder={t('guest.bookingsPage.reviewPlaceholder')}
                  required
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewData({ rating: 5, comment: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold text-sm sm:text-base"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleReview}
                disabled={!reviewData.comment}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {t('common.submit')}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Booking Modal */}
      <AnimatePresence initial={false}>
        {cancelModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            {...(reduceMotion ? { initial: false } : {})}
            {...modalOverlayMotion}
          >
            <motion.div
              className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6"
              {...(reduceMotion ? { initial: false } : {})}
              {...modalPanelMotion}
            >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-600">{t('guest.bookingsPage.cancelTitle')}</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg mb-4">
                <p className="text-sm sm:text-base text-gray-700 mb-2">
                  {t('guest.bookingsPage.cancelPrompt')}
                </p>
                <div className="mt-3 space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('guest.bookingsPage.bookingNumberLabel')}:</span>
                    <span className="font-semibold">#{cancelModal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('guest.bookingsPage.room')}:</span>
                    <span className="font-semibold text-right">
                      {cancelModal.room?.room_type?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('guest.bookingsPage.amount')}:</span>
                    <span className="font-semibold text-red-600">
                      ${cancelModal.total_price}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('guest.bookingsPage.cancelPolicy')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold text-sm sm:text-base"
              >
                {t('guest.bookingsPage.keepBooking')}
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm sm:text-base"
              >
                {t('guest.bookingsPage.confirmCancel')}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MyBookingsPage;
