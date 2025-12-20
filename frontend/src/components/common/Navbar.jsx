import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold">
            Mehmonxona Boshqaruv Tizimi
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
              Dashboard
            </Link>
            <Link to="/rooms" className="hover:bg-blue-700 px-3 py-2 rounded">
              Xonalar
            </Link>
            <Link to="/bookings" className="hover:bg-blue-700 px-3 py-2 rounded">
              Bronlar
            </Link>
            <Link to="/guests" className="hover:bg-blue-700 px-3 py-2 rounded">
              Mehmonlar
            </Link>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
