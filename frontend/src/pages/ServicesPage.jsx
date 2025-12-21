import { useState, useEffect } from 'react';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddToBookingModal, setShowAddToBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'room_service',
    is_active: true
  });
  const [addToBookingData, setAddToBookingData] = useState({
    booking_id: '',
    service_id: '',
    quantity: 1
  });

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAll();
      setServices(data);
      setLoading(false);
    } catch (error) {
      toast.error('Xizmatlarni yuklashda xatolik');
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      // Faqat checked_in va confirmed statusdagi bronlar
      setBookings(data.filter(b => b.status === 'checked_in' || b.status === 'confirmed'));
    } catch (error) {
      toast.error('Bronlarni yuklashda xatolik');
    }
  };

  const handleAddToBooking = async (e) => {
    e.preventDefault();
    try {
      await serviceService.addToBooking(addToBookingData);
      toast.success('Xizmat bronlashga qo\'shildi');
      setShowAddToBookingModal(false);
      resetAddToBookingForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xizmatni qo\'shishda xatolik');
    }
  };

  const openAddToBookingModal = (service) => {
    setSelectedService(service);
    setAddToBookingData({
      booking_id: '',
      service_id: service.id,
      quantity: 1
    });
    setShowAddToBookingModal(true);
  };

  const resetAddToBookingForm = () => {
    setAddToBookingData({
      booking_id: '',
      service_id: '',
      quantity: 1
    });
    setSelectedService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceService.update(editingService.id, formData);
        toast.success('Xizmat yangilandi');
      } else {
        await serviceService.create(formData);
        toast.success('Xizmat qo\'shildi');
      }
      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      category: service.category,
      is_active: service.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xizmatni o\'chirmoqchimisiz?')) {
      try {
        await serviceService.delete(id);
        toast.success('Xizmat o\'chirildi');
        fetchServices();
      } catch (error) {
        toast.error('Xizmatni o\'chirishda xatolik');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'room_service',
      is_active: true
    });
    setEditingService(null);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      room_service: 'Xona xizmati',
      laundry: 'Kir yuvish',
      restaurant: 'Restoran',
      spa: 'Spa',
      transport: 'Transport',
      other: 'Boshqa'
    };
    return labels[category] || category;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Xizmatlar</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Yangi xizmat
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  <span className="text-sm text-gray-500">{getCategoryLabel(service.category)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  service.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {service.is_active ? 'Faol' : 'Nofaol'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-blue-600">${service.price}</span>
              </div>
              
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => openAddToBookingModal(service)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Bronlashga qo'shish
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100"
                >
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Xizmatlar topilmadi</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingService ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nomi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Narxi ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Kategoriya</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="room_service">Xona xizmati</option>
                  <option value="laundry">Kir yuvish</option>
                  <option value="restaurant">Restoran</option>
                  <option value="spa">Spa</option>
                  <option value="transport">Transport</option>
                  <option value="other">Boshqa</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Faol</span>
                </label>
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

      {/* Add to Booking Modal */}
      {showAddToBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Xizmatni bronlashga qo'shish</h2>
            
            {selectedService && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedService.name}</h3>
                <p className="text-sm text-gray-600">{selectedService.description}</p>
                <p className="text-xl font-bold text-blue-600 mt-2">${selectedService.price}</p>
              </div>
            )}

            <form onSubmit={handleAddToBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Bron</label>
                <select
                  value={addToBookingData.booking_id}
                  onChange={(e) => setAddToBookingData({ ...addToBookingData, booking_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Tanlang</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      #{booking.id} - {booking.guest?.first_name} {booking.guest?.last_name} - Xona {booking.room?.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Miqdor</label>
                <input
                  type="number"
                  min="1"
                  value={addToBookingData.quantity}
                  onChange={(e) => setAddToBookingData({ ...addToBookingData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {selectedService && addToBookingData.quantity && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Jami summa:</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(selectedService.price * addToBookingData.quantity).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Qo'shish
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddToBookingModal(false); resetAddToBookingForm(); }}
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

export default ServicesPage;
