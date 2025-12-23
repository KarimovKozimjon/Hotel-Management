import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import AdvancedSearchFilters from '../../components/common/AdvancedSearchFilters';
import api from '../../services/api';
import toast from 'react-hot-toast';

function BookRoomPage() {
  const { guest } = useGuestAuth();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    check_in_date: '',
    check_out_date: '',
  });
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [bookingData, setBookingData] = useState({
    number_of_adults: 1,
    number_of_children: 0,
    special_requests: ''
  });
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await api.get('/public/room-types');
      setRoomTypes(response.data);
    } catch (error) {
      toast.error('Xona turlarini yuklashda xatolik');
    }
  };

  const handleSearch = async () => {
    if (!searchFilters.check_in_date || !searchFilters.check_out_date) {
      toast.error('Iltimos, kirish va chiqish sanalarini tanlang');
      return;
    }

    try {
      setLoading(true);
      const params = {
        ...searchFilters,
        ...advancedFilters,
      };
      
      const response = await api.get('/guest/rooms/available', { params });
      
      if (response.data.data) {
        setRooms(response.data.data);
        setSearchResults({
          total: response.data.total_results,
          filters: response.data.filters_applied
        });
        toast.success(`${response.data.total_results} ta xona topildi`);
      } else {
        setRooms([]);
        setSearchResults({ total: 0, filters: {} });
        toast.info('Xonalar topilmadi');
      }
    } catch (error) {
      toast.error('Xonalarni yuklashda xatolik');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setAdvancedFilters(filters);
    // Auto-search if dates are already selected
    if (searchFilters.check_in_date && searchFilters.check_out_date) {
      // Debounce the search
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleBookRoom = (room) => {
    if (!searchFilters.check_in_date || !searchFilters.check_out_date) {
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
      const totalGuests = bookingData.number_of_adults + bookingData.number_of_children;
      const response = await api.post('/guest/bookings', {
        guest_id: guest.id,
        room_id: selectedRoom.id,
        check_in_date: searchFilters.check_in_date,
        check_out_date: searchFilters.check_out_date,
        number_of_guests: totalGuests,
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
    if (!searchFilters.check_in_date || !searchFilters.check_out_date) return 0;
    const checkIn = new Date(searchFilters.check_in_date);
    const checkOut = new Date(searchFilters.check_out_date);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    if (!selectedRoom?.room_type) return 0;
    return selectedRoom.room_type.base_price * calculateDays();
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-blue-600 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">Xona bron qilish 🏨</h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-100">
            Mavjud xonalardan birini tanlang va bron qiling
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Date Search */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-blue-700">📅 Sana tanlang</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Kirish sanasi *
              </label>
              <input
                type="date"
                value={searchFilters.check_in_date}
                onChange={(e) => setSearchFilters({ ...searchFilters, check_in_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Chiqish sanasi *
              </label>
              <input
                type="date"
                value={searchFilters.check_out_date}
                onChange={(e) => setSearchFilters({ ...searchFilters, check_out_date: e.target.value })}
                min={searchFilters.check_in_date || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchFilters.check_in_date || !searchFilters.check_out_date}
                className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-sm sm:text-base transition-all"
              >
                🔍 Qidirish
              </button>
            </div>
          </div>
          
          {calculateDays() > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                📊 Qolish muddati: <span className="font-bold">{calculateDays()} kun</span>
              </p>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {searchFilters.check_in_date && searchFilters.check_out_date && (
          <AdvancedSearchFilters 
            onFilterChange={handleFilterChange} 
            roomTypes={roomTypes}
          />
        )}

        {/* Search Results Info */}
        {searchResults && (
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-100 p-4 rounded-lg">
            <div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {searchResults.total} ta xona topildi
              </p>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-700">Yuklanmoqda...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white/90 rounded-lg shadow p-8 sm:p-12 text-center backdrop-blur">
            <span className="text-5xl sm:text-6xl mb-4 block">🚫</span>
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">Xonalar topilmadi</h3>
            <p className="text-sm sm:text-base text-blue-500">
              {searchFilters.check_in_date && searchFilters.check_out_date 
                ? 'Boshqa filtrlar bilan qidiring' 
                : 'Qidiruv uchun sanalarni tanlang'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden">
                {/* Room Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-200">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images.find(img => img.is_primary)?.image_url || room.images[0]?.image_url}
                      alt={room.room_type?.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = room.room_type?.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800';
                      }}
                    />
                  ) : (
                    <img
                      src={room.room_type?.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                      alt={room.room_type?.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-lg">
                      Mavjud
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {room.room_type?.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">Xona #{room.room_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Sig'imi:</span>
                      <span className="font-semibold">{room.room_type?.capacity} kishi</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Qavat:</span>
                      <span className="font-semibold">{room.floor}-qavat</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Narx (kunlik):</span>
                      <span className="font-semibold text-green-600">
                        ${room.room_type?.base_price}
                      </span>
                    </div>
                  </div>

                  {room.room_type?.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                      {room.room_type.description}
                    </p>
                  )}

                  {room.room_type?.amenities && typeof room.room_type.amenities === 'string' && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Qulayliklar:</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {room.room_type.amenities.split(',').slice(0, 3).map((amenity, index) => (
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
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base transition-all"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700">Bronni tasdiqlang</h2>

              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                <h3 className="font-semibold mb-2 text-sm sm:text-base text-blue-700">{selectedRoom.room_type?.name}</h3>
                <p className="text-xs sm:text-sm text-blue-500">Xona #{selectedRoom.room_number}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-500">Kirish</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(searchFilters.check_in_date).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-500">Chiqish</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(searchFilters.check_out_date).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-500">Kunlar soni: <span className="font-semibold">{calculateDays()}</span></p>
                  <p className="text-base sm:text-lg font-bold text-blue-700 mt-2">
                    Jami: ${calculateTotal()}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Kattalar soni *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom.room_type?.capacity}
                    value={bookingData.number_of_adults}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_adults: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Bolalar soni
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingData.number_of_children}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_children: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Maxsus so'rovlar
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    rows="3"
                    placeholder="Masalan: Yuqori qavatdagi xona, oyna ko'rinishi, va h.k."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 text-sm sm:text-base transition-all"
                  disabled={loading}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm sm:text-base transition-all"
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
