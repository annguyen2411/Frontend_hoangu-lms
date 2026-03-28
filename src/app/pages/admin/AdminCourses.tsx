import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, Upload, Trash, Loader2 } from 'lucide-react';
import { useAdminCourses } from '../../hooks/useAdmin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import type { Course } from '../../../lib/database.types';

interface CourseFormData {
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  teacher_name: string;
  level: string;
  category: string;
  price_vnd: number;
  original_price_vnd: number;
  discount_percent: number;
  total_lessons: number;
  duration_hours: number;
  has_certificate: boolean;
  is_published: boolean;
  is_featured: boolean;
}

export function AdminCourses() {
  const { courses, loading, error, createCourse, updateCourse, deleteCourse, refetch } = useAdminCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentTab, setCurrentTab] = useState<'basic' | 'details'>('basic');
  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [formData, setFormData] = useState<CourseFormData>({
    slug: '',
    title: '',
    description: '',
    thumbnail_url: '',
    teacher_name: '',
    level: 'beginner',
    category: '',
    price_vnd: 0,
    original_price_vnd: 0,
    discount_percent: 0,
    total_lessons: 0,
    duration_hours: 0,
    has_certificate: true,
    is_published: false,
    is_featured: false,
  });

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentTab('basic');
    setEditingCourse(null);
    setFormData({
      slug: '',
      title: '',
      description: '',
      thumbnail_url: '',
      teacher_name: '',
      level: 'beginner',
      category: '',
      price_vnd: 0,
      original_price_vnd: 0,
      discount_percent: 0,
      total_lessons: 0,
      duration_hours: 0,
      has_certificate: true,
      is_published: false,
      is_featured: false,
    });
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setModalMode('edit');
    setCurrentTab('basic');
    setEditingCourse(course);
    setFormData({
      slug: course.slug,
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      teacher_name: course.teacher_name || '',
      level: course.level,
      category: course.category || '',
      price_vnd: course.price_vnd,
      original_price_vnd: course.original_price_vnd || 0,
      discount_percent: course.discount_percent,
      total_lessons: course.total_lessons,
      duration_hours: course.duration_hours || 0,
      has_certificate: course.has_certificate,
      is_published: course.is_published,
      is_featured: course.is_featured,
    });
    setShowModal(true);
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (modalMode === 'create') {
        await createCourse(formData);
        toast.success('Tạo khóa học thành công!');
      } else if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        toast.success('Cập nhật khóa học thành công!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    
    try {
      await deleteCourse(id);
      toast.success('Xóa khóa học thành công!');
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
          <p className="text-muted-foreground">Quản lý tất cả khóa học trong hệ thống</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm khóa học
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full max-w-md border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">Khóa học</th>
              <th className="text-left p-4">Giá</th>
              <th className="text-left p-4">Học viên</th>
              <th className="text-left p-4">Trạng thái</th>
              <th className="text-left p-4">Ngày tạo</th>
              <th className="text-right p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id} className="border-t hover:bg-muted/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">No img</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {course.price_vnd === 0 ? (
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  ) : (
                    <span>{course.price_vnd.toLocaleString()}đ</span>
                  )}
                </td>
                <td className="p-4">{course.students_enrolled}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.is_published ? 'Đã publish' : 'Nháp'}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(course.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(course)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Thêm khóa học mới' : 'Chỉnh sửa khóa học'}
              </h2>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentTab('basic')}
                  className={`px-4 py-2 rounded ${currentTab === 'basic' ? 'bg-primary text-white' : 'bg-muted'}`}
                >
                  Thông tin cơ bản
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('details')}
                  className={`px-4 py-2 rounded ${currentTab === 'details' ? 'bg-primary text-white' : 'bg-muted'}`}
                >
                  Chi tiết
                </button>
              </div>

              {currentTab === 'basic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên khóa học *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        handleInputChange('title', e.target.value);
                        if (modalMode === 'create') {
                          handleInputChange('slug', generateSlug(e.target.value));
                        }
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">URL Thumbnail</label>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Giá (VND) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price_vnd}
                        onChange={(e) => handleInputChange('price_vnd', parseInt(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Giá gốc (VND)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.original_price_vnd}
                        onChange={(e) => handleInputChange('original_price_vnd', parseInt(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </>
              )}

              {currentTab === 'details' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Trình độ</label>
                      <select
                        value={formData.level}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="beginner">Cơ bản</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Danh mục</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Số bài học</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.total_lessons}
                        onChange={(e) => handleInputChange('total_lessons', parseInt(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Thời lượng (giờ)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.duration_hours}
                        onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.has_certificate}
                        onChange={(e) => handleInputChange('has_certificate', e.target.checked)}
                      />
                      <span className="text-sm font-medium">Có chứng chỉ</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => handleInputChange('is_published', e.target.checked)}
                      />
                      <span className="text-sm font-medium">Đã publish</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      />
                      <span className="text-sm font-medium">Nổi bật</span>
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo khóa học' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
