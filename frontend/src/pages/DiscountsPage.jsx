import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

function DiscountsPage() {
  const { t, i18n } = useTranslation();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    min_amount: '',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const formatUsd = (amount) => {
    const numericAmount = Number(amount ?? 0);
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD'
    }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const fetchDiscounts = async () => {
    try {
      const response = await api.get('/discounts');
      setDiscounts(response.data);
    } catch (error) {
      toast.error(t('admin.pages.discounts.toast.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDiscount) {
        await api.put(`/discounts/${editingDiscount.id}`, formData);
        toast.success(t('admin.pages.discounts.toast.updated'));
      } else {
        await api.post('/discounts', formData);
        toast.success(t('admin.pages.discounts.toast.created'));
      }
      
      resetForm();
      fetchDiscounts();
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error(t('admin.pages.discounts.toast.genericError'));
      }
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description || '',
      type: discount.type,
      value: discount.value,
      min_amount: discount.min_amount || '',
      max_discount: discount.max_discount || '',
      usage_limit: discount.usage_limit || '',
      start_date: discount.start_date,
      end_date: discount.end_date,
      is_active: discount.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.pages.discounts.confirmDelete'))) return;
    
    try {
      await api.delete(`/discounts/${id}`);
      toast.success(t('admin.pages.discounts.toast.deleted'));
      fetchDiscounts();
    } catch (error) {
      toast.error(t('admin.pages.discounts.toast.deleteError'));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      min_amount: '',
      max_discount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      is_active: true
    });
    setEditingDiscount(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getStatusBadge = (discount) => {
    const now = new Date();
    const start = new Date(discount.start_date);
    const end = new Date(discount.end_date);
    
    if (!discount.is_active) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          {t('admin.pages.discounts.status.disabled')}
        </span>
      );
    }
    
    if (now < start) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          {t('admin.pages.discounts.status.pending')}
        </span>
      );
    }
    
    if (now > end) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          {t('admin.pages.discounts.status.expired')}
        </span>
      );
    }
    
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          {t('admin.pages.discounts.status.limitReached')}
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        {t('admin.pages.discounts.status.active')}
      </span>
    );
  };

  if (loading) {
    return <Loader className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.pages.discounts.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('admin.pages.discounts.addNew')}
        </button>
      </div>

      {/* Discounts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.code')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.value')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.period')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.usage')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.discounts.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    {t('admin.pages.discounts.empty')}
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-600">{discount.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{discount.name}</div>
                      {discount.description && (
                        <div className="text-xs text-gray-500">{discount.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        discount.type === 'percentage' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {discount.type === 'percentage'
                          ? t('admin.pages.discounts.type.percentage')
                          : t('admin.pages.discounts.type.fixed')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold">
                        {discount.type === 'percentage'
                          ? t('admin.pages.discounts.value.percent', { value: discount.value })
                          : formatUsd(discount.value)}
                      </div>
                      {discount.max_discount && (
                        <div className="text-xs text-gray-500">
                          {t('admin.pages.discounts.value.max', { value: formatUsd(discount.max_discount) })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        {formatDate(discount.start_date)}
                        <br />
                        {formatDate(discount.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {discount.used_count}
                        {discount.usage_limit && ` / ${discount.usage_limit}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(discount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDiscount ? t('admin.pages.discounts.editTitle') : t('admin.pages.discounts.createTitle')}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pages.discounts.form.code')} *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={t('admin.pages.discounts.form.codePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pages.discounts.form.name')} *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={t('admin.pages.discounts.form.namePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pages.discounts.form.description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder={t('admin.pages.discounts.form.descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pages.discounts.form.type')} *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="percentage">{t('admin.pages.discounts.type.percentage')} (%)</option>
                    <option value="fixed">{t('admin.pages.discounts.type.fixed')} ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.pages.discounts.form.value')} * {formData.type === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={formData.type === 'percentage'
                      ? t('admin.pages.discounts.form.valuePlaceholderPercent')
                      : t('admin.pages.discounts.form.valuePlaceholderFixed')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.pages.discounts.form.minAmountUsd')}
                  </label>
                  <input
                    type="number"
                    name="min_amount"
                    value={formData.min_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={t('admin.pages.discounts.form.minAmountPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.pages.discounts.form.maxDiscountUsd')}
                  </label>
                  <input
                    type="number"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={t('admin.pages.discounts.form.maxDiscountPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.pages.discounts.form.usageLimit')}
                </label>
                <input
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder={t('admin.pages.discounts.form.usageLimitPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.pages.discounts.form.startDate')} *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.pages.discounts.form.endDate')} *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{t('admin.pages.discounts.form.active')}</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {editingDiscount ? t('admin.pages.discounts.actions.update') : t('admin.pages.discounts.actions.create')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold"
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
}

export default DiscountsPage;
