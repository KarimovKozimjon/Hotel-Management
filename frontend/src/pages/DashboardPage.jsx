import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import RoomAvailabilityCalendar from '../components/admin/RoomAvailabilityCalendar';
import NotificationDemo from '../components/demo/NotificationDemo';

function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBookings: 0,
    totalGuests: 0,
    totalRevenue: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    availableRooms: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const formatUsd = (amount) => {
    const numericAmount = Number(amount ?? 0);
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD'
    }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [roomsRes, bookingsRes, guestsRes, paymentsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/bookings'),
        api.get('/guests'),
        api.get('/payments')
      ]);

      const rooms = roomsRes.data;
      const bookings = bookingsRes.data.data || bookingsRes.data;
      const guests = guestsRes.data;
      const payments = paymentsRes.data.data || paymentsRes.data;

      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = bookings.filter(b => b.check_in_date === today).length;
      const todayCheckOuts = bookings.filter(b => b.check_out_date === today).length;
      
      const activeBookings = bookings.filter(b => 
        ['confirmed', 'checked_in'].includes(b.status)
      ).length;
      
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const occupancyRate = rooms.length > 0 
        ? ((activeBookings / rooms.length) * 100).toFixed(1)
        : 0;

      setStats({
        totalRooms: rooms.length,
        totalBookings: bookings.length,
        totalGuests: guests.length,
        totalRevenue,
        todayCheckIns,
        todayCheckOuts,
        availableRooms: rooms.length - activeBookings,
        occupancyRate
      });
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {showCalendar ? t('admin.dashboard.actions.viewStats') : t('admin.dashboard.actions.viewCalendar')}
        </button>
      </div>

      {showCalendar ? (
        /* Calendar View */
        <RoomAvailabilityCalendar />
      ) : (
        /* Statistics View */
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Rooms */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">{t('admin.dashboard.totalRooms')}</p>
                  <p className="text-3xl font-bold">{stats.totalRooms}</p>
                </div>
                <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-blue-100 text-xs mt-3">
                {t('admin.dashboard.availableRoomsLabel', { value: stats.availableRooms })}
              </p>
            </div>

            {/* Total Bookings */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">{t('admin.dashboard.totalBookings')}</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </div>
                <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-green-100 text-xs mt-3">
                {t('admin.dashboard.occupancyLabel', { value: stats.occupancyRate })}
              </p>
            </div>

            {/* Total Guests */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">{t('admin.dashboard.totalGuests')}</p>
                  <p className="text-3xl font-bold">{stats.totalGuests}</p>
                </div>
                <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-purple-100 text-xs mt-3">
                {t('admin.dashboard.registeredLabel')}
              </p>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm mb-1">{t('admin.dashboard.totalRevenue')}</p>
                  <p className="text-3xl font-bold">{formatUsd(stats.totalRevenue)}</p>
                </div>
                <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-yellow-100 text-xs mt-3">
                {t('admin.dashboard.paidPaymentsLabel')}
              </p>
            </div>
          </div>

          {/* Today's Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today Check-ins */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.todayCheckins')}</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {stats.todayCheckIns}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                {t('admin.dashboard.todayCheckinsDescription', { value: stats.todayCheckIns })}
              </p>
              <Link 
                to="/bookings" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 inline-block"
              >
                {t('admin.dashboard.viewAllBookings')} →
              </Link>
            </div>

            {/* Today Check-outs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.todayCheckouts')}</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {stats.todayCheckOuts}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                {t('admin.dashboard.todayCheckoutsDescription', { value: stats.todayCheckOuts })}
              </p>
              <Link 
                to="/bookings" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 inline-block"
              >
                {t('admin.dashboard.viewAllBookings')} →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/bookings"
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{t('admin.dashboard.actions.newBooking')}</span>
              </Link>

              <Link
                to="/guests"
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{t('admin.dashboard.actions.addGuest')}</span>
              </Link>

              <Link
                to="/rooms"
                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{t('nav.rooms')}</span>
              </Link>

              <Link
                to="/payments"
                className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{t('nav.payments')}</span>
              </Link>
            </div>
          </div>

          {/* Notification Demo */}
          <NotificationDemo />
        </>
      )}
    </div>
  );
}

export default DashboardPage;
