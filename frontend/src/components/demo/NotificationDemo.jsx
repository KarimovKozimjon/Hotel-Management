import { useNotifications } from '../../context/NotificationContext';

function NotificationDemo() {
  const { addNotification } = useNotifications();

  const demos = [
    {
      title: 'Yangi Bron',
      action: () => addNotification({
        type: 'booking',
        message: 'Yangi bron: #BK12345',
        description: 'John Doe - Deluxe Room #301',
        sound: true
      })
    },
    {
      title: 'To\'lov Qabul Qilindi',
      action: () => addNotification({
        type: 'payment',
        message: 'To\'lov qabul qilindi: $250',
        description: 'Bron #BK12345 - Click.uz',
        sound: true
      })
    },
    {
      title: 'Check-in',
      action: () => addNotification({
        type: 'checkin',
        message: 'Mehmon check-in qilindi',
        description: 'Jane Smith - Suite #501',
        sound: true
      })
    },
    {
      title: 'Check-out',
      action: () => addNotification({
        type: 'checkout',
        message: 'Mehmon check-out qilindi',
        description: 'Bob Johnson - Standard #102',
        sound: true
      })
    },
    {
      title: 'Bron Tasdiqlandi',
      action: () => addNotification({
        type: 'success',
        message: 'Bron tasdiqlandi',
        description: 'Bron #BK12346 muvaffaqiyatli tasdiqlandi',
        sound: false
      })
    },
    {
      title: 'Bron Bekor Qilindi',
      action: () => addNotification({
        type: 'error',
        message: 'Bron bekor qilindi',
        description: 'Bron #BK12347 bekor qilindi',
        sound: false
      })
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        📢 Real-time Bildirishnomalar Demo
      </h2>
      <p className="text-gray-600 mb-6">
        Turli xil bildirishnomalarni sinab ko'ring (qo'ng'iroq belgisiga bosing):
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demos.map((demo, index) => (
          <button
            key={index}
            onClick={demo.action}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg border border-blue-200 transition"
          >
            {demo.title}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Ishlash Tartibi:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Yuqoridagi tugmalardan birini bosing</li>
          <li>• Navbar dagi qo'ng'iroq belgisida bildirishnoma paydo bo'ladi</li>
          <li>• Qizil badge yangi bildirishnomalar sonini ko'rsatadi</li>
          <li>• Qo'ng'iroq belgisiga bosib barcha bildirishnomalarni ko'ring</li>
          <li>• Real production da WebSocket/Pusher orqali avtomatik keladi</li>
        </ul>
      </div>
    </div>
  );
}

export default NotificationDemo;
