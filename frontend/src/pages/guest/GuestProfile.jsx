import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Profilim 👤</h1>
          <p className="mt-1 text-sm text-gray-500">
            Shaxsiy ma'lumotlarni ko'ring va tahrirlang
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Shaxsiy ma'lumotlar</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                ✏️ Tahrirlash
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Ism</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Familiya</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  disabled={true}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Email o'zgartirib bo'lmaydi</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Pasport raqami</label>
                <input
                  type="text"
                  value={formData.passport_number}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Tug'ilgan kun</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Millati</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">Manzil</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow mt-6 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hisob ma'lumotlari</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-semibold text-gray-900">Hisob holati</p>
                <p className="text-sm text-gray-600">Akkauntingiz faol</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Faol
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-semibold text-gray-900">Parolni o'zgartirish</p>
                <p className="text-sm text-gray-600">Parolingizni yangilang</p>
              </div>
              <button
                onClick={() => toast.info('Parolni o\'zgartirish funksiyasi qo\'shilmoqda')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                O'zgartirish →
              </button>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-semibold text-gray-900">Hisobni o'chirish</p>
                <p className="text-sm text-gray-600">Akkauntingizni butunlay o'chirish</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Haqiqatan ham hisobingizni o\'chirmoqchimisiz?')) {
                    toast.error('Hisobni o\'chirish funksiyasi qo\'shilmoqda');
                  }
                }}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestProfile;
