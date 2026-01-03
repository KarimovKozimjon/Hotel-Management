import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function MyBookingsPage() {
  const { guest } = useGuestAuth();
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

  const handlePayment = async () => {
    if (!paymentModal || !paymentModal.total_price) {
      toast.error('To\'lov summasi topilmadi');
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

      toast.success('To\'lov muvaffaqiyatli amalga oshirildi!');
      
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
      const errorMsg = error.response?.data?.message || 'To\'lovda xatolik yuz berdi';
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
    try {
      await api.post('/reviews', {
        booking_id: reviewModal.id,
        room_id: reviewModal.room_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success('Sharh muvaffaqiyatli qo\'shildi!');
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (error) {
      toast.error('Sharh qo\'shishda xatolik yuz berdi');
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.post(`/bookings/${cancelModal.id}/cancel`);
      toast.success('Bron bekor qilindi');
      setCancelModal(null);
      fetchBookings();
    } catch (error) {
      toast.error('Bronni bekor qilishda xatolik');
    }
  };

  const handleDownloadInvoice = (bookingId) => {
    const url = `http://localhost:8000/api/invoices/booking/${bookingId}`;
    window.open(url, '_blank');
    toast.success('Invoice yuklanmoqda...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-blue-700">Mening bronlarim 📋</h1>
          <p className="mt-1 text-sm text-blue-400">
            Barcha bronlaringizni bu yerda ko'ring
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Bronlar topilmadi</h3>
            <p className="text-blue-400 mb-6">Siz hali hech qanday xona bronlamagansiz</p>
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
              <div key={booking.id} className="bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700">
                        Bron #{booking.id}
                      </h3>
                      <p className="text-sm text-blue-400 mt-1">
                        Yaratilgan: {formatDate(booking.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-blue-400 mb-1">Xona</p>
                      <p className="font-semibold text-blue-900">
                        {booking.room?.room_type?.name} - Xona #{booking.room?.room_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">Kirish sanasi</p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(booking.check_in_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">Chiqish sanasi</p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(booking.check_out_date)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                    <div>
                      <p className="text-sm text-blue-400 mb-1">Kattalar soni</p>
                      <p className="font-semibold text-blue-900">{booking.number_of_adults}</p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">Bolalar soni</p>
                      <p className="font-semibold text-blue-900">{booking.number_of_children || 0}</p>
                    </div>

                    <div>
                      <p className="text-sm text-blue-400 mb-1">Jami summa</p>
                      <p className="text-xl font-bold text-green-600">${booking.total_price}</p>
                      {getPaymentStatus(booking) === 'paid' ? (
                        <div className="mt-1">
                          <span className="text-xs text-green-600 font-semibold">✓ To'langan</span>
                          {(() => {
                            const payment = Array.isArray(booking.payments) 
                              ? booking.payments.find(p => p.status === 'completed')
                              : booking.payment;
                            return payment && (
                              <div className="text-xs text-blue-400 mt-1">
                                {payment.payment_method === 'card' && '💳 Karta'}
                                {payment.payment_method === 'cash' && '💵 Naqd'}
                                {!['card', 'cash'].includes(payment.payment_method) && payment.payment_method}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-xs text-red-600 font-semibold">✗ To'lanmagan</span>
                      )}
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-blue-400 mb-1">Maxsus so'rovlar</p>
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
                      Invoice
                    </button>

                    {/* Payment Button */}
                    {booking.status === 'confirmed' && getPaymentStatus(booking) === 'unpaid' && (
                      <button
                        onClick={() => setPaymentModal(booking)}
                        className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base"
                      >
                        💳 To'lov qilish
                      </button>
                    )}

                    {/* Cancel Button */}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => setCancelModal(booking)}
                        className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 font-semibold text-sm sm:text-base"
                      >
                        ✗ Bekor qilish
                      </button>
                    )}

                    {/* Review Button */}
                    {booking.status === 'checked_out' && !booking.review && (
                      <button
                        className="bg-yellow-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold text-sm sm:text-base"
                        onClick={() => setReviewModal(booking)}
                      >
                        ⭐ Sharh qoldirish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">To'lov qilish 💳</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">Bron raqami:</span>
                  <span className="font-semibold">#{paymentModal.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">Xona:</span>
                  <span className="font-semibold text-right">
                    {paymentModal.room?.room_type?.name} - #{paymentModal.room?.room_number}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">Jami summa:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    ${paymentModal.total_price || '0.00'}
                  </span>
                </div>
                {!paymentModal.total_price && (
                  <p className="text-xs text-red-500 mt-1">
                    Ogohlantirish: Summa topilmadi
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  To'lov usuli
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
                      <div className="text-xs sm:text-sm text-gray-500">Resepshonda to'lash</div>
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
                Bekor qilish
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base"
              >
                To'lash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Sharh qoldirish ⭐</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-gray-600">Xona:</span>
                  <span className="font-semibold text-right">
                    {reviewModal.room?.room_type?.name} - #{reviewModal.room?.room_number}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Baho (1-5 yulduz)
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
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Izoh
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                  placeholder="Tajribangiz haqida yozing..."
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
                Bekor qilish
              </button>
              <button
                onClick={handleReview}
                disabled={!reviewData.comment}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-600">Bronni bekor qilish ⚠️</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg mb-4">
                <p className="text-sm sm:text-base text-gray-700 mb-2">
                  Siz ushbu bronni bekor qilmoqchimisiz?
                </p>
                <div className="mt-3 space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bron raqami:</span>
                    <span className="font-semibold">#{cancelModal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Xona:</span>
                    <span className="font-semibold text-right">
                      {cancelModal.room?.room_type?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Summa:</span>
                    <span className="font-semibold text-red-600">
                      ${cancelModal.total_price}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                ⚠️ Bekor qilish shartlari: Kelishdan 24 soat oldin bekor qilsangiz, pul to'liq qaytariladi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold text-sm sm:text-base"
              >
                Yo'q, saqlash
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-semibold text-sm sm:text-base"
              >
                Ha, bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;
