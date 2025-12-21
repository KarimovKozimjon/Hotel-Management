import { useState, useEffect } from 'react';
import { roomService, roomTypeService } from '../services/roomService';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import RoomImageManager from '../components/admin/RoomImageManager';
import toast from 'react-hot-toast';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
      setRooms(data);
      setFilteredRooms(data);
      setLoading(false);
    } catch (error) {
      toast.error('Xonalarni yuklashda xatolik');
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = rooms.filter(room =>
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.floor.toString().includes(searchTerm)
    );
    setFilteredRooms(filtered);
    setCurrentPage(1); // Reset to first page on search
  };

  const fetchRoomTypes = async () => {
    try {
      const data = await roomTypeService.getAll();
      setRoomTypes(data);
    } catch (error) {
      toast.error('Xona turlarini yuklashda xatolik');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.id, formData);
        toast.success('Xona yangilandi');
      } else {
        await roomService.create(formData);
        toast.success('Xona qo\'shildi');
      }
      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
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
        toast.success('Xona o\'chirildi');
        fetchRooms();
      } catch (error) {
        toast.error('Xonani o\'chirishda xatolik');
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

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      reserved: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      available: 'Bo\'sh',
      occupied: 'Band',
      maintenance: 'Ta\'mirlash',
      reserved: 'Bron qilingan'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Xonalar</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Yangi xona
          </button>
        </div>

        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder="Xona raqami, turi, holati bo'yicha qidirish..." />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xona №</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qavat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Narxi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holati</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{room.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{room.room_type?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{room.floor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${room.room_type?.base_price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(room.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setShowImageModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      Rasmlar
                    </button>
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
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
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRooms.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
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
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Xona turi</label>
                <select
                  value={formData.room_type_id}
                  onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
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
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Holati</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="available">Bo'sh</option>
                  <option value="occupied">Band</option>
                  <option value="maintenance">Ta'mirlash</option>
                  <option value="reserved">Bron qilingan</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Manager Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Xona Rasmlari</h2>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedRoomId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <RoomImageManager
              roomId={selectedRoomId}
              onImagesChange={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
