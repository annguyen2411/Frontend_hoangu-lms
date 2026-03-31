import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, BookOpen, Mail, Phone, DollarSign, Check, X } from 'lucide-react';
import { api } from '../../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Instructor {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  specialty: string | null;
  hourly_rate: number | null;
  is_available: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  students_enrolled: number;
}

export function AdminInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [instructorsRes, coursesRes] = await Promise.all([
        api.instructors.getAll(),
        api.courses.getAll({ limit: 100 })
      ]);
      if (instructorsRes.success && instructorsRes.data) {
        setInstructors(instructorsRes.data);
      }
      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourse = async (courseId: string, teacherId: string) => {
    try {
      await api.instructors.assignCourse(courseId, teacherId);
      fetchData();
    } catch (err) {
      console.error('Failed to assign course:', err);
    }
  };

  const filteredInstructors = instructors.filter(i => 
    i.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInstructorCourses = (instructorId: string) => {
    return courses.filter(c => {
      // Check if course has this instructor - would need to check API
      return false;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Giảng viên</h1>
            <p className="text-gray-600">Phân công giảng viên cho khóa học</p>
          </div>
        </div>
        <Button>
          <Plus className="h-5 w-5 mr-2" />
          Thêm giảng viên
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm giảng viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstructors.map((instructor) => (
          <Card key={instructor.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                {instructor.full_name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{instructor.full_name}</h3>
                <p className="text-sm text-gray-500">{instructor.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    instructor.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {instructor.is_available ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </span>
                </div>
              </div>
            </div>

            {instructor.specialty && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Chuyên môn:</span> {instructor.specialty}
                </p>
              </div>
            )}

            {instructor.bio && (
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{instructor.bio}</p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Sửa
              </Button>
            </div>

            {/* Course Assignment */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Phân công khóa học:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {courses.filter(c => !c.title.includes('HSK')).slice(0, 5).map(course => (
                  <div key={course.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1">{course.title}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAssignCourse(course.id, instructor.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có giảng viên nào</p>
        </div>
      )}
    </div>
  );
}
