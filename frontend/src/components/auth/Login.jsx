import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Login attempt:', { email, password: password ? '***' : 'empty' });

    try {
      await login(email, password);
      toast.success(t('auth.login') || 'Muvaffaqiyatli kirildi!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Login xato!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">Comfort Hub</span>
              <span className="text-xs text-gray-500">{t('admin.roleLabel')}</span>
            </div>
          </div>
          <LanguageSwitcher variant="dropdown" scrolled={true} />
        </div>

        <h2 className="text-3xl font-bold text-center mb-6">
          {t('auth.login') || 'Kirish'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">{t('auth.email') || 'Email'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder') || 'user@hotel.com'}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">{t('auth.password') || 'Parol'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition disabled:opacity-60 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {loading ? t('auth.loggingIn') : (t('auth.login') || 'Kirish')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
