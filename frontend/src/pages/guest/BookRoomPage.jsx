import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function BookRoomPage() {
  const { guest } = useGuestAuth();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    check_in_date: '',
    check_out_date: '',
    room_type_id: '',
    min_price: '',
    max_price: ''
  });
  const [bookingData, setBookingData] = useState({
    number_of_adults: 1,
    number_of_children: 0,
    special_requests: ''
  });

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await api.get('/room-types');
      setRoomTypes(response.data);
    } catch (error) {
      toast.error('Xona turlarini yuklashda xatolik');
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms', { params: filters });
      // Filter only available rooms
      const availableRooms = response.data.filter(room => room.status === 'available');
      setRooms(availableRooms);
    } catch (error) {
      toast.error('Xonalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRooms();
  };

  const handleBookRoom = (room) => {
    if (!filters.check_in_date || !filters.check_out_date) {
      toast.error('Iltimos, kirish va chiqish sanalarini tanlang');
      return;
    }
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom) return;

    try {
      setLoading(true);
      const response = await api.post('/bookings', {
        guest_id: guest.id,
        room_id: selectedRoom.id,
        check_in_date: filters.check_in_date,
        check_out_date: filters.check_out_date,
        number_of_adults: bookingData.number_of_adults,
        number_of_children: bookingData.number_of_children,
        special_requests: bookingData.special_requests,
      });

      toast.success('Xona muvaffaqiyatli bron qilindi!');
      setShowModal(false);
      setSelectedRoom(null);
      setBookingData({ number_of_adults: 1, number_of_children: 0, special_requests: '' });
      
      // Redirect to my bookings
      setTimeout(() => {
        window.location.href = '/guest/my-bookings';
      }, 1500);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error(error.response?.data?.error || 'Bronlashda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!filters.check_in_date || !filters.check_out_date) return 0;
    const checkIn = new Date(filters.check_in_date);
    const checkOut = new Date(filters.check_out_date);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.room_type.price_per_night * calculateDays();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Xona bron qilish 🏨</h1>
          <p className="mt-1 text-sm text-gray-500">
            Mavjud xonalardan birini tanlang va bron qiling
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Qidiruv filterlari</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kirish sanasi *
              </label>
              <input
                type="date"
                value={filters.check_in_date}
                onChange={(e) => setFilters({ ...filters, check_in_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chiqish sanasi *
              </label>
              <input
                type="date"
                value={filters.check_out_date}
                onChange={(e) => setFilters({ ...filters, check_out_date: e.target.value })}
                min={filters.check_in_date || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xona turi
              </label>
              <select
                value={filters.room_type_id}
                onChange={(e) => setFilters({ ...filters, room_type_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Barchasi</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min narx ($)
              </label>
              <input
                type="number"
                value={filters.min_price}
                onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max narx ($)
              </label>
              <input
                type="number"
                value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              🔍 Qidirish
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">🚫</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Xonalar topilmadi</h3>
            <p className="text-gray-600">Boshqa filtrlar bilan qidiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {room.room_type?.name}
                      </h3>
                      <p className="text-sm text-gray-500">Xona #{room.room_number}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Mavjud
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sig'imi:</span>
                      <span className="font-semibold">{room.room_type?.capacity} kishi</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Qavat:</span>
                      <span className="font-semibold">{room.floor}-qavat</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Narx (kunlik):</span>
                      <span className="font-semibold text-green-600">
                        ${room.room_type?.price_per_night}
                      </span>
                    </div>
                  </div>

                  {room.room_type?.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {room.room_type.description}
                    </p>
                  )}

                  {room.room_type?.amenities && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Qulayliklar:</p>
                      <div className="flex flex-wrap gap-2">
                        {room.room_type.amenities.split(',').map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {amenity.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleBookRoom(room)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Bron qilish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Bronni tasdiqlang</h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">{selectedRoom.room_type?.name}</h3>
                <p className="text-sm text-gray-600">Xona #{selectedRoom.room_number}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Kirish</p>
                    <p className="font-semibold">{new Date(filters.check_in_date).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chiqish</p>
                    <p className="font-semibold">{new Date(filters.check_out_date).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Kunlar soni: <span className="font-semibold">{calculateDays()}</span></p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    Jami: ${calculateTotal()}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kattalar soni *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom.room_type?.capacity}
                    value={bookingData.number_of_adults}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_adults: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bolalar soni
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingData.number_of_children}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_children: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maxsus so'rovlar
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Masalan: Yuqori qavatdagi xona, oyna ko'rinishi, va h.k."
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? 'Saqlanmoqda...' : 'Tasdiqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookRoomPage;
