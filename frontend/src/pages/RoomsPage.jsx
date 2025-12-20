import { useState, useEffect } from 'react';
import { roomService, roomTypeService } from '../../services/roomService';
import Navbar from '../common/Navbar';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    floor: '',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomService.getAll();
      setRooms(data.data || data);
    } catch (error) {
      toast.error('Xonalarni yuklashda xatolik!');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const data = await roomTypeService.getAll();
      setRoomTypes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.id, formData);
        toast.success('Xona yangilandi!');
      } else {
        await roomService.create(formData);
        toast.success('Yangi xona qo\'shildi!');
      }
      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      floor: room.floor,
      status: room.status,
      description: room.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xonani o\'chirmoqchimisiz?')) {
      try {
        await roomService.delete(id);
        toast.success('Xona o\'chirildi!');
        fetchRooms();
      } catch (error) {
        toast.error('O\'chirishda xatolik!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: '',
      room_type_id: '',
      floor: '',
      status: 'available',
      description: ''
    });
    setEditingRoom(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      cleaning: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Xonalar</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Yangi Xona
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xona raqami</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qavat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{room.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{room.room_type?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{room.floor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                {editingRoom ? 'Xonani tahrirlash' : 'Yangi xona'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Xona raqami</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Xona turi</label>
                  <select
                    value={formData.room_type_id}
                    onChange={(e) => setFormData({...formData, room_type_id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Tanlang</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Qavat</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Holat</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Bo'sh</option>
                    <option value="occupied">Band</option>
                    <option value="maintenance">Ta'mirlash</option>
                    <option value="cleaning">Tozalanmoqda</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Tavsif</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
