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

  const formatUsd = (value) => {
    const numberValue = Number(value);
    return new Intl.NumberFormat(i18n.language || 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(numberValue) ? numberValue : 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return t('common.notAvailable') || '-';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleString(i18n.language || 'en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchPayments = async () => {
    try {
      const data = await paymentService.getAll(filter);
      setPayments(data);
      setFilteredPayments(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('admin.pages.payments.toast.loadError'));
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const term = (searchTerm || '').toLowerCase();
    const filtered = payments.filter(payment => {
      const guestName = `${payment.booking?.guest?.first_name || ''} ${payment.booking?.guest?.last_name || ''}`.trim().toLowerCase();
      const method = (payment.payment_method || '').toLowerCase();
      const trx = (payment.transaction_id || '').toLowerCase();
      return guestName.includes(term) || method.includes(term) || trx.includes(term);
    });
    setFilteredPayments(filtered);
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      // Faqat checked_in statusdagi bronlarni olish
      setBookings(data.filter(b => b.status === 'checked_in' || b.status === 'confirmed'));
    } catch (error) {
      toast.error(t('admin.pages.payments.toast.bookingsLoadError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.create(formData);
      toast.success(t('admin.pages.payments.toast.created'));
      setShowModal(false);
      resetForm();
      fetchPayments();
    } catch (error) {
      toast.error(t('admin.pages.payments.toast.createError'));
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
    const label = t(`admin.pages.payments.status.${status}`);
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {label || status}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    return t(`admin.pages.payments.method.${method}`) || method;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.payments')}</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + {t('admin.pages.payments.addNew')}
          </button>
        </div>

        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder={t('admin.pages.payments.searchPlaceholder')} />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.pages.payments.filters.status')}</label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">{t('admin.pages.payments.filters.all')}</option>
                <option value="pending">{t('admin.pages.payments.status.pending')}</option>
                <option value="completed">{t('admin.pages.payments.status.completed')}</option>
                <option value="failed">{t('admin.pages.payments.status.failed')}</option>
                <option value="refunded">{t('admin.pages.payments.status.refunded')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.pages.payments.filters.method')}</label>
              <select
                value={filter.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">{t('admin.pages.payments.filters.all')}</option>
                <option value="cash">{t('admin.pages.payments.method.cash')}</option>
                <option value="card">{t('admin.pages.payments.method.card')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilter}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {t('admin.pages.payments.filters.apply')}
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow-md rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.payments.table.id')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.payments.table.guest')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.payments.table.amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.payments.table.method')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.payments.table.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.payments.table.date')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {t('admin.pages.payments.empty')}
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
                      {formatUsd(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.payments.total')}</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.payments.summary.paid')}</p>
            <p className="text-2xl font-bold text-green-600">
              {formatUsd(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0))}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.payments.summary.pending')}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatUsd(payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0))}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.payments.summary.failed')}</p>
            <p className="text-2xl font-bold text-red-600">
              {payments.filter(p => p.status === 'failed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">{t('admin.pages.payments.createTitle')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.payments.form.booking')}</label>
                <select
                  value={formData.booking_id}
                  onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      #{booking.id} - {booking.guest?.first_name} {booking.guest?.last_name} - {t('admin.pages.payments.form.roomPrefix')} {booking.room?.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.payments.form.amount')}</label>
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
                <label className="block text-gray-700 mb-2">{t('admin.pages.payments.form.method')}</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="cash">{t('admin.pages.payments.method.cash')}</option>
                  <option value="card">{t('admin.pages.payments.method.card')}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.payments.form.transactionId')}</label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder={t('admin.pages.payments.form.transactionPlaceholder')}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.payments.form.notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder={t('admin.pages.payments.form.notesPlaceholder')}
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {t('admin.pages.payments.form.save')}
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
