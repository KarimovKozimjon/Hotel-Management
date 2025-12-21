import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function PaymentHistory() {
  const { guest } = useGuestAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/guest/payments');
      setPayments(response.data.data || []);
    } catch (error) {
      toast.error('To\'lovlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      card: { icon: '💳', label: 'Bank kartasi' },
      online: { icon: '🌐', label: 'Online to\'lov' },
      cash: { icon: '💵', label: 'Naqd pul' },
      bank_transfer: { icon: '🏦', label: 'Bank o\'tkazmasi' }
    };
    const badge = badges[method] || { icon: '💰', label: method };
    return (
      <span className="inline-flex items-center">
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'To\'langan' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Kutilmoqda' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Muvaffaqiyatsiz' },
      refunded: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Qaytarilgan' }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
      .toFixed(2);
  };

  const handleDownloadReceipt = (paymentId) => {
    const token = localStorage.getItem('guestToken');
    const url = `http://localhost:8000/api/invoices/payment/${paymentId}`;
    
    // Open in new tab to download
    window.open(url, '_blank');
    toast.success('Kvitansiya yuklanmoqda...');
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
          <h1 className="text-3xl font-bold text-gray-900">To'lovlar tarixi 💳</h1>
          <p className="mt-1 text-sm text-gray-500">
            Barcha to'lovlaringiz va tranzaksiyalaringiz
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami to'lovlar</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">To'langan</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami summa</p>
                <p className="text-2xl font-bold text-blue-600">${calculateTotal()}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">💳</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">To'lovlar topilmadi</h3>
            <p className="text-gray-600 mb-6">Siz hali hech qanday to'lov qilmagansiz</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bron
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To'lov usuli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holati
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sana
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Bron #{payment.booking_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPaymentMethodBadge(payment.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Yuklab olish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;
