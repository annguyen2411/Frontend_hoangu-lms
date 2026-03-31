import { useState, useEffect } from 'react';
import { Award, Plus, Search, Download, Eye, User, BookOpen, Calendar } from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export function AdminCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    loadCertificates();
    loadUsersAndCourses();
  }, []);

  const loadCertificates = async () => {
    try {
      const res = await api.admin.getCertificates({ search: searchTerm });
      if (res.success) {
        setCertificates(res.data);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersAndCourses = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.admin.getUsers({ limit: 1000 }),
        api.courses.getAll(),
      ]);
      if (usersRes.success) setUsers(usersRes.data);
      if (coursesRes.success) setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCertificates();
  };

  const handleCreateCertificate = async () => {
    if (!selectedUser || !selectedCourse) {
      toast.error('Vui lòng chọn học viên và khóa học');
      return;
    }
    try {
      const res = await api.admin.createCertificate(selectedUser, selectedCourse);
      if (res.success) {
        toast.success('Cấp chứng chỉ thành công!');
        setShowModal(false);
        setSelectedUser('');
        setSelectedCourse('');
        loadCertificates();
      } else {
        toast.error(res.error || 'Lỗi khi cấp chứng chỉ');
      }
    } catch (error) {
      toast.error('Lỗi khi cấp chứng chỉ');
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý chứng chỉ</h1>
          <p className="text-gray-600 mt-1">Danh sách chứng chỉ đã cấp ({certificates.length})</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-5 w-5 mr-2" /> Cấp chứng chỉ
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên học viên hoặc khóa học..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </div>
      </form>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có chứng chỉ nào</h3>
          <p className="text-gray-500">Cấp chứng chỉ cho học viên hoàn thành khóa học</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã chứng chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Học viên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khóa học</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày cấp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {cert.certificate_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{cert.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>{cert.course_title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Cấp chứng chỉ</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Học viên</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Chọn học viên</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button className="flex-1" onClick={handleCreateCertificate}>Cấp chứng chỉ</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
