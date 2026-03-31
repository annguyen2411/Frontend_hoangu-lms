import { useState, useEffect } from 'react';
import { Image, Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'home',
    is_active: true,
    order_index: 0,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const res = await api.admin.getBanners();
      if (res.success) {
        setBanners(res.data);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        const res = await api.admin.updateBanner(editingBanner.id, formData);
        if (res.success) {
          toast.success('Cập nhật banner thành công!');
          loadBanners();
        }
      } else {
        const res = await api.admin.createBanner(formData);
        if (res.success) {
          toast.success('Tạo banner thành công!');
          loadBanners();
        }
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Lỗi khi lưu banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      const res = await api.admin.deleteBanner(id);
      if (res.success) {
        toast.success('Xóa banner thành công!');
        loadBanners();
      }
    } catch (error) {
      toast.error('Lỗi khi xóa banner');
    }
  };

  const handleToggleActive = async (banner: any) => {
    try {
      const res = await api.admin.updateBanner(banner.id, { ...banner, is_active: !banner.is_active });
      if (res.success) {
        loadBanners();
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      position: 'home',
      is_active: true,
      order_index: 0,
      start_date: '',
      end_date: '',
    });
    setEditingBanner(null);
  };

  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      position: banner.position || 'home',
      is_active: banner.is_active ?? true,
      order_index: banner.order_index || 0,
      start_date: banner.start_date?.split('T')[0] || '',
      end_date: banner.end_date?.split('T')[0] || '',
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Banner</h1>
          <p className="text-gray-600 mt-1">Quản lý banner trang chủ và các trang khác</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="h-5 w-5 mr-2" /> Thêm Banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có banner nào</h3>
          <p className="text-gray-500">Tạo banner đầu tiên để hiển thị trên trang web</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Image className="h-12 w-12" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                  banner.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {banner.is_active ? 'Hoạt động' : 'Ẩn'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-1">{banner.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{banner.position}</span>
                  <span>Thứ tự: {banner.order_index}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleToggleActive(banner)}>
                    {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditModal(banner)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{editingBanner ? 'Sửa Banner' : 'Thêm Banner'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Banner khóa học mới"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Liên kết (tùy chọn)</label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/courses"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="home">Trang chủ</option>
                    <option value="courses">Khóa học</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                  <Input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    min={0}
                  />
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
                <label htmlFor="is_active" className="text-sm text-gray-700">Hiển thị banner</label>
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
