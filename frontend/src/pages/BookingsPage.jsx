import { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { guestService } from '../../services/guestService';
import { roomService } from '../../services/roomService';
import Navbar from '../common/Navbar';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    number_of_guests: 1,
    special_requests: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchGuests();
    fetchRooms();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      setBookings(data.data || data);
    } catch (error) {
      toast.error('Bronlarni yuklashda xatolik!');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data.data || data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.getAll();
      setRooms(data.data || data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookingService.create(formData);
      toast.success('Bron yaratildi!');
      setShowModal(false);
      resetForm();
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await bookingService.checkIn(id);
      toast.success('Check-in muvaffaqiyatli!');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik!');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await bookingService.checkOut(id);
      toast.success('Check-out muvaffaqiyatli!');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik!');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Bronni bekor qilmoqchimisiz?')) {
      try {
        await bookingService.cancel(id);
        toast.success('Bron bekor qilindi!');
        fetchBookings();
      } catch (error) {
        toast.error('Xatolik yuz berdi!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      guest_id: '',
      room_id: '',
      check_in_date: '',
      check_out_date: '',
      number_of_guests: 1,
      special_requests: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      checked_in: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bronlar</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Yangi Bron
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bron #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mehmon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xona</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kirish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chiqish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.booking_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.guest?.first_name} {booking.guest?.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.room?.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.check_in_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.check_out_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Check-in
                      </button>
                    )}
                    {booking.status === 'checked_in' && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Check-out
                      </button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Bekor qilish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Yangi bron</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Mehmon</label>
                  <select
                    value={formData.guest_id}
                    onChange={(e) => setFormData({...formData, guest_id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Tanlang</option>
                    {rooms.filter(r => r.status === 'available').map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.room_number} - {room.room_type?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Kirish sanasi</label>
                  <input
                    type="date"
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Chiqish sanasi</label>
                  <input
                    type="date"
                    value={formData.check_out_date}
                    onChange={(e) => setFormData({...formData, check_out_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Mehmonlar soni</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.number_of_guests}
                    onChange={(e) => setFormData({...formData, number_of_guests: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Maxsus talablar</label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
