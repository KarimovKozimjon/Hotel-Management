import { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { guestService } from '../services/guestService';
import { roomService } from '../services/roomService';
import Loader from '../components/common/Loader';
import SearchBar from '../components/common/SearchBar';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiCheck,
  FiClock,
  FiEdit2,
  FiLogIn,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

const BookingsPage = () => {
  const { t } = useTranslation();
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

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      setBookings(data);
      setFilteredBookings(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('staff.bookings.toasts.fetchError'));
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = bookings.filter(booking =>
      booking.guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
  };

  const fetchGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data);
    } catch (error) {
      toast.error(t('staff.bookings.toasts.guestsFetchError'));
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.getAll();
      setRooms(data.filter(room => room.status === 'available'));
    } catch (error) {
      toast.error(t('staff.bookings.toasts.roomsFetchError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        await bookingService.update(editingBooking.id, formData);
        toast.success(t('staff.bookings.toasts.updated'));
      } else {
        await bookingService.create(formData);
        toast.success(t('staff.bookings.toasts.created'));
      }
      setShowModal(false);
      resetForm();
      fetchBookings();
    } catch (error) {
      toast.error(t('staff.bookings.toasts.genericError'));
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
    if (window.confirm(t('staff.bookings.confirmations.delete'))) {
      try {
        await bookingService.delete(id);
        toast.success(t('staff.bookings.toasts.deleted'));
        fetchBookings();
      } catch (error) {
        toast.error(t('staff.bookings.toasts.deleteError'));
      }
    }
  };
  const handleCheckIn = async (id) => {
    if (window.confirm(t('staff.bookings.confirmations.checkIn'))) {
      try {
        const result = await bookingService.checkIn(id);
        toast.success(t('staff.bookings.toasts.checkInSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'checkin',
          message: t('staff.bookings.notifications.checkIn'),
          description: t('staff.bookings.notifications.bookingRef', { ref: result.booking_number || id }),
          sound: true
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('staff.bookings.toasts.checkInError'));
      }
    }
  };

  const handleCheckOut = async (id) => {
    if (window.confirm(t('staff.bookings.confirmations.checkOut'))) {
      try {
        const result = await bookingService.checkOut(id);
        toast.success(t('staff.bookings.toasts.checkOutSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'checkout',
          message: t('staff.bookings.notifications.checkOut'),
          description: t('staff.bookings.notifications.bookingRef', { ref: result.booking_number || id }),
          sound: true
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('staff.bookings.toasts.checkOutError'));
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm(t('staff.bookings.confirmations.cancel'))) {
      try {
        const result = await bookingService.cancel(id);
        toast.success(t('staff.bookings.toasts.cancelSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'error',
          message: t('staff.bookings.notifications.cancelled'),
          description: t('staff.bookings.notifications.bookingRef', { ref: result.booking_number || id }),
          sound: false
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('staff.bookings.toasts.cancelError'));
      }
    }
  };

  const handleConfirm = async (id) => {
    if (window.confirm(t('staff.bookings.confirmations.confirm'))) {
      try {
        const result = await bookingService.update(id, { status: 'confirmed' });
        toast.success(t('staff.bookings.toasts.confirmSuccess'));
        
        // Real-time notification
        addNotification({
          type: 'success',
          message: t('staff.bookings.notifications.confirmed'),
          description: t('staff.bookings.notifications.bookingRef', { ref: result.booking_number || id }),
          sound: false
        });
        
        fetchBookings();
      } catch (error) {
        toast.error(t('staff.bookings.toasts.confirmError'));
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
    const labels = {
      pending: t('staff.status.pending'),
      confirmed: t('staff.status.confirmed'),
      checked_in: t('staff.status.checked_in'),
      checked_out: t('staff.status.checked_out'),
      cancelled: t('staff.status.cancelled')
    };

    const icons = {
      pending: FiClock,
      confirmed: FiCheck,
      checked_in: FiLogIn,
      checked_out: FiLogOut,
      cancelled: FiX,
    };

    const Icon = icons[status];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
        {labels[status] || status}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <>
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
              <FiClock className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent truncate">
                {t('staff.bookings.title')}
              </h1>
              <p className="text-sm text-blue-600">{t('staff.bookings.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 hover:shadow-2xl transition-all"
          >
            <FiPlus className="w-5 h-5" />
            {t('staff.bookings.new')}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white/90 border border-indigo-100 rounded-2xl shadow-xl backdrop-blur p-4 sm:p-6 mb-6"
        >
          <SearchBar onSearch={handleSearch} placeholder={t('staff.bookings.searchPlaceholder')} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="bg-white/90 border border-indigo-100 rounded-2xl shadow-xl backdrop-blur overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.bookings.headers.guest')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.bookings.headers.room')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.bookings.headers.checkIn')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.bookings.headers.checkOut')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.bookings.headers.amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.bookings.headers.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.bookings.headers.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-indigo-50/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.guest?.first_name} {booking.guest?.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.room?.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.check_in_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.check_out_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${booking.total_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-lg transition-all mr-2"
                        >
                          <FiCheck className="w-4 h-4" /> {t('staff.bookings.actions.confirm')}
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-lg transition-all mr-2"
                        >
                          <FiX className="w-4 h-4" /> {t('staff.bookings.actions.cancel')}
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleCheckIn(booking.id)}
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-lg transition-all mr-2"
                        >
                          <FiLogIn className="w-4 h-4" /> {t('staff.bookings.actions.checkIn')}
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-lg transition-all mr-2"
                        >
                          <FiX className="w-4 h-4" /> {t('staff.bookings.actions.cancel')}
                        </button>
                      </>
                    )}
                    {booking.status === 'checked_in' && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-lg transition-all mr-2"
                      >
                        <FiLogOut className="w-4 h-4" /> {t('staff.bookings.actions.checkOut')}
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(booking)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <FiEdit2 className="w-4 h-4" /> {t('staff.bookings.actions.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-900"
                    >
                      <FiTrash2 className="w-4 h-4" /> {t('staff.bookings.actions.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </motion.div>


      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {editingBooking ? t('staff.bookings.modal.editTitle') : t('staff.bookings.modal.newTitle')}
              </h2>
              <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.bookings.modal.guest')}</label>
                <select
                  value={formData.guest_id}
                  onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300"
                  required
                >
                  <option value="">{t('staff.bookings.modal.select')}</option>
                  {guests.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.first_name} {guest.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.bookings.modal.room')}</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300"
                  required
                >
                  <option value="">{t('staff.bookings.modal.select')}</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} - ${room.price_per_night}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.bookings.modal.checkInDate')}</label>
                <input
                  type="date"
                  value={formData.check_in_date}
                  onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.bookings.modal.checkOutDate')}</label>
                <input
                  type="date"
                  value={formData.check_out_date}
                  onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.bookings.modal.totalAmount')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('staff.bookings.modal.status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="confirmed">{t('staff.status.confirmed')}</option>
                  <option value="checked_in">{t('staff.status.checked_in')}</option>
                  <option value="checked_out">{t('staff.status.checked_out')}</option>
                  <option value="cancelled">{t('staff.status.cancelled')}</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 transition-all"
                >
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl hover:bg-gray-300 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingsPage;
