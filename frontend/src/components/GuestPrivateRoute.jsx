import { Navigate } from 'react-router-dom';
import { useGuestAuth } from '../context/GuestAuthContext';
import { useTranslation } from 'react-i18next';
import Loader from './common/Loader';

const GuestPrivateRoute = ({ children }) => {
  const { guest, loading } = useGuestAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <Loader
        fullScreen
        className="bg-gradient-to-br from-indigo-50 to-purple-50"
        message={t('common.loading') || 'Yuklanmoqda...'}
      />
    );
  }

  return guest ? children : <Navigate to="/guest/login" />;
};

export default GuestPrivateRoute;
