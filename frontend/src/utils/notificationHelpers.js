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
      messageKey: 'staff.notifications.messages.newBooking',
      messageVars: { ref: booking.booking_number },
      descriptionKey: 'staff.notifications.descriptions.guestRoomNumber',
      descriptionVars: {
        guest: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        roomNumber: booking.room?.room_number
      },
      sound: true
    });
  };

  // Trigger notification when payment is received
  const notifyPayment = (payment) => {
    addNotification({
      type: 'payment',
      messageKey: 'staff.notifications.messages.paymentReceived',
      messageVars: { amount: payment.amount },
      descriptionKey: 'staff.notifications.descriptions.paymentMethod',
      descriptionVars: { method: payment.payment_method },
      sound: true
    });
  };

  // Trigger notification for check-in
  const notifyCheckIn = (booking) => {
    addNotification({
      type: 'checkin',
      messageKey: 'staff.notifications.messages.checkInRef',
      messageVars: { ref: booking.booking_number },
      descriptionKey: 'staff.notifications.descriptions.guestCheckedIn',
      descriptionVars: {
        guest: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
      },
      sound: true
    });
  };

  // Trigger notification for check-out
  const notifyCheckOut = (booking) => {
    addNotification({
      type: 'checkout',
      messageKey: 'staff.notifications.messages.checkOutRef',
      messageVars: { ref: booking.booking_number },
      descriptionKey: 'staff.notifications.descriptions.guestCheckedOut',
      descriptionVars: {
        guest: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
      },
      sound: true
    });
  };

  // Trigger notification for cancellation
  const notifyCancellation = (booking) => {
    addNotification({
      type: 'error',
      messageKey: 'staff.notifications.messages.bookingCancelledRef',
      messageVars: { ref: booking.booking_number },
      descriptionKey: 'staff.notifications.descriptions.guestName',
      descriptionVars: {
        guest: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
      },
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
      messageKey: 'staff.notifications.messages.newBooking',
      messageVars: { ref: `#${data.booking_number || data.id}` },
      descriptionKey: data.guest_name ? 'staff.notifications.descriptions.guestName' : 'staff.notifications.fallbacks.newGuest',
      descriptionVars: data.guest_name ? { guest: data.guest_name } : undefined,
      sound: true
    },
    'payment_received': {
      type: 'payment',
      messageKey: 'staff.notifications.messages.paymentReceived',
      messageVars: { amount: data.amount },
      descriptionKey: 'staff.notifications.descriptions.bookingRef',
      descriptionVars: { ref: `#${data.booking_number || data.booking_id}` },
      sound: true
    },
    'check_in': {
      type: 'checkin',
      messageKey: 'staff.notifications.messages.checkIn',
      descriptionKey: data.guest_name ? 'staff.notifications.descriptions.guestName' : 'staff.notifications.fallbacks.guestCheckedIn',
      descriptionVars: data.guest_name ? { guest: data.guest_name } : undefined,
      sound: true
    },
    'check_out': {
      type: 'checkout',
      messageKey: 'staff.notifications.messages.checkOut',
      descriptionKey: data.guest_name ? 'staff.notifications.descriptions.guestName' : 'staff.notifications.fallbacks.guestCheckedOut',
      descriptionVars: data.guest_name ? { guest: data.guest_name } : undefined,
      sound: true
    },
    'booking_confirmed': {
      type: 'success',
      messageKey: 'staff.notifications.messages.bookingConfirmed',
      descriptionKey: 'staff.notifications.descriptions.bookingRef',
      descriptionVars: { ref: `#${data.booking_number || data.id}` },
      sound: false
    },
    'booking_cancelled': {
      type: 'error',
      messageKey: 'staff.notifications.messages.bookingCancelled',
      descriptionKey: 'staff.notifications.descriptions.bookingRef',
      descriptionVars: { ref: `#${data.booking_number || data.id}` },
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
