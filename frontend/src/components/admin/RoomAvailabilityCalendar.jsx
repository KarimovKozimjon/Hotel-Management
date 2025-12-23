import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../services/api';
import toast from 'react-hot-toast';

const localizer = momentLocalizer(moment);

function RoomAvailabilityCalendar() {
  const [events, setEvents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      const bookings = response.data.data || response.data;
      
      const calendarEvents = bookings.map(booking => ({
        id: booking.id,
        title: `${booking.room?.room_type?.name || 'Room'} #${booking.room?.room_number || booking.room_id} - ${booking.guest?.first_name || 'Guest'}`,
        start: new Date(booking.check_in_date),
        end: new Date(booking.check_out_date),
        resource: {
          booking,
          status: booking.status,
          roomNumber: booking.room?.room_number,
          roomType: booking.room?.room_type?.name,
          guestName: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        }
      }));
      
      setEvents(calendarEvents);
    } catch (error) {
      toast.error('Bronlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Xonalarni yuklashda xatolik');
    }
  };

  const eventStyleGetter = (event) => {
    const statusColors = {
      pending: { backgroundColor: '#fbbf24', color: '#78350f' }, // yellow
      confirmed: { backgroundColor: '#60a5fa', color: '#1e3a8a' }, // blue
      checked_in: { backgroundColor: '#34d399', color: '#064e3b' }, // green
      checked_out: { backgroundColor: '#9ca3af', color: '#1f2937' }, // gray
      cancelled: { backgroundColor: '#f87171', color: '#7f1d1d' }, // red
    };

    const style = statusColors[event.resource?.status] || statusColors.pending;

    return {
      style: {
        ...style,
        borderRadius: '5px',
        opacity: 0.8,
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 5px',
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    // Could open a modal to create a new booking
    console.log('Selected slot:', start, end);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Kutilmoqda' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tasdiqlangan' },
      checked_in: { bg: 'bg-green-100', text: 'text-green-800', label: 'Kirish' },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Chiqish' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bekor' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Status Legend:</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-700">Kutilmoqda</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-700">Tasdiqlangan</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-700">Kirish</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-700">Chiqish</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-700">Bekor</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white p-4 rounded-lg shadow-md" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          messages={{
            next: "Keyingi",
            previous: "Oldingi",
            today: "Bugun",
            month: "Oy",
            week: "Hafta",
            day: "Kun",
            agenda: "Jadval",
            date: "Sana",
            time: "Vaqt",
            event: "Bron",
            noEventsInRange: "Bu oraliqda bronlar yo'q"
          }}
        />
      </div>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Bron tafsilotlari</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Bron raqami:</p>
                    <p className="font-semibold">#{selectedEvent.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Status:</p>
                    {getStatusBadge(selectedEvent.resource.status)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Xona:</p>
                <p className="font-semibold text-sm sm:text-base">
                  {selectedEvent.resource.roomType} - Xona #{selectedEvent.resource.roomNumber}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Mehmon:</p>
                <p className="font-semibold text-sm sm:text-base">{selectedEvent.resource.guestName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Kirish:</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {moment(selectedEvent.start).format('DD MMM YYYY')}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Chiqish:</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {moment(selectedEvent.end).format('DD MMM YYYY')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs sm:text-sm text-gray-600">
                  Kunlar soni: <span className="font-semibold">
                    {moment(selectedEvent.end).diff(moment(selectedEvent.start), 'days')} kun
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomAvailabilityCalendar;
