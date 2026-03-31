import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface RewardAnimationProps {
  coins: number;
  xp: number;
  badge?: string;
}

export function RewardAnimation({ coins, xp, badge }: RewardAnimationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Confetti Effect */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed', '#ec4899'][
                  Math.floor(Math.random() * 5)
                ]
              }}
            />
          </div>
        ))}
      </div>

      {/* Reward Cards */}
      <div className="relative animate-scale-bounce">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-block relative">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse-scale">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping opacity-75" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            🎉 Hoàn thành!
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Bạn đã nhận được phần thưởng
          </p>

          {/* Rewards List */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  <span className="font-bold text-gray-900">Xu</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600 animate-count-up">
                  +{coins}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-7 w-7 text-purple-600" />
                  <span className="font-bold text-gray-900">Kinh nghiệm</span>
                </div>
                <span className="text-2xl font-bold text-purple-600 animate-count-up">
                  +{xp} XP
                </span>
              </div>
            </div>

            {badge && (
              <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-4 border-2 border-pink-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <span className="font-bold text-gray-900">Huy hiệu mới</span>
                  </div>
                  <span className="text-sm font-bold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                    Mở khóa!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scale-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes count-up {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-scale-bounce {
          animation: scale-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-count-up {
          animation: count-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
