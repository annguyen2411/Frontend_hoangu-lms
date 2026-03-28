import { useState, useEffect } from 'react';
import { Download, Trash2, HardDrive, Wifi, WifiOff, BookOpen } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cacheManager } from '../utils/cacheManager';
import { useCourses } from '../hooks/useData';
import { toast } from 'sonner';

export function OfflineCoursesManager() {
  const { courses } = useCourses({ publishedOnly: true });
  const [offlineCourses, setOfflineCourses] = useState<string[]>([]);
  const [downloadingCourses, setDownloadingCourses] = useState<Set<string>>(new Set());
  const [cacheSize, setCacheSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadOfflineCourses();
    loadCacheSize();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineCourses = async () => {
    const courses = await cacheManager.getOfflineCourses();
    setOfflineCourses(courses);
  };

  const loadCacheSize = async () => {
    const size = await cacheManager.getTotalCacheSize();
    setCacheSize(size);
  };

  const handleDownloadCourse = async (courseId: string) => {
    if (!isOnline) {
      toast.error('Cần kết nối internet để tải khóa học');
      return;
    }

    setDownloadingCourses(prev => new Set(prev).add(courseId));
    toast.info('Đang tải khóa học...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await cacheManager.saveOfflineCourse(courseId);
      setOfflineCourses(prev => [...prev, courseId]);
      toast.success('Tải khóa học thành công!');
      loadCacheSize();
    } catch (error) {
      toast.error('Không thể tải khóa học');
    } finally {
      setDownloadingCourses(prev => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    try {
      await cacheManager.removeOfflineCourse(courseId);
      setOfflineCourses(prev => prev.filter(id => id !== courseId));
      toast.success('Đã xóa khóa học ngoại tuyến');
      loadCacheSize();
    } catch (error) {
      toast.error('Không thể xóa khóa học');
    }
  };

  const formatCacheSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            {isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
          </div>
          <div>
            <p className="font-medium">{isOnline ? 'Đang kết nối' : 'Ngoại tuyến'}</p>
            <p className="text-sm text-muted-foreground">
              {isOnline ? 'Có thể tải khóa học' : 'Đang sử dụng dữ liệu ngoại tuyến'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatCacheSize(cacheSize)}</p>
          <p className="text-sm text-muted-foreground">Dung lượng đã sử dụng</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Khóa học có sẵn ngoại tuyến</h3>
        <div className="grid gap-4">
          {courses.map(course => {
            const isDownloaded = offlineCourses.includes(course.id);
            const isDownloading = downloadingCourses.has(course.id);

            return (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">{course.title}</p>
                    <p className="text-sm text-muted-foreground">{course.total_lessons} bài học</p>
                  </div>
                </div>
                <div>
                  {isDownloaded ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">Đã tải</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCourse(course.id)}
                      disabled={!isOnline || isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <Download className="h-4 w-4 mr-2 animate-pulse" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Tải xuống
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
