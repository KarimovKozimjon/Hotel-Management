import { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    payment_method: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await paymentService.getAll(filter);
      setPayments(data);
      setLoading(false);
    } catch (error) {
      toast.error('To\'lovlarni yuklashda xatolik');
      setLoading(false);
    }
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
      pending: 'Kutilmoqda',
      completed: 'To\'langan',
      failed: 'Xatolik',
      refunded: 'Qaytarilgan'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Naqd',
      card: 'Karta',
      online: 'Onlayn',
      bank_transfer: 'Bank o\'tkazmasi'
    };
    return labels[method] || method;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">To'lovlar</h1>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Holat</label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Barchasi</option>
                <option value="pending">Kutilmoqda</option>
                <option value="completed">To'langan</option>
                <option value="failed">Xatolik</option>
                <option value="refunded">Qaytarilgan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To'lov turi</label>
              <select
                value={filter.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Barchasi</option>
                <option value="cash">Naqd</option>
                <option value="card">Karta</option>
                <option value="online">Onlayn</option>
                <option value="bank_transfer">Bank o'tkazmasi</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilter}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Filtr qo'llash
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mehmon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To'lov turi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sana</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    To'lovlar topilmadi
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
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
            <p className="text-sm text-gray-600">Jami to'lovlar</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">To'langan</p>
            <p className="text-2xl font-bold text-green-600">
              ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Kutilmoqda</p>
            <p className="text-2xl font-bold text-yellow-600">
              ${payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Xatolik</p>
            <p className="text-2xl font-bold text-red-600">
              {payments.filter(p => p.status === 'failed').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
