import { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { guestService } from '../services/guestService';
import { roomService } from '../services/roomService';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
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
      setLoading(false);
    } catch (error) {
      toast.error('Bronlarni yuklashda xatolik');
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data);
    } catch (error) {
      toast.error('Mehmonlarni yuklashda xatolik');
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.getAll();
      setRooms(data.filter(room => room.status === 'available'));
    } catch (error) {
      toast.error('Xonalarni yuklashda xatolik');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        await bookingService.update(editingBooking.id, formData);
        toast.success('Bron yangilandi');
      } else {
        await bookingService.create(formData);
        toast.success('Bron yaratildi');
      }
      setShowModal(false);
      resetForm();
      fetchBookings();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
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
    if (window.confirm('Bronni o\'chirmoqchimisiz?')) {
      try {
        await bookingService.delete(id);
        toast.success('Bron o\'chirildi');
        fetchBookings();
      } catch (error) {
        toast.error('Bronni o\'chirishda xatolik');
      }
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await bookingService.checkIn(id);
      toast.success('Check-in amalga oshirildi');
      fetchBookings();
    } catch (error) {
      toast.error('Check-in xatolik');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await bookingService.checkOut(id);
      toast.success('Check-out amalga oshirildi');
      fetchBookings();
    } catch (error) {
      toast.error('Check-out xatolik');
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
      confirmed: 'bg-blue-100 text-blue-800',
      checked_in: 'bg-green-100 text-green-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      confirmed: 'Tasdiqlangan',
      checked_in: 'Keldi',
      checked_out: 'Ketdi',
      cancelled: 'Bekor qilindi'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bronlar</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Yangi bron
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mehmon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xona</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kirish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chiqish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holati</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.guest?.first_name} {booking.guest?.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.room?.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.check_in_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.check_out_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${booking.total_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Check-in
                      </button>
                    )}
                    {booking.status === 'checked_in' && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Check-out
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(booking)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
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
              {editingBooking ? 'Bronni tahrirlash' : 'Yangi bron'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Mehmon</label>
                <select
                  value={formData.guest_id}
                  onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Tanlang</option>
                  {guests.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.first_name} {guest.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Xona</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Tanlang</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} - ${room.price_per_night}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Kirish sanasi</label>
                <input
                  type="date"
                  value={formData.check_in_date}
                  onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Chiqish sanasi</label>
                <input
                  type="date"
                  value={formData.check_out_date}
                  onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Umumiy summa ($)</label>
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
                <label className="block text-gray-700 mb-2">Holati</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="confirmed">Tasdiqlangan</option>
                  <option value="checked_in">Keldi</option>
                  <option value="checked_out">Ketdi</option>
                  <option value="cancelled">Bekor qilindi</option>
                </select>
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

export default BookingsPage;
