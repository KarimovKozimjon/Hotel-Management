import { useState, useEffect } from 'react';
import { userService, roleService } from '../services/userService';
import Loader from '../components/common/Loader';
import SearchBar from '../components/common/SearchBar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const UsersPage = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('admin.pages.users.toast.loadError'));
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      toast.error(t('admin.pages.users.toast.rolesLoadError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // If editing and password is empty, remove it
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      if (editingUser) {
        await userService.update(editingUser.id, submitData);
        toast.success(t('admin.pages.users.toast.updated'));
      } else {
        await userService.create(submitData);
        toast.success(t('admin.pages.users.toast.created'));
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pages.users.toast.genericError'));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.pages.users.confirmDelete'))) {
      try {
        await userService.delete(id);
        toast.success(t('admin.pages.users.toast.deleted'));
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || t('admin.pages.users.toast.deleteError'));
      }
    }
  };

  const formatDate = (date) => {
    const locale =
      i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'uz' ? 'uz-UZ' : 'en-US';
    return new Date(date).toLocaleDateString(locale);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: ''
    });
    setEditingUser(null);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      receptionist: 'bg-green-100 text-green-800',
      staff: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badges[role?.name] || 'bg-gray-100 text-gray-800'}`}>
        {role?.name || t('admin.pages.users.notAvailable')}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.users')}</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + {t('admin.pages.users.addNew')}
          </button>
        </div>

        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder={t('admin.pages.users.searchPlaceholder')} />
        </div>

        {/* Statistics */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.users.table.id')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.users.table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.users.table.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.users.table.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.users.table.createdAt')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.pages.users.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {t('admin.pages.users.empty')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">#{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.users.total')}</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.users.stats.admins')}</p>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role?.name === 'admin').length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.users.stats.managers')}</p>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role?.name === 'manager').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{t('admin.pages.users.stats.staff')}</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role?.name === 'receptionist' || u.role?.name === 'staff').length}
            </p>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? t('admin.pages.users.editTitle') : t('admin.pages.users.createTitle')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.users.form.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('auth.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  {t('auth.password')} {editingUser ? `(${t('admin.pages.users.form.passwordOptional')})` : ''}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingUser}
                  placeholder={
                    editingUser
                      ? t('admin.pages.users.form.newPasswordPlaceholder')
                      : t('admin.pages.users.form.passwordPlaceholder')
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('admin.pages.users.form.role')}</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
