import { useState, useEffect } from 'react';
import { roomTypeService } from '../services/roomService';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const RoomTypesPage = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    base_price: '',
    amenities: [],
    image_url: ''
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const data = await roomTypeService.getAll();
      setRoomTypes(data);
      setLoading(false);
    } catch (error) {
      toast.error('Xona turlarini yuklashda xatolik');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting formData:', formData);
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('capacity', formData.capacity);
      submitData.append('base_price', formData.base_price);
      submitData.append('amenities', JSON.stringify(formData.amenities));
      
      console.log('Amenities being sent:', formData.amenities);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      if (editingRoomType) {
        // For PUT requests with FormData, we need to use POST with _method
        submitData.append('_method', 'PUT');
        const result = await roomTypeService.update(editingRoomType.id, submitData);
        console.log('Update result:', result);
        toast.success('Xona turi yangilandi');
      } else {
        const result = await roomTypeService.create(submitData);
        console.log('Create result:', result);
        toast.success('Xona turi qo\'shildi');
      }
      setShowModal(false);
      resetForm();
      fetchRoomTypes();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (roomType) => {
    setEditingRoomType(roomType);
    setFormData({
      name: roomType.name,
      description: roomType.description || '',
      capacity: roomType.capacity,
      base_price: roomType.base_price,
      amenities: roomType.amenities || [],
      image_url: roomType.image_url || ''
    });
    setImagePreview(roomType.image_url || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xona turini o\'chirmoqchimisiz?')) {
      try {
        await roomTypeService.delete(id);
        toast.success('Xona turi o\'chirildi');
        fetchRoomTypes();
      } catch (error) {
        toast.error('Xona turini o\'chirishda xatolik');
      }
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      base_price: '',
      amenities: [],
      image_url: ''
    });
    setAmenityInput('');
    setEditingRoomType(null);
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Xona turlari</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Yangi tur
          </button>
        </div>

        {/* Room Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {roomType.image_url && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={roomType.image_url} 
                    alt={roomType.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{roomType.name}</h3>
                <p className="text-gray-600 mb-4">{roomType.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Sig'imi</p>
                    <p className="text-lg font-semibold">{roomType.capacity} kishi</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Narxi</p>
                    <p className="text-2xl font-bold text-blue-600">${roomType.base_price}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Qulayliklar:</p>
                  <div className="flex flex-wrap gap-2">
                    {roomType.amenities && roomType.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  Xonalar: {roomType.rooms_count || 0} ta
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(roomType)}
                    className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(roomType.id)}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {roomTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Xona turlari topilmadi</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingRoomType ? 'Xona turini tahrirlash' : 'Yangi xona turi'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nomi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Sig'imi</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Narxi ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rasm</label>
                <div className="mb-2">
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">yoki URL kiriting:</p>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg mt-1"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Qulayliklar</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Qulaylik qo'shish"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Qo'shish
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center gap-2"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
    </div>
  );
};

export default RoomTypesPage;
