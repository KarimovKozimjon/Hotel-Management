import { createContext, useContext, useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pusher, setPusher] = useState(null);

  useEffect(() => {
    // Initialize Pusher (hozircha local simulation)
    // Real Pusher uchun: PUSHER_APP_KEY kerak
    // const pusherInstance = new Pusher('YOUR_PUSHER_KEY', {
    //   cluster: 'YOUR_CLUSTER',
    //   encrypted: true
    // });

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }

    // Cleanup
    return () => {
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, []);

  // Subscribe to channel
  const subscribe = (channel, event, callback) => {
    if (pusher) {
      const ch = pusher.subscribe(channel);
      ch.bind(event, callback);
      return () => {
        ch.unbind(event, callback);
        pusher.unsubscribe(channel);
      };
    }
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(prev => prev + 1);

    // Show toast
    if (notification.type === 'success') {
      toast.success(notification.message);
    } else if (notification.type === 'error') {
      toast.error(notification.message);
    } else if (notification.type === 'info') {
      toast(notification.message, { icon: 'ℹ️' });
    } else {
      toast(notification.message);
    }

    // Play sound
    if (notification.sound !== false) {
      playNotificationSound();
    }
  };

  // Mark as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(0);
  };

  // Clear all
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const updated = prev.filter(n => n.id !== notificationId);
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      
      return updated;
    });
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,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');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (error) {
      console.log('Sound error:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    subscribe
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
