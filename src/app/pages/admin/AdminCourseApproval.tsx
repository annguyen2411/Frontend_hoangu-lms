import { useState, useEffect } from 'react';
import { BookOpen, Check, X, Eye, Clock, User } from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';

export function AdminCourseApproval() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadPendingCourses();
  }, []);

  const loadPendingCourses = async () => {
    try {
      const res = await api.admin.getPendingCourses();
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await api.admin.approveCourse(id);
      if (res.success) {
        toast.success('Duyệt khóa học thành công!');
        setCourses(courses.filter(c => c.id !== id));
        setSelectedCourse(null);
      }
    } catch (error) {
      toast.error('Lỗi khi duyệt khóa học');
    }
  };

  const handleReject = async () => {
    if (!selectedCourse || !rejectReason.trim()) return;
    try {
      const res = await api.admin.rejectCourse(selectedCourse.id, rejectReason);
      if (res.success) {
        toast.success('Từ chối khóa học thành công!');
        setCourses(courses.filter(c => c.id !== selectedCourse.id));
        setSelectedCourse(null);
        setShowRejectModal(false);
        setRejectReason('');
      }
    } catch (error) {
      toast.error('Lỗi khi từ chối khóa học');
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Duyệt khóa học</h1>
        <p className="text-gray-600 mt-1">Danh sách khóa học chờ duyệt ({courses.length})</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có khóa học chờ duyệt</h3>
          <p className="text-gray-500">Tất cả khóa học đã được xử lý</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="flex">
                <div className="w-48 h-32 bg-gray-200 flex-shrink-0">
                  {course.thumbnail_url && (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 p-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <User className="h-4 w-4" />
                    <span>{course.instructor_name || course.teacher_name || 'Chưa có giảng viên'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(course.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => setSelectedCourse(course)}>
                      <Eye className="h-4 w-4 mr-1" /> Xem chi tiết
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(course.id)}>
                      <Check className="h-4 w-4 mr-1" /> Duyệt
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { setSelectedCourse(course); setShowRejectModal(true); }}>
                      <X className="h-4 w-4 mr-1" /> Từ chối
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Từ chối khóa học</h2>
              <p className="text-gray-600 text-sm mt-1">{selectedCourse.title}</p>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Nhập lý do từ chối..."
              />
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>Hủy</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleReject} disabled={!rejectReason.trim()}>
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
