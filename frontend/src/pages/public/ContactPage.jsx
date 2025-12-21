import { useState } from 'react';
import toast from 'react-hot-toast';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      toast.success('Xabaringiz yuborildi! Tez orada javob beramiz.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Bog'lanish</h1>
          <p className="text-xl text-gray-100">
            Biz bilan bog'lanish uchun quyidagi ma'lumotlardan foydalaning
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Xabar yuborish</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ismingizni kiriting"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Telefon raqami
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Mavzu *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Xabar mavzusi"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Xabar *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Xabaringizni yozing..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold mb-6">Aloqa ma'lumotlari</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <span className="text-3xl mr-4">📍</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Manzil</h3>
                    <p className="text-gray-600">
                      Amir Temur ko'chasi 25-uy,<br />
                      Toshkent, O'zbekiston, 100000
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-3xl mr-4">📞</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Telefon</h3>
                    <p className="text-gray-600">
                      +998 71 123 45 67<br />
                      +998 90 123 45 67
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-3xl mr-4">📧</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <p className="text-gray-600">
                      info@grandhotel.uz<br />
                      booking@grandhotel.uz
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-3xl mr-4">🕒</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Ish vaqti</h3>
                    <p className="text-gray-600">
                      Resepshon: 24/7<br />
                      Kunduzgi qabul: 08:00 - 20:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="font-bold text-lg mb-4">Xarita</h3>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🗺️</span>
                  <p className="text-gray-600">
                    Google Maps joylashuvi
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mt-6 text-white">
              <h3 className="font-bold text-lg mb-4">Ijtimoiy tarmoqlarda</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-white text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                >
                  📘
                </a>
                <a
                  href="#"
                  className="bg-white text-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                >
                  📷
                </a>
                <a
                  href="#"
                  className="bg-white text-blue-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                >
                  🐦
                </a>
                <a
                  href="#"
                  className="bg-white text-red-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                >
                  📺
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Ko'p beriladigan savollar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">❓ Check-in vaqti qachon?</h3>
              <p className="text-gray-600">
                Check-in vaqti soat 14:00 dan boshlanadi. Erta kelish imkoniyati ham mavjud.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">❓ Check-out vaqti qachon?</h3>
              <p className="text-gray-600">
                Check-out vaqti soat 12:00 gacha. Kechiktirishni oldindan so'rashingiz mumkin.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">❓ Bronni bekor qilish mumkinmi?</h3>
              <p className="text-gray-600">
                Ha, kelishdan 24 soat oldin bekor qilsangiz pul qaytariladi.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">❓ Parking bormi?</h3>
              <p className="text-gray-600">
                Ha, xavfsiz va bepul avtomobil turargoh mavjud.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">❓ Wi-Fi bepulmi?</h3>
              <p className="text-gray-600">
                Ha, barcha xonalarda va umumiy zonalarda bepul Wi-Fi mavjud.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">❓ Hayvonlar bilan kirish mumkinmi?</h3>
              <p className="text-gray-600">
                Kichik uy hayvonlari uchun maxsus xonalar mavjud. Oldindan xabar bering.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
