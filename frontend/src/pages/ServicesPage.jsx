import { useState, useEffect } from 'react';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import Loader from '../components/common/Loader';
import SearchBar from '../components/common/SearchBar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
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

  const formatUsd = (value) => {
    const numberValue = Number(value);
    return new Intl.NumberFormat(i18n.language || 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(numberValue) ? numberValue : 0);
  };

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAll();
      setServices(data);
      setFilteredServices(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('admin.pages.services.toast.loadError'));
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      // Faqat checked_in va confirmed statusdagi bronlar
      setBookings(data.filter(b => b.status === 'checked_in' || b.status === 'confirmed'));
    } catch (error) {
      toast.error(t('admin.pages.services.toast.bookingsLoadError'));
    }
  };

  const handleAddToBooking = async (e) => {
    e.preventDefault();
    try {
      await serviceService.addToBooking(addToBookingData);
      toast.success(t('admin.pages.services.toast.addedToBooking'));
      setShowAddToBookingModal(false);
      resetAddToBookingForm();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pages.services.toast.genericError'));
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
        toast.success(t('admin.pages.services.toast.updated'));
      } else {
        await serviceService.create(formData);
        toast.success(t('admin.pages.services.toast.created'));
      }
      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (error) {
      toast.error(t('admin.pages.services.toast.genericError'));
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
    if (window.confirm(t('admin.pages.services.confirmDelete'))) {
      try {
        await serviceService.delete(id);
        toast.success(t('admin.pages.services.toast.deleted'));
        fetchServices();
      } catch (error) {
        toast.error(t('admin.pages.services.toast.deleteError'));
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
    return t(`admin.pages.services.category.${category}`) || category;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.services')}</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + {t('admin.pages.services.addNew')}
          </button>
        </div>

        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder={t('admin.pages.services.searchPlaceholder')} />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
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
                  {service.is_active ? t('admin.pages.services.status.active') : t('admin.pages.services.status.inactive')}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-blue-600">{formatUsd(service.price)}</span>
              </div>
              
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => openAddToBookingModal(service)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  {t('admin.pages.services.actions.addToBooking')}
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('admin.pages.services.empty')}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingService ? t('admin.pages.services.editTitle') : t('admin.pages.services.createTitle')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.services.form.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.services.form.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.services.form.price')}</label>
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
                <label className="block text-gray-700 mb-2">{t('admin.pages.services.form.category')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="room_service">{t('admin.pages.services.category.room_service')}</option>
                  <option value="laundry">{t('admin.pages.services.category.laundry')}</option>
                  <option value="restaurant">{t('admin.pages.services.category.restaurant')}</option>
                  <option value="spa">{t('admin.pages.services.category.spa')}</option>
                  <option value="transport">{t('admin.pages.services.category.transport')}</option>
                  <option value="other">{t('admin.pages.services.category.other')}</option>
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
                  <span className="text-gray-700">{t('admin.pages.services.form.active')}</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t('common.cancel')}
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
            <h2 className="text-2xl font-bold mb-4">{t('admin.pages.services.addToBookingTitle')}</h2>
            
            {selectedService && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedService.name}</h3>
                <p className="text-sm text-gray-600">{selectedService.description}</p>
                <p className="text-xl font-bold text-blue-600 mt-2">{formatUsd(selectedService.price)}</p>
              </div>
            )}

            <form onSubmit={handleAddToBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.services.form.booking')}</label>
                <select
                  value={addToBookingData.booking_id}
                  onChange={(e) => setAddToBookingData({ ...addToBookingData, booking_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      #{booking.id} - {booking.guest?.first_name} {booking.guest?.last_name} - {t('admin.pages.services.form.roomPrefix')} {booking.room?.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.services.form.quantity')}</label>
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
                  <p className="text-sm text-gray-600">{t('admin.pages.services.form.total')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatUsd(selectedService.price * addToBookingData.quantity)}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  {t('admin.pages.services.actions.add')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddToBookingModal(false); resetAddToBookingForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
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
};

export default ServicesPage;
