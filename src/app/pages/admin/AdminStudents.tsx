import { useState, useEffect } from 'react';
import { Search, Download, Plus, X, Edit, Trash2, User, Mail, Shield } from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  level: number;
  coins: number;
  mshv: string;
  created_at: string;
}

export function AdminStudents() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'student', mshv: '' });
  const [editFormData, setEditFormData] = useState({ full_name: '', role: 'student', level: 1, coins: 0, mshv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.admin.getUsers({ search: searchTerm });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.admin.createUser(formData);
      if (res.success) {
        setSuccess('Tạo người dùng thành công!');
        setShowModal(false);
        setFormData({ full_name: '', email: '', password: '', role: 'student', mshv: '' });
        loadUsers();
      } else {
        setError(res.error || 'Lỗi khi tạo người dùng');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      role: user.role,
      level: user.level || 1,
      coins: user.coins || 0,
      mshv: user.mshv || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const res = await api.admin.updateUser(editingUser.id, editFormData);
      if (res.success) {
        toast.success('Cập nhật người dùng thành công!');
        setShowEditModal(false);
        setEditingUser(null);
        loadUsers();
      } else {
        toast.error(res.error || 'Lỗi khi cập nhật');
      }
    } catch (err) {
      toast.error('Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await api.admin.deleteUser(userId);
      if (res.success) {
        toast.success('Xóa người dùng thành công!');
        loadUsers();
      } else {
        toast.error(res.error || 'Lỗi khi xóa');
      }
    } catch (err) {
      toast.error('Lỗi kết nối');
    }
  };

  const exportToExcel = () => {
    alert('Xuất Excel: Danh sách ' + users.length + ' người dùng');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị';
      case 'instructor': return 'Giảng viên';
      case 'student': return 'Học viên';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'instructor': return 'bg-blue-100 text-blue-700';
      case 'student': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {users.length} người dùng</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Thêm người dùng
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, email..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </div>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">MSHV</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Coins</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.full_name || 'Chưa cập nhật'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-blue-600">{user.mshv || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">Lv.{user.level || 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-yellow-600">{user.coins || 0} xu</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy người dùng nào
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Thêm người dùng mới</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <Input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản (Email) *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@hoanguy.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="******"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, mshv: e.target.value === 'student' ? formData.mshv : '' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="student">Học viên</option>
                  <option value="instructor">Giảng viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              {formData.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã số học viên (MSHV)</label>
                  <Input
                    type="text"
                    value={formData.mshv}
                    onChange={(e) => setFormData({ ...formData, mshv: e.target.value })}
                    placeholder="HV00123"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Đang tạo...' : 'Tạo người dùng'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Sửa người dùng</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <Input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value, mshv: e.target.value === 'student' ? editFormData.mshv : '' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="student">Học viên</option>
                  <option value="instructor">Giảng viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              {editFormData.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã số học viên (MSHV)</label>
                  <Input
                    type="text"
                    value={editFormData.mshv}
                    onChange={(e) => setEditFormData({ ...editFormData, mshv: e.target.value })}
                    placeholder="HV00123"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={editFormData.level}
                    onChange={(e) => setEditFormData({ ...editFormData, level: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coins</label>
                  <Input
                    type="number"
                    min={0}
                    value={editFormData.coins}
                    onChange={(e) => setEditFormData({ ...editFormData, coins: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Hủy</Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
