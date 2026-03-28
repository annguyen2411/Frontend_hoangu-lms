import { useState, useEffect } from 'react';
import { Bell, Plus, Edit, Trash2, Eye, EyeOff, Info, AlertTriangle, CheckCircle, XCircle, Gift } from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

const typeIcons: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  promo: Gift,
};

const typeColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  promo: 'bg-purple-100 text-purple-700',
};

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target_role: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.admin.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotification) {
        const res = await api.admin.updateNotification(editingNotification.id, formData);
        if (res.success) {
          toast.success('Cập nhật thông báo thành công!');
          loadNotifications();
        }
      } else {
        const res = await api.admin.createNotification(formData);
        if (res.success) {
          toast.success('Tạo thông báo thành công!');
          loadNotifications();
        }
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Lỗi khi lưu thông báo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    try {
      const res = await api.admin.deleteNotification(id);
      if (res.success) {
        toast.success('Xóa thông báo thành công!');
        loadNotifications();
      }
    } catch (error) {
      toast.error('Lỗi khi xóa thông báo');
    }
  };

  const handleToggleActive = async (notification: any) => {
    try {
      const res = await api.admin.updateNotification(notification.id, { ...notification, is_active: !notification.is_active });
      if (res.success) {
        loadNotifications();
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target_role: '',
      is_active: true,
      start_date: '',
      end_date: '',
    });
    setEditingNotification(null);
  };

  const openEditModal = (notification: any) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title || '',
      content: notification.content || '',
      type: notification.type || 'info',
      target_role: notification.target_role || '',
      is_active: notification.is_active ?? true,
      start_date: notification.start_date?.split('T')[0] || '',
      end_date: notification.end_date?.split('T')[0] || '',
    });
    setShowModal(true);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo hệ thống</h1>
          <p className="text-gray-600 mt-1">Quản lý thông báo pop-up và tin tức</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="h-5 w-5 mr-2" /> Thêm Thông báo
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có thông báo nào</h3>
          <p className="text-gray-500">Tạo thông báo đầu tiên để hiển thị cho người dùng</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Info;
            return (
              <Card key={notification.id} className={`p-4 ${!notification.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${typeColors[notification.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${typeColors[notification.type]}`}>
                        {notification.type}
                      </span>
                      {!notification.is_active && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">Đã ẩn</span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{notification.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {notification.target_role && <span>Gửi đến: {notification.target_role}</span>}
                      <span>{new Date(notification.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleToggleActive(notification)}>
                      {notification.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(notification)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{editingNotification ? 'Sửa Thông báo' : 'Thêm Thông báo'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Thông báo quan trọng"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Nội dung thông báo..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại thông báo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="info">Thông tin</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="success">Thành công</option>
                    <option value="error">Lỗi</option>
                    <option value="promo">Khuyến mãi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gửi đến (tùy chọn)</label>
                  <select
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Tất cả</option>
                    <option value="student">Học viên</option>
                    <option value="instructor">Giảng viên</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Hiển thị thông báo</label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit" className="flex-1">Lưu</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
