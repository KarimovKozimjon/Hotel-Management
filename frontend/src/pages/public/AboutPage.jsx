import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Biz haqimizda</h1>
          <p className="text-xl text-gray-100">
            Grand Hotel - Sizning qulay uyingiz
          </p>
        </div>
      </div>

      {/* About Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <span className="text-5xl mr-4">🎯</span>
            <h2 className="text-3xl font-bold">Bizning missiyamiz</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Grand Hotel O'zbekistondagi eng yaxshi mehmonxonalardan biri bo'lib, mijozlarimizga 
            eng yuqori darajadagi xizmat va qulay dam olish sharoitini taqdim etishni maqsad qilgan. 
            Biz har bir mehmonimizni o'z uyidagidek his qilishini ta'minlaymiz.
          </p>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Bizning qadriyatlarimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">Sifat</h3>
              <p className="text-gray-600">
                Eng yuqori sifatli xizmat va qulay sharoitlar
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Ishonch</h3>
              <p className="text-gray-600">
                Mijozlar bilan uzoq muddatli ishonch munosabatlari
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2">Professionallik</h3>
              <p className="text-gray-600">
                Malakali va tajribali xodimlar jamoasi
              </p>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Bizning imkoniyatlarimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <span className="text-3xl mr-4">🏊</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Suzish havzasi</h3>
                <p className="text-gray-600">Yozda va qishda ochiq suzish havzasi</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-3xl mr-4">🍽️</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Restoran</h3>
                <p className="text-gray-600">Milliy va xalqaro oshxona</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-3xl mr-4">💪</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Fitnes zal</h3>
                <p className="text-gray-600">Zamonaviy sport uskunalari</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-3xl mr-4">🧖</span>
              <div>
                <h3 className="font-bold text-lg mb-1">SPA markaz</h3>
                <p className="text-gray-600">Massaj va sog'lomlashtirish xizmatlari</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-3xl mr-4">📶</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Bepul Wi-Fi</h3>
                <p className="text-gray-600">Tez va barqaror internet</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-3xl mr-4">🚗</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Parking</h3>
                <p className="text-gray-600">Xavfsiz va bepul avtoturargoh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Raqamlarda Grand Hotel</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">2010</div>
              <div className="text-gray-100">Tashkil etilgan yil</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-gray-100">Zamonaviy xonalar</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-gray-100">Baxtli mijozlar</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">30+</div>
              <div className="text-gray-100">Malakali xodimlar</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Bizning jamoamiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden text-center">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-6xl">👨‍💼</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">Alisher Karimov</h3>
                <p className="text-gray-600 mb-2">Direktor</p>
                <p className="text-sm text-gray-500">15 yillik tajriba</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden text-center">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-white text-6xl">👩‍💼</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">Malika Rahimova</h3>
                <p className="text-gray-600 mb-2">Menejer</p>
                <p className="text-sm text-gray-500">10 yillik tajriba</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden text-center">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-white text-6xl">👨‍🍳</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">Javohir Toshmatov</h3>
                <p className="text-gray-600 mb-2">Bosh oshpaz</p>
                <p className="text-sm text-gray-500">12 yillik tajriba</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Bizni tanlaganingiz uchun rahmat!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Sizni Grand Hotel da ko'rishni intiqlik bilan kutamiz
          </p>
          <Link
            to="/guest/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
          >
            Hoziroq bron qilish
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
