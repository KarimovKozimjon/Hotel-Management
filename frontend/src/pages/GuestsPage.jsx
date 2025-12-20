import { useState, useEffect } from 'react';
import { guestService } from '../services/guestService';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const GuestsPage = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    id_number: ''
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data);
      setLoading(false);
    } catch (error) {
      toast.error('Mehmonlarni yuklashda xatolik');
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchGuests();
      return;
    }
    try {
      const data = await guestService.search(searchQuery);
      setGuests(data);
    } catch (error) {
      toast.error('Qidiruvda xatolik');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await guestService.update(editingGuest.id, formData);
        toast.success('Mehmon yangilandi');
      } else {
        await guestService.create(formData);
        toast.success('Mehmon qo\'shildi');
      }
      setShowModal(false);
      resetForm();
      fetchGuests();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone,
      address: guest.address || '',
      id_number: guest.id_number || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Mehmonni o\'chirmoqchimisiz?')) {
      try {
        await guestService.delete(id);
        toast.success('Mehmon o\'chirildi');
        fetchGuests();
      } catch (error) {
        toast.error('Mehmonni o\'chirishda xatolik');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      id_number: ''
    });
    setEditingGuest(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mehmonlar</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Yangi mehmon
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ism, email yoki telefon bo'yicha qidirish..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Qidirish
          </button>
          <button
            onClick={() => { setSearchQuery(''); fetchGuests(); }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Tozalash
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ism</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Familiya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{guest.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{guest.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{guest.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{guest.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(guest)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingGuest ? 'Mehmonni tahrirlash' : 'Yangi mehmon'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Ism</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Familiya</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Telefon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Manzil</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">ID/Passport raqami</label>
                <input
                  type="text"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsPage;
