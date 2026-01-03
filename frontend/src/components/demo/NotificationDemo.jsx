import { useNotifications } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';

function NotificationDemo() {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();

  const demos = [
    {
      titleKey: 'staff.notifications.demo.buttons.newBooking',
      action: () => addNotification({
        type: 'booking',
        messageKey: 'staff.notifications.messages.newBooking',
        messageVars: { ref: '#BK12345' },
        descriptionKey: 'staff.notifications.descriptions.guestRoom',
        descriptionVars: { guest: 'John Doe', room: 'Deluxe Room #301' },
        sound: true
      })
    },
    {
      titleKey: 'staff.notifications.demo.buttons.paymentReceived',
      action: () => addNotification({
        type: 'payment',
        messageKey: 'staff.notifications.messages.paymentReceived',
        messageVars: { amount: 250 },
        descriptionKey: 'staff.notifications.descriptions.bookingMethod',
        descriptionVars: { ref: '#BK12345', method: 'Card' },
        sound: true
      })
    },
    {
      titleKey: 'staff.notifications.demo.buttons.checkIn',
      action: () => addNotification({
        type: 'checkin',
        messageKey: 'staff.notifications.messages.checkIn',
        descriptionKey: 'staff.notifications.descriptions.guestRoom',
        descriptionVars: { guest: 'Jane Smith', room: 'Suite #501' },
        sound: true
      })
    },
    {
      titleKey: 'staff.notifications.demo.buttons.checkOut',
      action: () => addNotification({
        type: 'checkout',
        messageKey: 'staff.notifications.messages.checkOut',
        descriptionKey: 'staff.notifications.descriptions.guestRoom',
        descriptionVars: { guest: 'Bob Johnson', room: 'Standard #102' },
        sound: true
      })
    },
    {
      titleKey: 'staff.notifications.demo.buttons.bookingConfirmed',
      action: () => addNotification({
        type: 'success',
        messageKey: 'staff.notifications.messages.bookingConfirmed',
        descriptionKey: 'staff.notifications.descriptions.bookingConfirmed',
        descriptionVars: { ref: '#BK12346' },
        sound: false
      })
    },
    {
      titleKey: 'staff.notifications.demo.buttons.bookingCancelled',
      action: () => addNotification({
        type: 'error',
        messageKey: 'staff.notifications.messages.bookingCancelled',
        descriptionKey: 'staff.notifications.descriptions.bookingCancelled',
        descriptionVars: { ref: '#BK12347' },
        sound: false
      })
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {t('staff.notifications.demo.title')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('staff.notifications.demo.subtitle')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demos.map((demo, index) => (
          <button
            key={index}
            onClick={demo.action}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg border border-blue-200 transition"
          >
            {t(demo.titleKey)}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">{t('staff.notifications.demo.howItWorksTitle')}</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• {t('staff.notifications.demo.steps.clickButton')}</li>
          <li>• {t('staff.notifications.demo.steps.bellShows')}</li>
          <li>• {t('staff.notifications.demo.steps.badgeCount')}</li>
          <li>• {t('staff.notifications.demo.steps.openBell')}</li>
          <li>• {t('staff.notifications.demo.steps.productionNote')}</li>
        </ul>
      </div>
    </div>
  );
}

export default NotificationDemo;
