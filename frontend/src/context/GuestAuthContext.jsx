import { createContext, useContext, useState, useEffect } from 'react';
import { guestAuthService } from '../services/guestAuthService';
import Loader from '../components/common/Loader';

const GuestAuthContext = createContext(null);

export const GuestAuthProvider = ({ children }) => {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentGuest = guestAuthService.getCurrentGuest();
    setGuest(currentGuest);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await guestAuthService.login(email, password);
    setGuest(data.guest);
    return data;
  };

  const register = async (guestData) => {
    const data = await guestAuthService.register(guestData);
    setGuest(data.guest);
    return data;
  };

  const logout = async () => {
    await guestAuthService.logout();
    setGuest(null);
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <GuestAuthContext.Provider value={{ guest, setGuest, login, register, logout, loading }}>
      {children}
    </GuestAuthContext.Provider>
  );
};

export const useGuestAuth = () => {
  const context = useContext(GuestAuthContext);
  if (!context) {
    throw new Error('useGuestAuth must be used within GuestAuthProvider');
  }
  return context;
};
