// Real-time notification helper
import { useNotifications } from '../context/NotificationContext';
import { useEffect } from 'react';

export const useBookingNotifications = () => {
  const { addNotification } = useNotifications();

  // Simulate real-time booking events
  useEffect(() => {
    // Poll for new bookings every 30 seconds (demo)
    // In production, use WebSocket or Pusher
    const interval = setInterval(() => {
      // This would be replaced with actual WebSocket listener
      checkForNewEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkForNewEvents = async () => {
    // In production, this would listen to WebSocket events
    // For now, we'll check localStorage for simulated events
    const events = localStorage.getItem('pendingNotifications');
    if (events) {
      const parsed = JSON.parse(events);
      parsed.forEach(event => {
        addNotification(event);
      });
      localStorage.removeItem('pendingNotifications');
    }
  };

  // Trigger notification when booking is created
  const notifyNewBooking = (booking) => {
    addNotification({
      type: 'booking',
      message: `Yangi bron: ${booking.booking_number}`,
      description: `${booking.guest?.first_name} ${booking.guest?.last_name} - Xona ${booking.room?.room_number}`,
      sound: true
    });
  };

  // Trigger notification when payment is received
  const notifyPayment = (payment) => {
    addNotification({
      type: 'payment',
      message: `To'lov qabul qilindi: $${payment.amount}`,
      description: `To'lov usuli: ${payment.payment_method}`,
      sound: true
    });
  };

  // Trigger notification for check-in
  const notifyCheckIn = (booking) => {
    addNotification({
      type: 'checkin',
      message: `Check-in: ${booking.booking_number}`,
      description: `${booking.guest?.first_name} ${booking.guest?.last_name} xonaga kirdi`,
      sound: true
    });
  };

  // Trigger notification for check-out
  const notifyCheckOut = (booking) => {
    addNotification({
      type: 'checkout',
      message: `Check-out: ${booking.booking_number}`,
      description: `${booking.guest?.first_name} ${booking.guest?.last_name} xonadan chiqdi`,
      sound: true
    });
  };

  // Trigger notification for cancellation
  const notifyCancellation = (booking) => {
    addNotification({
      type: 'error',
      message: `Bron bekor qilindi: ${booking.booking_number}`,
      description: `${booking.guest?.first_name} ${booking.guest?.last_name}`,
      sound: true
    });
  };

  return {
    notifyNewBooking,
    notifyPayment,
    notifyCheckIn,
    notifyCheckOut,
    notifyCancellation
  };
};

// Export notification triggers for use in service files
export const triggerNotification = (type, data) => {
  const notifications = {
    'new_booking': {
      type: 'booking',
      message: `Yangi bron: #${data.booking_number || data.id}`,
      description: data.guest_name || 'Yangi mehmon',
      sound: true
    },
    'payment_received': {
      type: 'payment',
      message: `To'lov qabul qilindi: $${data.amount}`,
      description: `Bron: #${data.booking_number || data.booking_id}`,
      sound: true
    },
    'check_in': {
      type: 'checkin',
      message: 'Mehmon check-in qilindi',
      description: data.guest_name || 'Mehmon kirdi',
      sound: true
    },
    'check_out': {
      type: 'checkout',
      message: 'Mehmon check-out qilindi',
      description: data.guest_name || 'Mehmon chiqdi',
      sound: true
    },
    'booking_confirmed': {
      type: 'success',
      message: 'Bron tasdiqlandi',
      description: `Bron #${data.booking_number || data.id}`,
      sound: false
    },
    'booking_cancelled': {
      type: 'error',
      message: 'Bron bekor qilindi',
      description: `Bron #${data.booking_number || data.id}`,
      sound: false
    }
  };

  const notification = notifications[type];
  if (notification) {
    // Save to localStorage for simulation
    const pending = localStorage.getItem('pendingNotifications');
    const list = pending ? JSON.parse(pending) : [];
    list.push(notification);
    localStorage.setItem('pendingNotifications', JSON.stringify(list));
  }
};
