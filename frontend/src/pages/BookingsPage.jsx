import { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { guestService } from '../services/guestService';
import { roomService } from '../services/roomService';
import Loader from '../components/common/Loader';
import SearchBar from '../components/common/SearchBar';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

const BookingsPage = () => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    total_amount: '',
    status: 'confirmed'
  });

  useEffect(() => {
    fetchBookings();
    fetchGuests();
    fetchRooms();
  }, []);

  const formatDateDisplay = (value) => {
    if (!value) return t('common.notAvailable') || '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(i18n.language || 'en', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatUsd = (value) => {
    const numberValue = Number(value);
    return new Intl.NumberFormat(i18n.language || 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(numberValue) ? numberValue : 0);
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      setBookings(data);
      setFilteredBookings(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('admin.pages.bookings.toast.loadError'));
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const term = (searchTerm || '').toLowerCase();
    const filtered = bookings.filter(booking =>
      `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim().toLowerCase().includes(term) ||
      (booking.room?.room_number || '').toLowerCase().includes(term) ||
      (booking.status || '').toLowerCase().includes(term)
    );
    setFilteredBookings(filtered);
  };

  const fetchGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data);
    } catch (error) {
      toast.error(t('admin.pages.bookings.toast.guestsLoadError'));
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.getAll();
      setRooms(data.filter(room => room.status === 'available'));
    } catch (error) {
      toast.error(t('admin.pages.bookings.toast.roomsLoadError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        await bookingService.update(editingBooking.id, formData);
        toast.success(t('admin.pages.bookings.toast.updated'));
      } else {
        await bookingService.create(formData);
        toast.success(t('admin.pages.bookings.toast.created'));
      }
      setShowModal(false);
      resetForm();
      fetchBookings();
    } catch (error) {
      toast.error(t('admin.pages.bookings.toast.genericError'));
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      guest_id: booking.guest_id,
      room_id: booking.room_id,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      total_amount: booking.total_amount,
      status: booking.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.pages.bookings.confirmDelete'))) {
      try {
        await bookingService.delete(id);
        toast.success(t('admin.pages.bookings.toast.deleted'));
        fetchBookings();
      } catch (error) {
        toast.error(t('admin.pages.bookings.toast.deleteError'));
      }
    }
  };
  const handleCheckIn = async (id) => {
    if (window.confirm(t('admin.pages.bookings.confirmCheckIn'))) {
      try {
        const result = await bookingService.checkIn(id);
        toast.success(t('admin.pages.bookings.toast.checkInSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'checkin',
          i18nKey: 'admin.pages.bookings.notifications.checkInTitle',
          i18nDescriptionKey: 'admin.pages.bookings.notifications.bookingNumber',
          i18nDescriptionParams: { id: result.booking_number || id },
          sound: true
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('admin.pages.bookings.toast.checkInError'));
      }
    }
  };

  const handleCheckOut = async (id) => {
    if (window.confirm(t('admin.pages.bookings.confirmCheckOut'))) {
      try {
        const result = await bookingService.checkOut(id);
        toast.success(t('admin.pages.bookings.toast.checkOutSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'checkout',
          i18nKey: 'admin.pages.bookings.notifications.checkOutTitle',
          i18nDescriptionKey: 'admin.pages.bookings.notifications.bookingNumber',
          i18nDescriptionParams: { id: result.booking_number || id },
          sound: true
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('admin.pages.bookings.toast.checkOutError'));
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm(t('admin.pages.bookings.confirmCancel'))) {
      try {
        const result = await bookingService.cancel(id);
        toast.success(t('admin.pages.bookings.toast.cancelSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'error',
          i18nKey: 'admin.pages.bookings.notifications.cancelTitle',
          i18nDescriptionKey: 'admin.pages.bookings.notifications.bookingNumber',
          i18nDescriptionParams: { id: result.booking_number || id },
          sound: false
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('admin.pages.bookings.toast.cancelError'));
      }
    }
  };

  const handleConfirm = async (id) => {
    if (window.confirm(t('admin.pages.bookings.confirmConfirm'))) {
      try {
        const result = await bookingService.update(id, { status: 'confirmed' });
        toast.success(t('admin.pages.bookings.toast.confirmSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'success',
          i18nKey: 'admin.pages.bookings.notifications.confirmTitle',
          i18nDescriptionKey: 'admin.pages.bookings.notifications.bookingNumber',
          i18nDescriptionParams: { id: result.booking_number || id },
          sound: false
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('admin.pages.bookings.toast.confirmError'));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      guest_id: '',
      room_id: '',
      check_in_date: '',
      check_out_date: '',
      total_amount: '',
      status: 'confirmed'
    });
    setEditingBooking(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      checked_in: 'bg-green-100 text-green-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labelKey = `booking.status.${status}`;
    const label = t(labelKey);
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {label || status}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.bookings')}</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + {t('admin.pages.bookings.addNew')}
          </button>
        </div>

        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder={t('admin.pages.bookings.searchPlaceholder')} />
        </div>

        <div className="bg-white shadow-md rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.bookings.table.guest')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.bookings.table.room')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.bookings.table.checkIn')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.bookings.table.checkOut')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.bookings.table.amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.bookings.table.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.bookings.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.guest?.first_name} {booking.guest?.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.room?.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDateDisplay(booking.check_in_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDateDisplay(booking.check_out_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatUsd(booking.total_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
                        >
                          ✓ {t('admin.pages.bookings.actions.confirm')}
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mr-2"
                        >
                          ✗ {t('admin.pages.bookings.actions.cancel')}
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleCheckIn(booking.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
                        >
                          {t('admin.pages.bookings.actions.checkIn')}
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mr-2"
                        >
                          {t('admin.pages.bookings.actions.cancel')}
                        </button>
                      </>
                    )}
                    {booking.status === 'checked_in' && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                      >
                        {t('admin.pages.bookings.actions.checkOut')}
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(booking)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingBooking ? t('admin.pages.bookings.editTitle') : t('admin.pages.bookings.createTitle')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.bookings.form.guest')}</label>
                <select
                  value={formData.guest_id}
                  onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {guests.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.first_name} {guest.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.bookings.form.room')}</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} - {formatUsd(room.price_per_night)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.bookings.form.checkInDate')}</label>
                <input
                  type="date"
                  value={formData.check_in_date}
                  onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.bookings.form.checkOutDate')}</label>
                <input
                  type="date"
                  value={formData.check_out_date}
                  onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.bookings.form.totalAmount')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.bookings.form.status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="pending">{t('booking.status.pending')}</option>
                  <option value="confirmed">{t('booking.status.confirmed')}</option>
                  <option value="checked_in">{t('booking.status.checked_in')}</option>
                  <option value="checked_out">{t('booking.status.checked_out')}</option>
                  <option value="cancelled">{t('booking.status.cancelled')}</option>
                </select>
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
    </div>
  );
};

export default BookingsPage;
