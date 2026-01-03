import { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { bookingService } from '../services/bookingService';
import Loader from '../components/common/Loader';
import SearchBar from '../components/common/SearchBar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const PaymentsPage = () => {
  const { t, i18n } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    booking_id: '',
    amount: '',
    payment_method: 'cash',
    transaction_id: '',
    notes: ''
  });
  const [filter, setFilter] = useState({
    status: '',
    payment_method: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await paymentService.getAll(filter);
      setPayments(data);
      setFilteredPayments(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('staff.payments.toasts.fetchError'));
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = payments.filter(payment =>
      payment.booking?.guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(filtered);
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      // Faqat checked_in statusdagi bronlarni olish
      setBookings(data.filter(b => b.status === 'checked_in' || b.status === 'confirmed'));
    } catch (error) {
      toast.error(t('staff.payments.toasts.bookingsFetchError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.create(formData);
      toast.success(t('staff.payments.toasts.created'));
      setShowModal(false);
      resetForm();
      fetchPayments();
    } catch (error) {
      toast.error(t('staff.payments.toasts.createError'));
    }
  };

  const resetForm = () => {
    setFormData({
      booking_id: '',
      amount: '',
      payment_method: 'cash',
      transaction_id: '',
      notes: ''
    });
  };

  const handleFilterChange = (field, value) => {
    setFilter({ ...filter, [field]: value });
  };

  const applyFilter = () => {
    setLoading(true);
    fetchPayments();
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      pending: t('staff.status.pending'),
      completed: t('staff.status.completed'),
      failed: t('staff.status.failed'),
      refunded: t('staff.status.refunded')
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: t('staff.paymentMethod.cash'),
      card: t('staff.paymentMethod.card')
    };
    return labels[method] || method;
  };

  const getDateLocale = () => {
    const lang = (i18n.language || 'en').toLowerCase();
    if (lang.startsWith('ru')) return 'ru-RU';
    if (lang.startsWith('uz')) return 'uz-UZ';
    return 'en-US';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(getDateLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.payments')}</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + {t('staff.payments.new')}
          </button>
        </div>

        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder={t('staff.payments.searchPlaceholder')} />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('staff.payments.filters.status')}</label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">{t('staff.payments.filters.all')}</option>
                <option value="pending">{t('staff.status.pending')}</option>
                <option value="completed">{t('staff.status.completed')}</option>
                <option value="failed">{t('staff.status.failed')}</option>
                <option value="refunded">{t('staff.status.refunded')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('staff.payments.filters.method')}</label>
              <select
                value={filter.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">{t('staff.payments.filters.all')}</option>
                <option value="cash">{t('staff.paymentMethod.cash')}</option>
                <option value="card">{t('staff.paymentMethod.card')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilter}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {t('staff.payments.filters.apply')}
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.payments.headers.id')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.payments.headers.guest')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.payments.headers.amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.payments.headers.method')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.payments.headers.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.payments.headers.date')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {t('staff.payments.empty')}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">#{payment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.booking?.guest?.first_name} {payment.booking?.guest?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      ${payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('staff.payments.summary.total')}</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('staff.status.completed')}</p>
            <p className="text-2xl font-bold text-green-600">
              ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('staff.status.pending')}</p>
            <p className="text-2xl font-bold text-yellow-600">
              ${payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('staff.status.failed')}</p>
            <p className="text-2xl font-bold text-red-600">
              {payments.filter(p => p.status === 'failed').length}
            </p>
          </div>
        </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">{t('staff.payments.modal.title')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.payments.modal.booking')}</label>
                <select
                  value={formData.booking_id}
                  onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">{t('staff.payments.modal.select')}</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      #{booking.id} - {booking.guest?.first_name} {booking.guest?.last_name} - {t('staff.payments.modal.roomLabel')} {booking.room?.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.payments.modal.amount')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.payments.modal.method')}</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="cash">{t('staff.paymentMethod.cash')}</option>
                  <option value="card">{t('staff.paymentMethod.card')}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.payments.modal.transactionId')}</label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder={t('staff.payments.modal.transactionIdPlaceholder')}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.payments.modal.notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder={t('staff.payments.modal.notesPlaceholder')}
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {t('staff.payments.modal.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
