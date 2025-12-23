import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUser, FiEdit3, FiLock, FiCheckCircle, FiKey, FiAlertTriangle } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

function GuestProfile() {
  const { guest, setGuest } = useGuestAuth();
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
    setLoading(true);

    try {
      const response = await api.put(`/guests/${guest.id}`, formData);
      toast.success('Profil muvaffaqiyatli yangilandi');
      
      // Update guest in context and localStorage
      const updatedGuest = response.data;
      setGuest(updatedGuest);
      localStorage.setItem('guest', JSON.stringify(updatedGuest));
      
      setIsEditing(false);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error('Profilni yangilashda xatolik');
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
    <div className="min-h-screen bg-blue-50 font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center gap-6 w-full"
          >
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
              className="relative group"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                {guest?.avatarUrl ? (
                  <img src={guest.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <FaUserCircle className="w-24 h-24 text-blue-200 group-hover:text-blue-400 transition-colors duration-300" />
                )}
              </div>
            </motion.div>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-blue-700 flex items-center gap-3 tracking-wide">
                <FiUser className="w-8 h-8 text-blue-600" />
                Profilim
              </h1>
              <p className="mt-2 text-blue-400 text-lg font-medium">
                Shaxsiy ma'lumotlarni ko'ring va tahrirlang
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <FiUser className="w-5 h-5 text-white" />
            </span>
            Shaxsiy ma'lumotlar
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-100 text-blue-700 font-bold px-6 py-2 rounded-lg shadow hover:bg-blue-200 transition-all border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <FiEdit3 className="w-5 h-5 mr-1 inline" /> Tahrirlash
            </button>
          )}
        </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Ism</label>
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
                <label className="block text-sm font-medium text-blue-700 mb-1">Familiya</label>
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
                <label className="block text-sm font-medium text-blue-700 mb-1">Email</label>
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
                  Email o'zgartirib bo'lmaydi
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Telefon</label>
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
                <label className="block text-sm font-medium text-blue-700 mb-1">Pasport raqami</label>
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
                <label className="block text-sm font-medium text-blue-700 mb-1">Tug'ilgan sana</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-900 font-medium transition-all"
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Millati</label>
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
                <label className="block text-sm font-medium text-blue-700 mb-1">Manzil</label>
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
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  disabled={loading}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-lg shadow hover:bg-indigo-700 transition-all border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Yuklanmoqda...' : 'Saqlash'}
                </button>
              </div>
            )}
          </form>
          </form>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#181818]/95 via-[#232b3b]/95 to-[#2d2d2d]/90 dark:from-[#18181b]/95 dark:via-[#232b3b]/95 dark:to-[#181818]/90 rounded-2xl shadow-2xl mt-6 p-6 border-2 border-yellow-400 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-200 to-white bg-clip-text text-transparent mb-6 font-serif tracking-wide flex items-center gap-2">
            <FiLock className="w-7 h-7 text-yellow-400 drop-shadow-lg" />
            Hisob ma'lumotlari
          </h2>
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center py-4 px-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-[#232b3b]/80 to-[#181818]/80 shadow-md hover:shadow-lg transition-all"
            >
              <div>
                <p className="font-semibold text-yellow-200 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-green-400" />
                  Hisob holati
                </p>
                <p className="text-sm text-gray-400">Akkauntingiz faol</p>
              </div>
              <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-green-900 to-emerald-800 text-green-200 shadow-sm border border-green-400">
                Faol
              </span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center py-4 px-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-[#232b3b]/80 to-[#181818]/80 shadow-md hover:shadow-lg transition-all"
            >
              <div>
                <p className="font-semibold text-yellow-200 flex items-center gap-2">
                  <FiKey className="w-5 h-5 text-yellow-400" />
                  Parolni o'zgartirish
                </p>
                <p className="text-sm text-gray-400">Parolingizni yangilang</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/guest/change-password'}
                className="text-blue-300 hover:text-yellow-300 font-semibold flex items-center gap-1 border-b-2 border-blue-300 hover:border-yellow-300 transition-all"
              >
                O'zgartirish →
              </motion.button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center py-4 px-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-[#232b3b]/80 to-[#181818]/80 shadow-md hover:shadow-lg transition-all"
            >
              <div>
                <p className="font-semibold text-yellow-200 flex items-center gap-2">
                  <FiAlertTriangle className="w-5 h-5 text-red-400" />
                  Hisobni o'chirish
                </p>
                <p className="text-sm text-gray-400">Akkauntingizni butunlay o'chirish</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (confirm('Haqiqatan ham hisobingizni o\'chirmoqchimisiz?')) {
                    toast.error('Hisobni o\'chirish funksiyasi qo\'shilmoqda');
                  }
                }}
                className="text-red-300 hover:text-yellow-300 font-semibold border-b-2 border-red-300 hover:border-yellow-300 transition-all"
              >
                O'chirish
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GuestProfile;