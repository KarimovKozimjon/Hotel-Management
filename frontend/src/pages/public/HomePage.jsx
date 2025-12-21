import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Xush kelibsiz Grand Hotel ga! 🏨
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Eng yaxshi xizmat va qulay xonalar bilan unutilmas dam olish
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/public/rooms"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Xonalarni ko'rish
              </Link>
              <Link
                to="/guest/register"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Bron qilish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nega bizni tanlaysiz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🛏️</div>
              <h3 className="text-xl font-bold mb-2">Qulay xonalar</h3>
              <p className="text-gray-600">
                Zamonaviy jihozlar bilan ta'minlangan shinam va qulay xonalar
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">A'lo darajadagi xizmat</h3>
              <p className="text-gray-600">
                Professional xodimlar va 24/7 mijozlar xizmati
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Qulay narxlar</h3>
              <p className="text-gray-600">
                Sifatli xizmat va affordable narxlar kombinatsiyasi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Rooms Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Mashhur xonalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Room Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-6xl">🏨</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Standard xona</h3>
                <p className="text-gray-600 mb-4">Bir kishi uchun qulay va shinam xona</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">$50/kecha</span>
                  <Link
                    to="/public/rooms"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Batafsil
                  </Link>
                </div>
              </div>
            </div>

            {/* Room Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-white text-6xl">👑</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Deluxe xona</h3>
                <p className="text-gray-600 mb-4">Ikki kishi uchun keng va hashamatli xona</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-600">$80/kecha</span>
                  <Link
                    to="/public/rooms"
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Batafsil
                  </Link>
                </div>
              </div>
            </div>

            {/* Room Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
                <span className="text-white text-6xl">✨</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Suite xona</h3>
                <p className="text-gray-600 mb-4">VIP mijozlar uchun premium xona</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-600">$150/kecha</span>
                  <Link
                    to="/public/rooms"
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Batafsil
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/public/rooms"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
            >
              Barcha xonalarni ko'rish →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Hoziroq bron qiling!</h2>
          <p className="text-xl mb-8">
            Ro'yxatdan o'ting va maxsus chegirmalardan foydalaning
          </p>
          <Link
            to="/guest/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Ro'yxatdan o'tish
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Baxtli mijozlar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Qulay xonalar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Xizmat ko'rsatish</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8⭐</div>
              <div className="text-gray-600">O'rtacha reyting</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
