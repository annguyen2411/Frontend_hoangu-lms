import { X, CheckCircle2, Clock, Sparkles, Trophy, Target, TrendingUp } from 'lucide-react';
import type { Quest } from '../../data/questsData';
import { useState } from 'react';
import { RewardAnimation } from './RewardAnimation';

interface QuestModalProps {
  quest: Quest;
  onClose: () => void;
  onClaim?: () => void;
}

export function QuestModal({ quest, onClose, onClaim }: QuestModalProps) {
  const [showReward, setShowReward] = useState(false);
  const progressPercentage = (quest.progress / quest.target) * 100;
  const canClaim = quest.isCompleted && !quest.isCompleted;

  const typeColors = {
    daily: 'from-blue-500 to-cyan-500',
    weekly: 'from-purple-500 to-pink-500',
    special: 'from-orange-500 to-red-500',
    achievement: 'from-yellow-500 to-amber-600'
  };

  const handleClaim = () => {
    setShowReward(true);
    setTimeout(() => {
      if (onClaim) onClaim();
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 100);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${typeColors[quest.type]} p-6 relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-start gap-4 text-white">
              <div className="w-16 h-16 bg-gray-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl border border-white/30">
                {quest.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{quest.title}</h2>
                <p className="text-white text-sm">{quest.description}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">
                  Tiến độ: {quest.progress}/{quest.target}
                </span>
                <span className="text-white font-bold text-lg">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-900/50 rounded-full h-4 overflow-hidden border border-white/20">
                <div
                  className="bg-white h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quest Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-semibold">Mục tiêu</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {quest.target}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">Đã hoàn thành</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {quest.progress}
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Phần thưởng
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">
                      💰
                    </div>
                    <span className="font-semibold text-gray-900">Xu</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">
                    +{quest.rewards.coins}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Kinh nghiệm</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    +{quest.rewards.xp} XP
                  </span>
                </div>

                {quest.rewards.badge && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-xl">
                        🏆
                      </div>
                      <span className="font-semibold text-gray-900">Huy hiệu đặc biệt</span>
                    </div>
                    <span className="text-sm font-bold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                      Độc quyền
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timer */}
            {quest.expiresAt && !quest.isCompleted && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Thời gian còn lại</div>
                    <div className="text-sm text-gray-600">
                      Kết thúc: {new Date(quest.expiresAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {quest.isCompleted ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <span className="text-green-700 font-bold text-lg">
                  Đã hoàn thành!
                </span>
              </div>
            ) : (
              <button
                onClick={handleClaim}
                disabled={!canClaim}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  canClaim
                    ? `bg-gradient-to-r ${typeColors[quest.type]} hover:opacity-90 hover:scale-105`
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {canClaim ? 'Nhận thưởng ngay!' : `Còn ${quest.target - quest.progress} nữa`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reward Animation */}
      {showReward && (
        <RewardAnimation
          coins={quest.rewards.coins}
          xp={quest.rewards.xp}
          badge={quest.rewards.badge}
        />
      )}
    </>
  );
}