import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import roomImageService from '../../services/roomImageService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getRoomTypeAmenities, getRoomTypeDescription, getRoomTypeLabel } from '../../utils/roomTypeLabel';
import Loader from '../../components/common/Loader';

function PublicRoomsPage() {
  const { t } = useTranslation();
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomImages, setRoomImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [typesRes, roomsRes] = await Promise.all([
        api.get('/room-types'),
        api.get('/rooms')
      ]);
      setRoomTypes(typesRes.data);
      const availableRooms = roomsRes.data.filter(room => room.status === 'available');
      setRooms(availableRooms);
      
      // Fetch images for each room
      const imagesPromises = availableRooms.map(async (room) => {
        try {
          const images = await roomImageService.getImages(room.id);
          return { roomId: room.id, images };
        } catch (error) {
          return { roomId: room.id, images: [] };
        }
      });
      
      const imagesResults = await Promise.all(imagesPromises);
      const imagesMap = {};
      imagesResults.forEach(({ roomId, images }) => {
        imagesMap[roomId] = images;
      });
      setRoomImages(imagesMap);
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = selectedType
    ? rooms.filter(room => room.room_type_id === parseInt(selectedType))
    : rooms;

  const groupedByType = {};
  filteredRooms.forEach(room => {
    const typeName = room.room_type ? getRoomTypeLabel(room.room_type, t) : 'Other';
    if (!groupedByType[typeName]) {
      groupedByType[typeName] = {
        type: room.room_type,
        rooms: []
      };
    }
    groupedByType[typeName].rooms.push(room);
  });

  if (loading) {
    return <Loader fullScreen className="bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Bizning xonalarimiz</h1>
          <p className="text-xl text-gray-100">
            Eng qulay va zamonaviy xonalarni toping
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="font-semibold text-gray-700">Xona turi:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barchasi</option>
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {getRoomTypeLabel(type, t)} - ${type.base_price}/kecha
                </option>
              ))}
            </select>
            <span className="text-gray-600">
              {filteredRooms.length} ta xona topildi
            </span>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.keys(groupedByType).length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🚫</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Xonalar topilmadi</h3>
            <p className="text-gray-600">Hozirda bu toifada mavjud xonalar yo'q</p>
          </div>
        ) : (
          Object.entries(groupedByType).map(([typeName, data]) => (
            <div key={typeName} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{typeName}</h2>
                  <p className="text-gray-600 mt-1">{getRoomTypeDescription(data.type, t)}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ${data.type?.base_price}
                  </div>
                  <div className="text-sm text-gray-600">har kecha</div>
                </div>
              </div>

              {/* Amenities */}
              {getRoomTypeAmenities(data.type, t).length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {(() => {
                    const amenities = getRoomTypeAmenities(data.type, t);
                    const maxAmenities = 6;
                    const visible = amenities.slice(0, maxAmenities);
                    const remaining = amenities.length - visible.length;

                    return (
                      <>
                        {visible.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            ✓ {amenity}
                          </span>
                        ))}

                        {remaining > 0 && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            +{remaining}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.rooms.map((room) => {
                  const images = roomImages[room.id] || [];
                  const primaryImage = images.find(img => img.is_primary) || images[0];
                  
                  return (
                    <div
                      key={room.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                    >
                      {/* Room Image */}
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                        {primaryImage ? (
                          <img
                            src={primaryImage.image_url}
                            alt={`Xona ${room.room_number}`}
                            className="w-full h-full object-cover hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-white text-6xl">🏨</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">Xona #{room.room_number}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            Mavjud
                          </span>
                        </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">🚪</span>
                          {room.floor}-qavat
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">👥</span>
                          {data.type?.capacity} kishi
                        </div>
                      </div>

                      <Link
                        to="/guest/register"
                        className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Bron qilish
                      </Link>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Yoqqan xonangizni topdingizmi?</h2>
          <p className="text-xl mb-6">
            Ro'yxatdan o'ting va onlayn bron qiling
          </p>
          <Link
            to="/guest/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Hoziroq bron qilish
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicRoomsPage;
