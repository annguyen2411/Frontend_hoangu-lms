import { useState, useEffect } from 'react';
import { Clock, BookOpen, CheckCircle, Play, Calendar, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Link } from 'react-router';
import { api } from '../../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface HistoryItem {
  id: string;
  lesson_id: string;
  lesson_title: string;
  course_title: string;
  course_slug: string;
  action: string;
  duration_seconds: number;
  created_at: string;
}

export function LearningHistory() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, page]);

  const loadHistory = async () => {
    try {
      const res = await api.student.getHistory({ page, limit: 20 });
      if (res.success) {
        setHistory(res.data.items);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'started':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'reviewed':
        return <BookOpen className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'completed':
        return 'Hoàn thành';
      case 'started':
        return 'Bắt đầu học';
      case 'reviewed':
        return 'Ôn tập';
      case 'practiced':
        return 'Luyện tập';
      default:
        return action;
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập để xem lịch sử</h2>
          <p className="text-gray-600">Đăng nhập để xem lịch sử học tập của bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử học tập</h1>
          </div>
          <p className="text-gray-600">Xem lại các bài học đã học</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : history.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {history.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getActionIcon(item.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{item.lesson_title || 'Bài học'}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.action === 'completed' ? 'bg-green-100 text-green-700' :
                          item.action === 'started' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getActionText(item.action)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.course_title || 'Khóa học'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(item.duration_seconds)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(item.created_at).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    {item.course_slug && (
                      <Link to={`/courses/${item.course_slug}`}>
                        <Button variant="outline" size="sm">
                          Xem lại
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có lịch sử</h3>
            <p className="text-gray-500 mb-4">Bắt đầu học để xem lịch sử tại đây</p>
            <Link to="/courses">
              <Button>Khám phá khóa học</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
