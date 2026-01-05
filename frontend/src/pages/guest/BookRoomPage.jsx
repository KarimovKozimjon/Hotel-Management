import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import AdvancedSearchFilters from '../../components/common/AdvancedSearchFilters';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getRoomTypeAmenities, getRoomTypeDescription, getRoomTypeLabel } from '../../utils/roomTypeLabel';

function BookRoomPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { guest } = useGuestAuth();

  const locale = i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    check_in_date: '',
    check_out_date: '',
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    room_type_id: '',
    min_price: '',
    max_price: '',
    min_capacity: '',
    floor: '',
    sort_by: '',
  });
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
      toast.error(t('guest.bookRoomPage.toast.loadRoomTypesError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchFilters.check_in_date || !searchFilters.check_out_date) {
      toast.error(t('guest.bookRoomPage.toast.selectDates'));
      return;
    }

    try {
      setLoading(true);
      // Bo'sh stringlarni null qilib yuborish
      const cleanFilters = Object.fromEntries(
        Object.entries({ ...searchFilters, ...advancedFilters }).map(([k, v]) => [k, v === '' ? null : v])
      );
      const response = await api.get('/guest/rooms/available', { params: cleanFilters });
      console.log('API javobi:', response.data);
      // Flexible data extraction for different API response shapes
      let roomsArr = response.data.data || response.data.rooms || response.data;
      if (Array.isArray(roomsArr) && roomsArr.length > 0) {
        setRooms(roomsArr);
        setSearchResults({
          total: roomsArr.length,
          filters: response.data.filters_applied || {}
        });
        toast.success(t('guest.bookRoomPage.toast.roomsFound', { count: roomsArr.length }));
      } else {
        setRooms([]);
        setSearchResults({ total: 0, filters: {} });
        toast.info(t('guest.bookRoomPage.toast.roomsNotFound'));
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((err) => toast.error(err[0]));
      } else {
        toast.error(error.response?.data?.message || t('guest.bookRoomPage.toast.loadRoomsError'));
      }
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setAdvancedFilters(filters);
    // Qidirish faqat button bosilganda ishlaydi
  };

  const handleBookRoom = (room) => {
    if (!searchFilters.check_in_date || !searchFilters.check_out_date) {
      toast.error(t('guest.bookRoomPage.toast.selectDates'));
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

      toast.success(t('guest.bookRoomPage.toast.bookedSuccess'));
      setShowModal(false);
      setSelectedRoom(null);
      setBookingData({ number_of_adults: 1, number_of_children: 0, special_requests: '' });
      
      // Redirect to my bookings
      setTimeout(() => {
        navigate('/guest/my-bookings');
      }, 1500);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error(error.response?.data?.message || error.response?.data?.error || t('guest.bookRoomPage.toast.bookingError'));
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-purple-50 font-sans">
      <div className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white drop-shadow mb-2 flex items-center gap-2">
            <span className="inline-block bg-white/20 rounded-full p-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-yellow-300"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5M3 7.5h18M3 7.5v9A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5v-9M7.5 12h.008v.008H7.5V12zm4.5 0h.008v.008H12V12zm4.5 0h.008v.008H16.5V12z" /></svg></span>
            {t('guest.bookRoom')}
          </h1>
          <p className="text-sm text-blue-100">
            {t('guest.bookRoomPage.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Date Search */}
        <div className="bg-white border-2 border-purple-300 rounded-xl p-4 sm:p-8 mb-10 shadow-lg animate-fade-in">
          <div className="flex items-center mb-4 gap-2">
            <span className="inline-block bg-purple-100 rounded-full p-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 7.5h18M4.5 7.5v9A2.25 2.25 0 006.75 18.75h10.5A2.25 2.25 0 0019.5 16.5v-9" /></svg></span>
            <h2 className="text-2xl font-bold text-purple-700">{t('guest.bookRoomPage.selectDatesTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-700"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg></span>
                {t('booking.checkIn')} *
              </label>
              <input
                type="date"
                value={searchFilters.check_in_date}
                onChange={(e) => setSearchFilters({ ...searchFilters, check_in_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-1.5 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 text-base bg-white transition-all focus:border-blue-400 focus:shadow-lg h-9"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-700"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-6l-4-2" /></svg></span>
                {t('booking.checkOut')} *
              </label>
              <input
                type="date"
                value={searchFilters.check_out_date}
                onChange={(e) => setSearchFilters({ ...searchFilters, check_out_date: e.target.value })}
                min={
                  searchFilters.check_in_date
                    ? new Date(new Date(searchFilters.check_in_date).getTime() + 86400000).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                className="w-full px-3 py-1.5 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 text-base bg-white transition-all focus:border-blue-400 focus:shadow-lg h-9"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchFilters.check_in_date || !searchFilters.check_out_date}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-xl shadow-lg font-semibold text-base hover:scale-105 hover:shadow-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg></span>
                {t('common.search')}
              </button>
            </div>
          </div>
          
          {calculateDays() > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                {t('guest.bookRoomPage.stayDuration')}: <span className="font-bold">{t('guest.bookRoomPage.days', { count: calculateDays() })}</span>
              </p>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {searchFilters.check_in_date && searchFilters.check_out_date && (
          <div className="mb-10">
            <AdvancedSearchFilters
              filters={advancedFilters}
              onFilterChange={handleFilterChange}
              roomTypes={roomTypes}
              setFilters={setAdvancedFilters}
              handleSearch={handleSearch}
            />
          </div>
        )}

        {/* Search Results Info */}
        {searchResults && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-base font-semibold text-gray-900">
                {t('guest.bookRoomPage.roomsFoundText', { count: searchResults.total })}
              </p>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-700">{t('common.loading')}</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block" aria-hidden="true">—</span>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{t('room.noRooms')}</h3>
            <p className="text-base text-blue-500">
              {searchFilters.check_in_date && searchFilters.check_out_date 
                ? t('guest.bookRoomPage.tryDifferentFilters')
                : t('guest.bookRoomPage.selectDatesForSearch')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden">
                {/* Room Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-200">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images.find(img => img.is_primary)?.image_url || room.images[0]?.image_url}
                      alt={getRoomTypeLabel(room.room_type, t)}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = room.room_type?.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800';
                      }}
                    />
                  ) : (
                    <img
                      src={room.room_type?.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                      alt={getRoomTypeLabel(room.room_type, t)}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-lg">
                      {t('room.available')}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {getRoomTypeLabel(room.room_type, t)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">{t('guest.bookRoomPage.roomNumberShort', { number: room.room_number })}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">{t('room.capacity')}:</span>
                      <span className="font-semibold">{room.room_type?.capacity} {t('guest.bookRoomPage.people')}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">{t('room.floor')}:</span>
                      <span className="font-semibold">{room.floor}-{t('guest.bookRoomPage.floorSuffix')}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">{t('room.price')}:</span>
                      <span className="font-semibold text-green-600">
                        ${room.room_type?.base_price}
                      </span>
                    </div>
                  </div>

                  {getRoomTypeDescription(room.room_type, t) && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                      {getRoomTypeDescription(room.room_type, t)}
                    </p>
                  )}

                  {getRoomTypeAmenities(room.room_type, t).length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">{t('room.amenities')}:</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                            {(() => {
                              const amenities = getRoomTypeAmenities(room.room_type, t);
                              const maxAmenities = 3;
                              const visible = amenities.slice(0, maxAmenities);
                              const remaining = amenities.length - visible.length;

                              return (
                                <>
                                  {visible.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {amenity}
                          </span>
                                  ))}
                                  {remaining > 0 && (
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                      +{remaining}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleBookRoom(room)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base transition-all"
                  >
                    {t('guest.bookRoomPage.bookAction')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                <span className="inline-block bg-blue-100 rounded-full p-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg></span>
                {t('booking.confirmBooking')}
              </h2>

              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 shadow">
                <h3 className="font-semibold mb-2 text-sm sm:text-base text-blue-700 flex items-center gap-1">
                  <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-700"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h.008v.008H16.5V12z" /></svg></span>
                  {getRoomTypeLabel(selectedRoom.room_type, t)}
                </h3>
                <p className="text-xs sm:text-sm text-blue-500">{t('guest.bookRoomPage.roomNumberShort', { number: selectedRoom.room_number })}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-500">{t('guest.bookRoomPage.checkInShort')}</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(searchFilters.check_in_date).toLocaleDateString(locale)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-500">{t('guest.bookRoomPage.checkOutShort')}</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(searchFilters.check_out_date).toLocaleDateString(locale)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-500">{t('guest.bookRoomPage.daysCount')}: <span className="font-semibold">{calculateDays()}</span></p>
                  <p className="text-base sm:text-lg font-bold text-blue-700 mt-2">
                    {t('booking.totalPrice')}: ${calculateTotal()}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg></span>
                    {t('booking.adults')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom.room_type?.capacity}
                    value={bookingData.number_of_adults}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_adults: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base focus:border-blue-400 focus:shadow-lg transition-all h-8"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-6l-4-2" /></svg></span>
                    {t('booking.children')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingData.number_of_children}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_children: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base focus:border-blue-400 focus:shadow-lg transition-all h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg></span>
                    {t('booking.specialRequests')}
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base focus:border-blue-400 focus:shadow-lg transition-all min-h-[32px]"
                    rows="3"
                    placeholder={t('guest.bookRoomPage.specialRequestsPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-xl hover:bg-blue-50 text-sm sm:text-base transition-all shadow"
                  disabled={loading}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-500 text-white px-4 py-2 rounded-xl hover:scale-105 hover:shadow-xl disabled:bg-gray-400 text-sm sm:text-base transition-all shadow-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('common.confirm')}
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
