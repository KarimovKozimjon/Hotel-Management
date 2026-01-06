import { useState, useEffect, useMemo } from 'react';
import { dashboardService } from '../../services/dashboardService';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getRoomTypeLabel } from '../../utils/roomTypeLabel';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUsd = (value) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD'
    }).format(Number(value || 0));

  // Sample data for charts (backend dan kelishi kerak)
  const chartKey = i18n.language;

  const revenueData = useMemo(
    () => [
      { name: t('admin.dashboard.monthsShort.jan'), revenue: 4000 },
      { name: t('admin.dashboard.monthsShort.feb'), revenue: 3000 },
      { name: t('admin.dashboard.monthsShort.mar'), revenue: 5000 },
      { name: t('admin.dashboard.monthsShort.apr'), revenue: 4500 },
      { name: t('admin.dashboard.monthsShort.may'), revenue: 6000 },
      { name: t('admin.dashboard.monthsShort.jun'), revenue: 5500 },
      { name: t('admin.dashboard.monthsShort.jul'), revenue: 7000 },
      { name: t('admin.dashboard.monthsShort.aug'), revenue: 6500 },
      { name: t('admin.dashboard.monthsShort.sep'), revenue: 8000 },
      { name: t('admin.dashboard.monthsShort.oct'), revenue: 7500 },
      { name: t('admin.dashboard.monthsShort.nov'), revenue: 9000 },
      { name: t('admin.dashboard.monthsShort.dec'), revenue: 8500 },
    ],
    [chartKey, t]
  );

  const occupancyData = useMemo(
    () => [
      { name: t('admin.dashboard.weekdaysShort.mon'), value: 15 },
      { name: t('admin.dashboard.weekdaysShort.tue'), value: 10 },
      { name: t('admin.dashboard.weekdaysShort.wed'), value: 20 },
      { name: t('admin.dashboard.weekdaysShort.thu'), value: 18 },
      { name: t('admin.dashboard.weekdaysShort.fri'), value: 25 },
      { name: t('admin.dashboard.weekdaysShort.sat'), value: 30 },
      { name: t('admin.dashboard.weekdaysShort.sun'), value: 28 },
    ],
    [chartKey, t]
  );

  const roomTypeData = useMemo(
    () => [
      { name: getRoomTypeLabel('standard', t), value: 30, color: '#3B82F6' },
      { name: getRoomTypeLabel('deluxe', t), value: 20, color: '#10B981' },
      { name: getRoomTypeLabel('presidential', t), value: 15, color: '#F59E0B' },
    ],
    [chartKey, t]
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      toast.error(t('admin.dashboard.toast.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard.title')}</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">{t('admin.dashboard.totalRooms') || 'Jami Xonalar'}</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.stats?.total_rooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">{t('admin.dashboard.availableRooms') || "Bo'sh Xonalar"}</div>
            <div className="text-3xl font-bold text-green-600">{stats?.stats?.available_rooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">{t('admin.dashboard.occupiedRooms') || 'Band Xonalar'}</div>
            <div className="text-3xl font-bold text-orange-600">{stats?.stats?.occupied_rooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">{t('admin.dashboard.occupancyRate') || 'Bandlik %'}</div>
            <div className="text-3xl font-bold text-purple-600">{stats?.occupancy_rate}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">{t('admin.dashboard.todayCheckins') || 'Bugungi Kirish'}</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.stats?.today_checkins}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">{t('admin.dashboard.todayCheckouts') || 'Bugungi Chiqish'}</div>
            <div className="text-3xl font-bold text-red-600">{stats?.stats?.today_checkouts}</div>
          </div>
        </div>

        {/* Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{t('admin.dashboard.todayRevenue') || 'Bugungi Daromad'}</h3>
            <div className="text-2xl font-bold text-green-600">
              {formatUsd(stats?.stats?.today_revenue)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{t('admin.dashboard.monthRevenue') || 'Oylik Daromad'}</h3>
            <div className="text-2xl font-bold text-green-600">
              {formatUsd(stats?.stats?.month_revenue)}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">{t('admin.dashboard.charts.monthlyRevenueTitle')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart key={chartKey} data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name={t('admin.dashboard.charts.legend.revenueUsd')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">{t('admin.dashboard.charts.weeklyOccupancyTitle')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart key={chartKey} data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#10B981" name={t('admin.dashboard.charts.legend.occupiedRooms')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Types Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">{t('admin.dashboard.charts.roomTypesDistributionTitle')}</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key={chartKey}>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">{t('admin.dashboard.recentBookings.title')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.recentBookings.table.bookingNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.recentBookings.table.guest')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.recentBookings.table.room')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.recentBookings.table.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recent_bookings?.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.booking_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.guest?.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.room?.room_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`booking.status.${booking.status}`) === `booking.status.${booking.status}`
                          ? booking.status
                          : t(`booking.status.${booking.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
