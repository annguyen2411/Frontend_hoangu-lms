import { Share2, Facebook, Twitter, Link2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  achievement?: {
    title: string;
    description: string;
    icon: string;
  };
  userStats?: {
    level: number;
    xp: number;
    badges: number;
  };
}

export function SocialShare({ achievement, userStats }: SocialShareProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.origin;
  const shareText = achievement ? `🎉 Tôi vừa đạt được "${achievement.title}" trên HoaNgữ! 
  
  ${achievement.icon} ${achievement.description}
  
  📊 Cấp độ: ${userStats?.level || 1}
  ⚡ Kinh nghiệm: ${userStats?.xp?.toLocaleString() || 0} XP
  🏆 Huy hiệu: ${userStats?.badges || 0}
  
  Học tiếng Hoa cùng tôi tại HoaNgữ!` : `Học tiếng Hoa cùng tôi tại HoaNgữ!`;

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'zalo':
        // Zalo share URL (mobile app)
        url = `https://page.zalo.me/share?url=${encodedUrl}&title=${encodedText}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md"
      >
        <Share2 className="h-5 w-5" />
        Chia sẻ thành tích
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200 animate-scale-in">
            {/* Preview Card */}
            <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-4 text-white">
              <div className="text-4xl mb-2 text-center">{achievement?.icon || '🏆'}</div>
              <h4 className="font-bold text-center mb-1">{achievement?.title || 'Thành tựu'}</h4>
              <p className="text-xs text-white/90 text-center">
                Cấp {userStats?.level || 1} • {userStats?.badges || 0} huy hiệu
              </p>
            </div>

            {/* Share Options */}
            <div className="p-2">
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Facebook</div>
                  <div className="text-xs text-gray-600">Chia sẻ lên Facebook</div>
                </div>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                  <Twitter className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Twitter</div>
                  <div className="text-xs text-gray-600">Đăng lên Twitter</div>
                </div>
              </button>

              <button
                onClick={() => handleShare('zalo')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Zalo</div>
                  <div className="text-xs text-gray-600">Chia sẻ qua Zalo</div>
                </div>
              </button>

              <div className="border-t border-gray-200 my-2" />

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {copied ? '✓ Đã sao chép!' : 'Sao chép link'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {copied ? 'Link đã được sao chép' : 'Sao chép vào clipboard'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
