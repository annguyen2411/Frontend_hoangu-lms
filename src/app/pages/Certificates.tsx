import { useState, useEffect } from 'react';
import { Award, Download, Share2, Eye, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { certificateGenerator, Certificate } from '../utils/certificateGenerator';
import { dataExport } from '../utils/dataExport';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { LoginPrompt, LoadingSpinner } from '../components/LoginPrompt';

export function Certificates() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    const existing = certificateGenerator.getAll();
    
    // Create demo certificates if none exist
    if (existing.length === 0 && user) {
      certificateGenerator.generate({
        courseName: 'Tiếng Hoa Sơ Cấp - HSK 1',
        studentName: user.name || 'Học viên',
        completionDate: new Date('2024-01-15'),
        score: 95,
        level: 'HSK 1',
        instructorName: 'Giáo viên Lý Minh',
        skills: ['Nghe', 'Nói', 'Đọc', 'Viết cơ bản', '150 từ vựng'],
        duration: '3 tháng',
      });
    }
    
    setCertificates(certificateGenerator.getAll());
    setLoading(false);
  }, [user]);

  if (loading || isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  const loadCertificates = () => {
    setCertificates(certificateGenerator.getAll());
  };

  const handleDownload = (cert: Certificate) => {
    certificateGenerator.downloadHTML(cert);
    toast.success('Đã tải xuống chứng chỉ!');
  };

  const handleShare = (cert: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `Chứng chỉ ${cert.courseName}`,
        text: `Tôi đã hoàn thành khóa học ${cert.courseName} tại HoaNgữ!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link!');
    }
  };

  const handleExportAll = () => {
    const data = dataExport.exportCertificates();
    dataExport.downloadJSON(data, `HoaNgu-Certificates-${new Date().toISOString().split('T')[0]}`);
    toast.success('Đã xuất dữ liệu chứng chỉ!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-3 rounded-xl">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Chứng chỉ của tôi</h1>
              <p className="text-muted-foreground mt-1">
                Xem và tải xuống các chứng chỉ bạn đã đạt được
              </p>
            </div>
          </div>

          {certificates.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleExportAll}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất tất cả
              </Button>
            </div>
          )}
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Chưa có chứng chỉ nào
            </h3>
            <p className="text-muted-foreground mb-6">
              Hoàn thành khóa học để nhận chứng chỉ của bạn!
            </p>
            <Button
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
            >
              Khám phá khóa học
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Certificate Preview */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-6 flex flex-col items-center justify-center text-white">
                    <Award className="h-16 w-16 mb-3 opacity-90" />
                    <h3 className="font-bold text-center text-lg mb-1">
                      {cert.courseName}
                    </h3>
                    <p className="text-sm text-white">
                      {new Date(cert.completionDate).toLocaleDateString('vi-VN')}
                    </p>
                    <div className="absolute top-3 right-3 bg-gray-900/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold border border-white/30">
                      {cert.level}
                    </div>
                  </div>

                  {/* Certificate Info */}
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Điểm số:</span>
                        <span className="font-bold text-foreground">{cert.score}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Số chứng chỉ:</span>
                        <span className="font-mono text-xs text-foreground">
                          {cert.certificateNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-semibold">Đã xác thực</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Kỹ năng đạt được:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cert.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-accent text-foreground text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {cert.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-accent text-muted-foreground text-xs rounded-full">
                            +{cert.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => setSelectedCert(cert)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDownload(cert)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleShare(cert)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Certificate Preview Modal */}
        {selectedCert && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Xem trước chứng chỉ
                  </h2>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                {/* Certificate Details */}
                <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-4 border-[var(--theme-primary)]">
                  <div className="text-center">
                    <Award className="h-24 w-24 mx-auto mb-4 text-[var(--theme-primary)]" />
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                      Chứng chỉ hoàn thành
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      Chứng nhận rằng
                    </p>
                    <h2 className="text-3xl font-bold text-[var(--theme-primary)] mb-4">
                      {selectedCert.studentName}
                    </h2>
                    <p className="text-muted-foreground mb-2">
                      đã hoàn thành xuất sắc khóa học
                    </p>
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      {selectedCert.courseName}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Cấp độ</p>
                        <p className="font-bold text-foreground">{selectedCert.level}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Điểm số</p>
                        <p className="font-bold text-foreground">{selectedCert.score}/100</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Thời lượng</p>
                        <p className="font-bold text-foreground">{selectedCert.duration}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Hoàn thành</p>
                        <p className="font-bold text-foreground">
                          {new Date(selectedCert.completionDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      Kỹ năng đã đạt được:
                    </p>
                    <p className="font-semibold text-foreground mb-6">
                      {selectedCert.skills.join(' • ')}
                    </p>

                    <div className="pt-6 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Số chứng chỉ: {selectedCert.certificateNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cấp ngày: {new Date(selectedCert.issueDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleDownload(selectedCert)}
                    className="flex-1 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                  <Button
                    onClick={() => handleShare(selectedCert)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}