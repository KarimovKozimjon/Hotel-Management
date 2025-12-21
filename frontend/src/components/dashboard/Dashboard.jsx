import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import Navbar from '../common/Navbar';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample data for charts (backend dan kelishi kerak)
  const revenueData = [
    { name: 'Yan', revenue: 4000 },
    { name: 'Fev', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Iyun', revenue: 5500 },
    { name: 'Iyul', revenue: 7000 },
    { name: 'Avg', revenue: 6500 },
    { name: 'Sen', revenue: 8000 },
    { name: 'Okt', revenue: 7500 },
    { name: 'Noy', revenue: 9000 },
    { name: 'Dek', revenue: 8500 },
  ];

  const occupancyData = [
    { name: 'Dush', value: 15 },
    { name: 'Sesh', value: 10 },
    { name: 'Chor', value: 20 },
    { name: 'Pay', value: 18 },
    { name: 'Juma', value: 25 },
    { name: 'Shan', value: 30 },
    { name: 'Yak', value: 28 },
  ];

  const roomTypeData = [
    { name: 'Standard', value: 30, color: '#3B82F6' },
    { name: 'Deluxe', value: 20, color: '#10B981' },
    { name: 'Suite', value: 15, color: '#F59E0B' },
    { name: 'VIP', value: 5, color: '#EF4444' },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Jami Xonalar</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.stats?.total_rooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Bo'sh Xonalar</div>
            <div className="text-3xl font-bold text-green-600">{stats?.stats?.available_rooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Band Xonalar</div>
            <div className="text-3xl font-bold text-orange-600">{stats?.stats?.occupied_rooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Bandlik %</div>
            <div className="text-3xl font-bold text-purple-600">{stats?.occupancy_rate}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Bugungi Kirish</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.stats?.today_checkins}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Bugungi Chiqish</div>
            <div className="text-3xl font-bold text-red-600">{stats?.stats?.today_checkouts}</div>
          </div>
        </div>

        {/* Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Bugungi Daromad</h3>
            <div className="text-2xl font-bold text-green-600">
              ${stats?.stats?.today_revenue?.toLocaleString() || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Oylik Daromad</h3>
            <div className="text-2xl font-bold text-green-600">
              ${stats?.stats?.month_revenue?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Oylik Daromad Grafigi 📊</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
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
                  name="Daromad ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Haftalik Bandlik 📈</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#10B981" name="Band xonalar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Types Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Xona Turlari Taqsimoti 🥧</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
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
          <h3 className="text-xl font-bold mb-4">So'nggi Bronlar</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bron raqami
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mehmon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Xona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Holat
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
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
