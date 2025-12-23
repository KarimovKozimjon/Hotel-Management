import { Navigate } from 'react-router-dom';
import { useGuestAuth } from '../context/GuestAuthContext';

const GuestPrivateRoute = ({ children }) => {
  const { guest, loading } = useGuestAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-xl text-gray-700">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return guest ? children : <Navigate to="/guest/login" />;
};

export default GuestPrivateRoute;
