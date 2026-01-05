import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { motion } from 'framer-motion';
import Loader from '../components/common/Loader';

function ContactMessagesPage() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'

  const dateLocale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'uz' ? 'uz-UZ' : 'en-US';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/contact-messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    if (!message.is_read) {
      try {
        await api.post(`/contact-messages/${message.id}/mark-as-read`);
        fetchMessages(); // Refresh list
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete') || 'O\'chirishni tasdiqlaysizmi?')) {
      try {
        await api.delete(`/contact-messages/${id}`);
        fetchMessages();
        setShowModal(false);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'read') return msg.is_read;
    if (filter === 'unread') return !msg.is_read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.pages.messages.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('admin.pages.messages.summary', { total: messages.length, unread: unreadCount })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('admin.pages.messages.filters.all')}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg relative ${
              filter === 'unread' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('admin.pages.messages.filters.unread')}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'read' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('admin.pages.messages.filters.read')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('admin.pages.messages.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.pages.messages.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.pages.messages.table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.pages.messages.table.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.pages.messages.table.phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.pages.messages.table.message')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.pages.messages.table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.pages.messages.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr 
                  key={message.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    !message.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!message.is_read ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t('admin.pages.messages.badges.new')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {t('admin.pages.messages.badges.read')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {message.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{message.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{message.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {message.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleDateString(dateLocale, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message.id);
                      }}
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
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{t('admin.pages.messages.modal.title')}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('admin.pages.messages.fields.name')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedMessage.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">{t('admin.pages.messages.fields.email')}</label>
                <a href={`mailto:${selectedMessage.email}`} className="mt-1 text-lg text-indigo-600 hover:underline">
                  {selectedMessage.email}
                </a>
              </div>

              {selectedMessage.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('admin.pages.messages.fields.phone')}</label>
                  <a href={`tel:${selectedMessage.phone}`} className="mt-1 text-lg text-indigo-600 hover:underline">
                    {selectedMessage.phone}
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">{t('admin.pages.messages.fields.message')}</label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">{t('admin.pages.messages.fields.sentAt')}</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedMessage.created_at).toLocaleString(dateLocale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedMessage.ip_address && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('admin.pages.messages.fields.ipAddress')}</label>
                  <p className="mt-1 text-gray-900">{selectedMessage.ip_address}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                {t('common.close')}
              </button>
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ContactMessagesPage;
