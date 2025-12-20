import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import Navbar from '../common/Navbar';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
              {stats?.stats?.today_revenue?.toLocaleString()} so'm
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Oylik Daromad</h3>
            <div className="text-2xl font-bold text-green-600">
              {stats?.stats?.month_revenue?.toLocaleString()} so'm
            </div>
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
