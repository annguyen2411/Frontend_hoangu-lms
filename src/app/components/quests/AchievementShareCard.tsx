import { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Facebook, Twitter, Link2, Check, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  date?: string;
}

interface AchievementShareCardProps {
  achievement: Achievement;
  userLevel: number;
  userName?: string;
}

export function AchievementShareCard({
  achievement,
  userLevel,
  userName = 'Học viên HoaNgữ',
}: AchievementShareCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 Tôi vừa đạt thành tích "${achievement.name}" trên HoaNgữ! 
📚 Level ${userLevel} - Học tiếng Hoa chuẩn Bắc Kinh
🚀 Chỉ 90 ngày nói thành thạo!`;

  const shareUrl = `https://hoanguNgữ.com/achievements/${achievement.id}`;

  const handleShare = async (platform?: string) => {
    if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        '_blank',
        'width=600,height=400'
      );
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'width=600,height=400'
      );
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    } else {
      // Native Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Thành tích HoaNgữ - ${achievement.name}`,
            text: shareText,
            url: shareUrl,
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        setShowOptions(true);
      }
    }
  };

  const handleDownload = () => {
    // Create a canvas to generate shareable image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White card
    ctx.fillStyle = 'white';
    ctx.roundRect(50, 50, canvas.width - 100, canvas.height - 100, 20);
    ctx.fill();

    // Achievement icon
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(achievement.icon, canvas.width / 2, 220);

    // Achievement name
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(achievement.name, canvas.width / 2, 320);

    // Description
    ctx.fillStyle = '#6b7280';
    ctx.font = '32px Arial';
    ctx.fillText(achievement.description, canvas.width / 2, 380);

    // Level badge
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`Level ${userLevel} | ${userName}`, canvas.width / 2, 450);

    // Logo/Brand
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('HoaNgữ', canvas.width / 2, 530);

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `achievement-${achievement.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare()}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Chia sẻ
      </Button>

      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 z-50"
        >
          <Card className="p-2 shadow-lg min-w-[200px]">
            <div className="space-y-1">
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <Twitter className="h-4 w-4 text-sky-500" />
                <span className="text-sm">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                <span className="text-sm">{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Tải ảnh</span>
              </button>
            </div>
          </Card>

          {/* Backdrop to close */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setShowOptions(false)}
          />
        </motion.div>
      )}
    </div>
  );
}
