import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUser, FiEdit3, FiLock, FiCheckCircle, FiKey, FiAlertTriangle } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function GuestProfile() {
  const { guest, setGuest } = useGuestAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    passport_number: '',
    date_of_birth: '',
    nationality: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (guest) {
      setFormData({
        first_name: guest.first_name || '',
        last_name: guest.last_name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        passport_number: guest.passport_number || '',
        date_of_birth: guest.date_of_birth || '',
        nationality: guest.nationality || '',
        address: guest.address || '',
      });
    }
  }, [guest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guest) {
      toast.error(t('guest.sessionExpired') || 'Sessiya tugagan. Qayta login qiling.');
      window.location.href = '/guest/login';
      return;
    }
    setLoading(true);

    try {
      const response = await api.put(`/guest/profile`, formData);
      toast.success(t('guest.profilePage.updateSuccess') || 'Profil muvaffaqiyatli yangilandi');

      // Update guest in context and localStorage
      const updatedGuest = response.data;
      setGuest(updatedGuest);
      localStorage.setItem('guest', JSON.stringify(updatedGuest));

      setIsEditing(false);

      // Check if guest is still valid after update
      if (!updatedGuest || !updatedGuest.id) {
        toast.error(t('guest.sessionExpired') || 'Sessiya tugagan. Qayta login qiling.');
        window.location.href = '/guest/login';
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('guest.sessionExpired') || 'Sessiya tugagan. Qayta login qiling.');
        window.location.href = '/guest/login';
        return;
      }
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error(t('guest.profilePage.updateError') || 'Profilni yangilashda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original guest data
    if (guest) {
      setFormData({
        first_name: guest.first_name || '',
        last_name: guest.last_name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        passport_number: guest.passport_number || '',
        date_of_birth: guest.date_of_birth || '',
        nationality: guest.nationality || '',
        address: guest.address || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-purple-100 font-sans">
      {/* Hero Header */}
      <div className="bg-white/80 border-b border-blue-100 shadow-md backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
              <FaUserCircle className="w-14 h-14 text-blue-200 group-hover:text-blue-400 transition-colors duration-300" />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-3 mb-1 drop-shadow-lg">
              {t('guest.profilePage.title') || 'Profilim'}
            </h1>
            <p className="text-base text-blue-500 font-medium">{t('guest.profilePage.subtitle') || "Shaxsiy ma'lumotlarni ko'ring va tahrirlang"}</p>
          </motion.div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Shaxsiy ma'lumotlar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-lg">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <FiUser className="w-5 h-5 text-white" />
                </span>
                {t('guest.personalInfo') || "Shaxsiy ma'lumotlar"}
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-5 py-2 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 hover:scale-105 transition-all border-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 text-sm"
                >
                  <FiEdit3 className="w-5 h-5 mr-1 inline" /> {t('common.edit') || 'Tahrirlash'}
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="bg-white/90 border-2 rounded-2xl p-4 shadow-xl relative overflow-hidden"
              style={{
                borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderImageSlice: 1,
              }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ...existing code... */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.firstName') || 'Ism'}</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.lastName') || 'Familiya'}</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.email') || 'Email'}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500"
                    disabled={true}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FiLock className="w-5 h-5" />
                    {t('guest.profilePage.emailReadOnly') || "Email o'zgartirib bo'lmaydi"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.phone') || 'Telefon'}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.passportNumber') || 'Pasport raqami'}</label>
                  <input
                    type="text"
                    value={formData.passport_number}
                    onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.dateOfBirth') || "Tug'ilgan sana"}</label>
                  <input
                    type="date"
                    value={formData.date_of_birth ? formData.date_of_birth.slice(0, 10) : ''}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.nationality') || 'Millati'}</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.fields.address') || 'Manzil'}</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                    rows="3"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 font-semibold px-5 py-2 rounded-xl shadow hover:bg-gray-200 transition-all border-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 text-sm"
                    disabled={loading}
                  >
                    {t('common.cancel') || 'Bekor qilish'}
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-5 py-2 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 hover:scale-105 transition-all border-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 text-sm"
                    disabled={loading}
                  >
                    {loading ? (t('common.loading') || 'Yuklanmoqda...') : (t('common.save') || 'Saqlash')}
                  </button>
                </div>
              )}
            </form>
          </div>
          {/* Hisob ma'lumotlari */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 border-2 rounded-2xl p-4 shadow-xl relative overflow-hidden"
              style={{
                borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderImageSlice: 1,
              }}
            >
              <h2 className="text-lg font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2 drop-shadow-lg">
                <FiLock className="w-5 h-5 text-indigo-500 drop-shadow-lg" />
                {t('guest.account.title') || "Hisob ma'lumotlari"}
              </h2>
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center py-3 px-3 rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 shadow-md hover:shadow-lg transition-all"
                >
                  <div>
                    <p className="font-semibold text-indigo-600 flex items-center gap-2">
                      <FiCheckCircle className="w-5 h-5 text-green-400" />
                      {t('guest.account.statusLabel') || 'Hisob holati'}
                    </p>
                    <p className="text-sm text-gray-400">{t('guest.account.activeHint') || 'Akkauntingiz faol'}</p>
                  </div>
                  <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-green-900 to-emerald-800 text-green-200 shadow-sm border border-green-400">
                    {t('guest.account.activeBadge') || 'Faol'}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center py-3 px-3 rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 shadow-md hover:shadow-lg transition-all"
                >
                  <div>
                    <p className="font-semibold text-indigo-600 flex items-center gap-2">
                      <FiKey className="w-5 h-5 text-indigo-500" />
                      {t('guest.changePassword') || "Parolni o'zgartirish"}
                    </p>
                    <p className="text-sm text-gray-400">{t('guest.account.changePasswordHint') || 'Parolingizni yangilang'}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/guest/change-password'}
                    className="text-indigo-500 hover:text-purple-600 font-semibold flex items-center gap-1 border-b-2 border-indigo-300 hover:border-purple-400 transition-all"
                  >
                    {t('guest.account.change') || "O'zgartirish"} →
                  </motion.button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center py-3 px-3 rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 shadow-md hover:shadow-lg transition-all"
                >
                  <div>
                    <p className="font-semibold text-indigo-600 flex items-center gap-2">
                      <FiAlertTriangle className="w-5 h-5 text-red-400" />
                      {t('guest.account.deleteTitle') || "Hisobni o'chirish"}
                    </p>
                    <p className="text-sm text-gray-400">{t('guest.account.deleteHint') || "Akkauntingizni butunlay o'chirish"}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      if (confirm(t('guest.account.deleteConfirm') || "Haqiqatan ham hisobingizni o'chirmoqchimisiz?")) {
                        try {
                          await api.delete('/guest/delete-account');
                          toast.success(t('guest.account.deleteSuccess') || "Hisob muvaffaqiyatli o'chirildi");
                          localStorage.removeItem('guestToken');
                          localStorage.removeItem('guest');
                          window.location.href = '/guest/login';
                        } catch (error) {
                          toast.error(error.response?.data?.message || (t('guest.account.deleteError') || "Hisobni o'chirishda xatolik"));
                        }
                      }
                    }}
                    className="text-red-400 hover:text-purple-600 font-semibold border-b-2 border-red-300 hover:border-purple-400 transition-all"
                  >
                    {t('common.delete') || "O'chirish"}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestProfile;