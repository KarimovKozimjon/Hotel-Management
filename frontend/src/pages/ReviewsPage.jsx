import { useState, useEffect } from 'react';
import reviewService from '../services/reviewService';
import { bookingService } from '../services/bookingService';
import { guestService } from '../services/guestService';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function ReviewsPage() {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    booking_id: '',
    guest_id: '',
    rating: 5,
    comment: '',
  });

  const formatDate = (date) =>
    new Intl.DateTimeFormat(i18n.language).format(new Date(date));

  useEffect(() => {
    fetchReviews();
    fetchBookings();
    fetchGuests();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getAll();
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      toast.error(t('admin.pages.reviews.toast.loadError'));
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = reviews.filter(review =>
      (review.guest?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.booking?.room?.room_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      // Filter only checked out bookings
      const checkedOutBookings = data.filter(b => b.status === 'checked_out');
      setBookings(checkedOutBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const openModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        booking_id: review.booking_id,
        guest_id: review.guest_id,
        rating: review.rating,
        comment: review.comment || '',
      });
    } else {
      setEditingReview(null);
      setFormData({
        booking_id: '',
        guest_id: '',
        rating: 5,
        comment: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setFormData({
      booking_id: '',
      guest_id: '',
      rating: 5,
      comment: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await reviewService.update(editingReview.id, {
          rating: formData.rating,
          comment: formData.comment,
        });
      } else {
        await reviewService.create(formData);
      }
      fetchReviews();
      closeModal();
    } catch (error) {
      console.error('Error saving review:', error);
      alert(error.response?.data?.error || t('admin.pages.reviews.toast.saveError'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.pages.reviews.confirmDelete'))) {
      try {
        await reviewService.delete(id);
        fetchReviews();
      } catch (error) {
        toast.error(t('admin.pages.reviews.toast.deleteError'));
        console.error('Error deleting review:', error);
      }
    }
  };

  const getStarDisplay = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <Loader className="h-64" />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.pages.reviews.title')}</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {t('admin.pages.reviews.actions.addReview')}
        </button>
      </div>

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} placeholder={t('admin.pages.reviews.searchPlaceholder')} />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('admin.pages.reviews.stats.totalReviews')}</h3>
          <p className="text-2xl font-bold">{reviews.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('admin.pages.reviews.stats.averageRating')}</h3>
          <p className="text-2xl font-bold">
            {reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : '0.0'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('admin.pages.reviews.stats.fiveStarReviews')}</h3>
          <p className="text-2xl font-bold">
            {reviews.filter(r => r.rating === 5).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t('admin.pages.reviews.stats.lowRatings')}</h3>
          <p className="text-2xl font-bold text-red-600">
            {reviews.filter(r => r.rating < 3).length}
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.reviews.table.id')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.reviews.table.guest')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.reviews.table.room')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.reviews.table.rating')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.reviews.table.comment')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.reviews.table.date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.reviews.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <tr key={review.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{review.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {review.guest?.name || t('common.notAvailable')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {review.booking?.room?.room_number || t('common.notAvailable')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-semibold ${getRatingColor(review.rating)}`}>
                    {getStarDisplay(review.rating)} ({review.rating}/5)
                  </span>
                </td>
                <td className="px-6 py-4 text-sm max-w-xs truncate">
                  {review.comment || t('admin.pages.reviews.noComment')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => openModal(review)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">{t('admin.pages.reviews.empty')}</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingReview ? t('admin.pages.reviews.modal.editTitle') : t('admin.pages.reviews.modal.createTitle')}
            </h2>
            <form onSubmit={handleSubmit}>
              {!editingReview && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">{t('admin.pages.reviews.form.booking')}</label>
                    <select
                      value={formData.booking_id}
                      onChange={(e) => {
                        const booking = bookings.find(b => b.id === parseInt(e.target.value));
                        setFormData({ 
                          ...formData, 
                          booking_id: e.target.value,
                          guest_id: booking?.guest_id || ''
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">{t('admin.pages.reviews.form.selectCompletedBooking')}</option>
                      {bookings.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {t('admin.pages.reviews.form.bookingOption', {
                            id: booking.id,
                            room: booking.room?.room_number || t('common.notAvailable'),
                            guest: booking.guest?.name || t('common.notAvailable')
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">{t('admin.pages.reviews.form.guest')}</label>
                    <select
                      value={formData.guest_id}
                      onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      required
                      disabled
                    >
                      <option value="">{t('admin.pages.reviews.form.selectGuest')}</option>
                      {guests.map((guest) => (
                        <option key={guest.id} value={guest.id}>
                          {guest.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{t('admin.pages.reviews.form.autoSelectedHint')}</p>
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('admin.pages.reviews.form.rating')}</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-3xl focus:outline-none"
                    >
                      {star <= formData.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-semibold">{formData.rating}/5</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('admin.pages.reviews.form.comment')}</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="4"
                  maxLength="1000"
                  placeholder={t('admin.pages.reviews.form.commentPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.pages.reviews.form.characterCount', {
                    current: formData.comment.length,
                    max: 1000
                  })}
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingReview ? t('admin.pages.reviews.actions.update') : t('admin.pages.reviews.actions.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewsPage;
