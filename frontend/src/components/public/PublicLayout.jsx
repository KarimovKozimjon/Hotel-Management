import { Link, useLocation } from 'react-router-dom';

function PublicLayout({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-3xl">🏨</span>
                <span className="ml-2 text-2xl font-bold text-blue-600">Grand Hotel</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Bosh sahifa
              </Link>
              <Link
                to="/public/rooms"
                className={`text-sm font-medium transition-colors ${
                  isActive('/public/rooms') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Xonalar
              </Link>
              <Link
                to="/public/about"
                className={`text-sm font-medium transition-colors ${
                  isActive('/public/about') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Biz haqimizda
              </Link>
              <Link
                to="/public/contact"
                className={`text-sm font-medium transition-colors ${
                  isActive('/public/contact') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Bog'lanish
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/guest/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Kirish
              </Link>
              <Link
                to="/guest/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Ro'yxatdan o'tish
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold mb-4">🏨 Grand Hotel</h3>
              <p className="text-gray-400 text-sm">
                Eng yaxshi xizmat va qulay xonalar bilan sizni kutamiz.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Tezkor havolalar</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/public/rooms" className="text-gray-400 hover:text-white text-sm">
                    Xonalar
                  </Link>
                </li>
                <li>
                  <Link to="/public/about" className="text-gray-400 hover:text-white text-sm">
                    Biz haqimizda
                  </Link>
                </li>
                <li>
                  <Link to="/public/contact" className="text-gray-400 hover:text-white text-sm">
                    Bog'lanish
                  </Link>
                </li>
                <li>
                  <Link to="/guest/register" className="text-gray-400 hover:text-white text-sm">
                    Bron qilish
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">Bog'lanish</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📍 Toshkent, O'zbekiston</li>
                <li>📞 +998 90 123 45 67</li>
                <li>📧 info@grandhotel.uz</li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-lg font-bold mb-4">Ijtimoiy tarmoqlar</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="text-2xl">📘</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="text-2xl">📷</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="text-2xl">🐦</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Grand Hotel. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
