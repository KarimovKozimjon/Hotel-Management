import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getRoomTypeLabel } from '../utils/roomTypeLabel';
import Loader from '../components/common/Loader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function ReportsPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState('month'); // 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [revenueData, setRevenueData] = useState([]);
  const [bookingStats, setBookingStats] = useState([]);
  const [roomTypeStats, setRoomTypeStats] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageOccupancy: 0,
    totalGuests: 0,
    cancelledBookings: 0,
    completedPayments: 0
  });

  const formatUsd = (value) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD'
    }).format(Number(value || 0));

  const formatChartDate = (date) =>
    new Intl.DateTimeFormat(i18n.language, {
      month: 'short',
      day: '2-digit'
    }).format(date);

  const resolveBookingStatusLabel = (status) => {
    const translated = t(`booking.status.${status}`);
    if (translated && !translated.startsWith('booking.status.')) return translated;

    return String(status || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    if (dateRange === 'week') {
      const end = new Date();
      const start = subDays(end, 7);
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
    } else if (dateRange === 'month') {
      setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    }
  }, [dateRange]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes, roomsRes, guestsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/payments'),
        api.get('/rooms'),
        api.get('/guests')
      ]);

      const bookings = bookingsRes.data.data || bookingsRes.data;
      const payments = paymentsRes.data.data || paymentsRes.data;
      const rooms = roomsRes.data;
      const guests = guestsRes.data;

      // Filter by date range
      const filteredBookings = bookings.filter(b => {
        const checkIn = new Date(b.check_in_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return checkIn >= start && checkIn <= end;
      });

      const filteredPayments = payments.filter(p => {
        const paymentDate = new Date(p.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return paymentDate >= start && paymentDate <= end;
      });

      // Calculate summary
      const totalRevenue = filteredPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;
      const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;

      setSummary({
        totalRevenue,
        totalBookings: filteredBookings.length,
        averageOccupancy: rooms.length > 0 ? ((filteredBookings.length / rooms.length) * 100).toFixed(1) : 0,
        totalGuests: guests.length,
        cancelledBookings,
        completedPayments
      });

      // Revenue by day
      const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
      const revenueByDay = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayPayments = filteredPayments.filter(p => 
          format(new Date(p.created_at), 'yyyy-MM-dd') === dayStr && p.status === 'completed'
        );
        const revenue = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        
        return {
          date: formatChartDate(day),
          revenue: parseFloat(revenue.toFixed(2)),
          bookings: filteredBookings.filter(b => 
            format(new Date(b.check_in_date), 'yyyy-MM-dd') === dayStr
          ).length
        };
      });
      setRevenueData(revenueByDay);

      // Booking status distribution
      const statusCounts = {
        pending: 0,
        confirmed: 0,
        checked_in: 0,
        checked_out: 0,
        cancelled: 0
      };
      filteredBookings.forEach(b => {
        if (statusCounts.hasOwnProperty(b.status)) {
          statusCounts[b.status]++;
        }
      });
      const bookingStatsData = Object.keys(statusCounts)
        .map((status) => ({
          name: resolveBookingStatusLabel(status),
          value: statusCounts[status]
        }))
        .filter((s) => s.value > 0);
      setBookingStats(bookingStatsData);

      // Room type popularity
      const roomTypeCounts = {};
      filteredBookings.forEach(b => {
        const typeName = b.room?.room_type ? getRoomTypeLabel(b.room.room_type, t) : t('admin.pages.reports.unknown');
        roomTypeCounts[typeName] = (roomTypeCounts[typeName] || 0) + 1;
      });
      const roomTypeData = Object.keys(roomTypeCounts).map(type => ({
        name: type,
        value: roomTypeCounts[type]
      }));
      setRoomTypeStats(roomTypeData);

      // Occupancy rate by day
      const occupancyByDay = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const activeBookings = bookings.filter(b => {
          const checkIn = new Date(b.check_in_date);
          const checkOut = new Date(b.check_out_date);
          const currentDay = new Date(dayStr);
          return currentDay >= checkIn && currentDay <= checkOut && 
                 ['confirmed', 'checked_in'].includes(b.status);
        }).length;
        
        const occupancyRate = rooms.length > 0 ? ((activeBookings / rooms.length) * 100).toFixed(1) : 0;
        
        return {
          date: formatChartDate(day),
          occupancy: parseFloat(occupancyRate)
        };
      });
      setOccupancyData(occupancyByDay);

    } catch (error) {
      toast.error(t('admin.pages.reports.toast.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = [
      [t('admin.pages.reports.export.report'), `${startDate} - ${endDate}`],
      [''],
      [t('admin.pages.reports.summary.totalRevenue'), formatUsd(summary.totalRevenue)],
      [t('admin.pages.reports.summary.totalBookings'), summary.totalBookings],
      [t('admin.pages.reports.summary.averageOccupancy'), summary.averageOccupancy],
      [t('admin.pages.reports.summary.totalGuests'), summary.totalGuests],
      [t('admin.pages.reports.summary.cancelledBookings'), summary.cancelledBookings],
      [t('admin.pages.reports.summary.completedPayments'), summary.completedPayments],
      [''],
      [t('admin.pages.reports.table.date'), t('admin.pages.reports.table.revenue'), t('admin.pages.reports.table.bookings')],
      ...revenueData.map(d => [d.date, d.revenue, d.bookings])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${t('admin.pages.reports.export.filenamePrefix')}_${startDate}_${endDate}.csv`;
    link.click();
    toast.success(t('admin.pages.reports.toast.downloaded'));
  };

  if (loading) {
    return <Loader className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.pages.reports.title')}</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('admin.pages.reports.exportCsv')}
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-lg ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('admin.pages.reports.range.week')}
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg ${dateRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('admin.pages.reports.range.month')}
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-lg ${dateRange === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('admin.pages.reports.range.custom')}
            </button>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">{t('admin.pages.reports.summary.totalRevenue')}</p>
          <p className="text-3xl font-bold text-green-600">{formatUsd(summary.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">{t('admin.pages.reports.summary.totalBookings')}</p>
          <p className="text-3xl font-bold text-blue-600">{summary.totalBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">{t('admin.pages.reports.summary.averageOccupancy')}</p>
          <p className="text-3xl font-bold text-purple-600">{summary.averageOccupancy}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">{t('admin.pages.reports.summary.totalGuests')}</p>
          <p className="text-3xl font-bold text-yellow-600">{summary.totalGuests}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">{t('admin.pages.reports.summary.cancelledBookings')}</p>
          <p className="text-3xl font-bold text-red-600">{summary.cancelledBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">{t('admin.pages.reports.summary.completedPayments')}</p>
          <p className="text-3xl font-bold text-green-600">{summary.completedPayments}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.pages.reports.charts.dailyRevenue')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name={t('admin.pages.reports.charts.legend.revenueUsd')} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.pages.reports.charts.dailyBookings')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#3b82f6" name={t('admin.pages.reports.charts.legend.bookings')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.pages.reports.charts.bookingStatus')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Room Type Popularity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.pages.reports.charts.roomTypePopularity')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roomTypeStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roomTypeStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.pages.reports.charts.occupancyRate')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="occupancy" stroke="#8b5cf6" name={t('admin.pages.reports.charts.legend.occupancyPercent')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
