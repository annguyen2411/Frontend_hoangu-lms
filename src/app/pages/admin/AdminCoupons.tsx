import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Tag, Loader2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  discount_amount_vnd: number;
  min_purchase_vnd: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}

export function AdminCoupons() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_percent: 0,
    discount_amount_vnd: 0,
    min_purchase_vnd: 0,
    max_uses: 0,
    is_active: true,
    starts_at: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.coupons.getAll();
      if (response.success) {
        setCoupons(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã: ${code}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      if (editingCoupon) {
        await api.coupons.update(editingCoupon.id, formData);
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await api.coupons.create(formData);
        toast.success('Tạo mã giảm giá thành công');
      }
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi lưu mã giảm giá');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_percent: coupon.discount_percent,
      discount_amount_vnd: coupon.discount_amount_vnd,
      min_purchase_vnd: coupon.min_purchase_vnd,
      max_uses: coupon.max_uses || 0,
      is_active: coupon.is_active,
      starts_at: coupon.starts_at ? coupon.starts_at.split('T')[0] : '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    
    try {
      await api.coupons.delete(id);
      toast.success('Xóa mã giảm giá thành công');
      fetchCoupons();
    } catch (error) {
      toast.error('Lỗi khi xóa mã giảm giá');
    }
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount_percent: 0,
      discount_amount_vnd: 0,
      min_purchase_vnd: 0,
      max_uses: 0,
      is_active: true,
      starts_at: '',
      expires_at: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mã giảm giá & Affiliate</h1>
          <p className="text-gray-600 mt-1">Quản lý các chương trình khuyến mãi</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Tạo mã mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Tổng mã giảm giá</div>
          <div className="text-2xl font-bold text-gray-900">{coupons.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-600">
            {coupons.filter((c) => c.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Đã sử dụng</div>
          <div className="text-2xl font-bold text-purple-600">
            {coupons.reduce((sum, c) => sum + c.used_count, 0)}
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn tối thiểu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sử dụng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-900">{coupon.code}</span>
                    <button
                      onClick={() => copyCouponCode(coupon.code)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="h-3 w-3 text-gray-400" />
                    </button>
                  </div>
                  {coupon.description && (
                    <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {coupon.discount_percent > 0 && (
                    <span className="text-green-600 font-medium">{coupon.discount_percent}%</span>
                  )}
                  {coupon.discount_amount_vnd > 0 && (
                    <span className="text-green-600 font-medium">{coupon.discount_amount_vnd.toLocaleString('vi-VN')}đ</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {coupon.min_purchase_vnd > 0 ? `${coupon.min_purchase_vnd.toLocaleString('vi-VN')}đ` : '-'}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {coupon.used_count} / {coupon.max_uses || '∞'}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {coupon.is_active ? 'Hoạt động' : 'Tắt'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="p-2 hover:bg-gray-100 rounded text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 hover:bg-gray-100 rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Chưa có mã giảm giá nào
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VIETNAM2024"
                  required
                  disabled={!!editingCoupon}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả mã giảm giá"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tiền (VND)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.discount_amount_vnd}
                    onChange={(e) => setFormData({ ...formData, discount_amount_vnd: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (VND)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.min_purchase_vnd}
                    onChange={(e) => setFormData({ ...formData, min_purchase_vnd: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lần sử dụng</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 0 })}
                    placeholder="0 = không giới hạn"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <Input
                    type="date"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                  <Input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
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
                <label htmlFor="is_active" className="text-sm text-gray-700">Kích hoạt ngay</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}