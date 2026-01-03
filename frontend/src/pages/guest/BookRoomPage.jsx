import { useState, useEffect } from 'react';
import { useGuestAuth } from '../../context/GuestAuthContext';
import AdvancedSearchFilters from '../../components/common/AdvancedSearchFilters';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiHome,
  FiLayers,
  FiSearch,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';

function BookRoomPage() {
  const { guest } = useGuestAuth();
  const { t, i18n } = useTranslation();
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

  const getLocale = () => {
    const lang = (i18n.language || 'en').toLowerCase();
    if (lang.startsWith('uz')) return 'uz-UZ';
    if (lang.startsWith('ru')) return 'ru-RU';
    return 'en-US';
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await api.get('/public/room-types');
      setRoomTypes(response.data);
    } catch (error) {
      toast.error(t('guest.bookRoomPage.roomTypesLoadError') || 'Xona turlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchFilters.check_in_date || !searchFilters.check_out_date) {
      toast.error(t('guest.bookRoomPage.selectDatesError') || 'Iltimos, kirish va chiqish sanalarini tanlang');
      return;
    }

    try {
      setLoading(true);
      const params = {
        ...searchFilters,
        ...advancedFilters,
      };
      const response = await api.get('/guest/rooms/available', { params });
      console.log('API javobi:', response.data);
      // Flexible data extraction for different API response shapes
      let roomsArr = response.data.data || response.data.rooms || response.data;
      if (Array.isArray(roomsArr) && roomsArr.length > 0) {
        setRooms(roomsArr);
        setSearchResults({
          total: roomsArr.length,
          filters: response.data.filters_applied || {}
        });
        toast.success(t('guest.bookRoomPage.roomsFound', { count: roomsArr.length }) || `${roomsArr.length} ta xona topildi`);
      } else {
        setRooms([]);
        setSearchResults({ total: 0, filters: {} });
        toast.info(t('guest.bookRoomPage.noRoomsToast') || 'Xonalar topilmadi');
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((err) => toast.error(err[0]));
      } else {
        toast.error(error.response?.data?.message || (t('guest.bookRoomPage.roomsLoadError') || 'Xonalarni yuklashda xatolik'));
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
      toast.error(t('guest.bookRoomPage.selectDatesError') || 'Iltimos, kirish va chiqish sanalarini tanlang');
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

      toast.success(t('booking.bookingSuccess') || 'Xona muvaffaqiyatli bron qilindi!');
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
        toast.error(error.response?.data?.message || error.response?.data?.error || (t('booking.bookingError') || 'Bronlashda xatolik'));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-purple-100 font-sans">
      {/* Hero Header */}
      <div className="bg-white/80 border-b border-blue-100 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
              <FiHome className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent flex flex-wrap items-center gap-3 mb-1 drop-shadow-lg min-w-0 break-words">
              {t('booking.title') || 'Xona bron qilish'}
            </h1>
            <p className="text-base text-blue-500 font-medium break-words">
              {t('guest.bookRoomPage.subtitle') || 'Mavjud xonalardan birini tanlang va bron qiling'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Search */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 border-2 rounded-2xl p-8 mb-10 shadow-xl relative overflow-hidden"
          style={{
            borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderImageSlice: 1,
          }}
        >
          <div className="flex items-center mb-4 gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-purple-700">{t('guest.bookRoomPage.selectDatesTitle') || 'Sana tanlang'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                {(t('booking.checkIn') || 'Kirish sanasi')} *
              </label>
              <input
                type="date"
                value={searchFilters.check_in_date}
                onChange={(e) => setSearchFilters({ ...searchFilters, check_in_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-base bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                {(t('booking.checkOut') || 'Chiqish sanasi')} *
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
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-base bg-white transition-all"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchFilters.check_in_date || !searchFilters.check_out_date}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl shadow font-semibold text-base hover:from-purple-600 hover:to-indigo-500 hover:scale-105 hover:shadow-2xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <FiSearch className="w-5 h-5" />
                {t('guest.bookRoomPage.search') || 'Qidirish'}
              </button>
            </div>
          </div>
          
          {calculateDays() > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="inline-flex items-center gap-2">
                  <FiBarChart2 className="w-4 h-4 text-indigo-600" />
                  {t('guest.bookRoomPage.stayDuration') || 'Qolish muddati'}:
                </span>
                <span className="font-bold"> {calculateDays()} {t('guest.bookRoomPage.days') || 'kun'}</span>
              </p>
            </div>
          )}
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-70 pointer-events-none" />
        </motion.div>

        {/* Advanced Filters */}
        {searchFilters.check_in_date && searchFilters.check_out_date && (
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/90 border-2 rounded-2xl p-6 shadow-xl relative overflow-hidden"
              style={{
                borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderImageSlice: 1,
              }}
            >
              <div className="flex items-center mb-4 gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
                  <FiSearch className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-700">{t('filter.title') || 'Qidiruv filterlari'}</h3>
              </div>
              <AdvancedSearchFilters
                filters={advancedFilters}
                onFilterChange={handleFilterChange}
                roomTypes={roomTypes}
                setFilters={setAdvancedFilters}
                handleSearch={handleSearch}
              />
              <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-70 pointer-events-none" />
            </motion.div>
          </div>
        )}

        {/* Search Results Info */}
        {searchResults && (
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-blue-100"
            >
              <p className="text-base font-semibold text-gray-900">
                {t('guest.bookRoomPage.roomsFoundInline', { count: searchResults.total }) || `${searchResults.total} ta xona topildi`}
              </p>
            </motion.div>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-700">{t('common.loading') || 'Yuklanmoqda...'}</p>
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 border-2 rounded-2xl shadow-xl p-12 text-center relative overflow-hidden"
            style={{
              borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderImageSlice: 1,
            }}
          >
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
              <FiXCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{t('guest.bookRoomPage.noRoomsTitle') || 'Xonalar topilmadi'}</h3>
            <p className="text-base text-blue-500">
              {searchFilters.check_in_date && searchFilters.check_out_date 
                ? (t('guest.bookRoomPage.tryOtherFilters') || 'Boshqa filtrlar bilan qidiring') 
                : (t('guest.bookRoomPage.selectDatesHint') || 'Qidiruv uchun sanalarni tanlang')}
            </p>
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-70 pointer-events-none" />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.25) }}
                className="bg-white/90 border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
                style={{
                  borderImage: 'linear-gradient(135deg, #6366f1, #8b5cf6) 1',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderImageSlice: 1,
                }}
              >
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
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg inline-flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      {t('room.available') || 'Mavjud'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {room.room_type?.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">{t('guest.bookRoomPage.roomNumber') || 'Xona'} #{room.room_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 inline-flex items-center gap-2"><FiUsers className="w-4 h-4 text-indigo-500" />{t('room.capacity') || "Sig'imi"}:</span>
                      <span className="font-semibold">{room.room_type?.capacity} {t('guest.bookRoomPage.people') || 'kishi'}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 inline-flex items-center gap-2"><FiLayers className="w-4 h-4 text-indigo-500" />{t('room.floor') || 'Qavat'}:</span>
                      <span className="font-semibold">{room.floor}-{t('guest.bookRoomPage.floorSuffix') || 'qavat'}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 inline-flex items-center gap-2"><FiDollarSign className="w-4 h-4 text-indigo-500" />{t('room.price') || 'Narx (kunlik)'}:</span>
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
                      <p className="text-xs text-gray-500 mb-2">{t('room.amenities') || 'Qulayliklar'}:</p>
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
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 hover:scale-[1.02] transition-all font-semibold text-sm sm:text-base"
                  >
                    {t('guest.bookRoomPage.bookAction') || 'Bron qilish'}
                  </button>
                </div>
                <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 rounded-bl-full blur-2xl opacity-60 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700 inline-flex items-center gap-2">
                <FiClock className="w-6 h-6 text-indigo-600" />
                {t('booking.confirmBooking') || 'Bronni tasdiqlang'}
              </h2>

              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                <h3 className="font-semibold mb-2 text-sm sm:text-base text-blue-700">{selectedRoom.room_type?.name}</h3>
                <p className="text-xs sm:text-sm text-blue-500">{t('guest.bookRoomPage.roomNumber') || 'Xona'} #{selectedRoom.room_number}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-500">{t('booking.checkIn') || 'Kirish'}</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(searchFilters.check_in_date).toLocaleDateString(getLocale())}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-500">{t('booking.checkOut') || 'Chiqish'}</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(searchFilters.check_out_date).toLocaleDateString(getLocale())}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-500">{t('guest.bookRoomPage.daysCount') || 'Kunlar soni'}: <span className="font-semibold">{calculateDays()}</span></p>
                  <p className="text-base sm:text-lg font-bold text-blue-700 mt-2">
                    {t('guest.bookRoomPage.total') || 'Jami'}: ${calculateTotal()}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {(t('booking.adults') || 'Kattalar soni')} *
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
                    {t('booking.children') || 'Bolalar soni'}
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
                    {t('booking.specialRequests') || "Maxsus so'rovlar"}
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    rows="3"
                    placeholder={t('guest.bookRoomPage.specialRequestsPlaceholder') || "Masalan: Yuqori qavatdagi xona, oyna ko'rinishi, va h.k."}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-4 py-2 border border-blue-200 rounded-xl hover:bg-blue-50 text-sm sm:text-base transition-all"
                  disabled={loading}
                >
                  {t('common.cancel') || 'Bekor qilish'}
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow hover:from-purple-600 hover:to-indigo-500 disabled:bg-gray-400 text-sm sm:text-base transition-all"
                  disabled={loading}
                >
                  {loading ? (t('common.loading') || 'Yuklanmoqda...') : (t('common.confirm') || 'Tasdiqlash')}
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookRoomPage;
