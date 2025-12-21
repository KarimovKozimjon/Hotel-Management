import { useState } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function ChangePassword() {
  const { guest } = useGuestAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error('Yangi parollar mos kelmaydi');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/guest/change-password`, {
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.new_password_confirmation
      });

      toast.success('Parol muvaffaqiyatli o\'zgartirildi');
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Parolni o\'zgartirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Parolni o'zgartirish 🔒</h1>
          <p className="mt-1 text-sm text-gray-500">
            Xavfsizlik uchun parolingizni muntazam o'zgartiring
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Joriy parol *
              </label>
              <input
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Joriy parolingizni kiriting"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Yangi parol *
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                required
                minLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Yangi parolni kiriting (kamida 6 ta belgi)"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Yangi parolni tasdiqlash *
              </label>
              <input
                type="password"
                value={formData.new_password_confirmation}
                onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                required
                minLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Yangi parolni qayta kiriting"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Parol uchun tavsiyalar:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Kamida 6 ta belgidan iborat bo'lsin</li>
                <li>Katta va kichik harflardan foydalaning</li>
                <li>Raqam va maxsus belgilar qo'shing</li>
                <li>Oddiy so'zlardan foydalanmang</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
