import { useState } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

function ChangePassword() {
  const { t } = useTranslation();
  const { guest } = useGuestAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error(t('guest.changePasswordPage.toast.mismatch'));
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error(t('guest.changePasswordPage.toast.minLength', { count: 6 }));
      return;
    }

    setLoading(true);

    try {
      await api.put(`/guest/change-password`, {
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.new_password_confirmation
      });

      toast.success(t('guest.changePasswordPage.toast.success'));
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || t('guest.changePasswordPage.toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700 flex items-center gap-3 mb-1">
              <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                {/* Ikon */}
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4z" /></svg>
              </span>
              {t('guest.changePassword')}
            </h1>
            <p className="text-base md:text-lg text-blue-400">
              {t('guest.changePasswordPage.subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.changePasswordPage.currentPassword')}</label>
              <div className="relative">
                <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.current_password}
                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                    required
                    className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder={t('guest.changePasswordPage.currentPasswordPlaceholder')}
                  />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.changePasswordPage.newPassword')}</label>
              <div className="relative">
                <input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder={t('guest.changePasswordPage.newPasswordPlaceholder', { count: 6 })}
                  />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-blue-700 mb-1">{t('guest.changePasswordPage.confirmPassword')}</label>
              <div className="relative">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.new_password_confirmation}
                    onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder={t('guest.changePasswordPage.confirmPasswordPlaceholder')}
                  />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Parol uchun tavsiyalar blokini olib tashlash yoki soddalashtirish mumkin */}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        {/* ...existing code... */}
      </div>
    </div>
  );
}

export default ChangePassword;
