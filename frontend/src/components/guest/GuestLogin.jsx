import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGuestAuth } from '../../context/GuestAuthContext';
import toast from 'react-hot-toast';

function GuestLogin() {
  const navigate = useNavigate();
  const { login } = useGuestAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/guest/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-2">🏨 Guest Portal</h2>
        <p className="text-gray-600 text-center mb-8">Mehmonlar kabineti</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Parol
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Hali ro'yxatdan o'tmaganmisiz?{' '}
            <Link to="/guest/register" className="text-blue-600 hover:underline font-semibold">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
            ← Xodimlar paneliga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GuestLogin;
