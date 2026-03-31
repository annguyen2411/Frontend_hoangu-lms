import { CheckCircle2, Clock, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { Quest } from '../../data/questsData';
import { Button } from '../ui/Button';

interface QuestCardProps {
  quest: Quest;
  onComplete?: (questId: string) => void;
}

export function QuestCard({ quest, onComplete }: QuestCardProps) {
  const progressPercentage = (quest.progress / quest.target) * 100;
  const isExpiringSoon = quest.expiresAt && new Date(quest.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  const typeColors = {
    daily: 'from-blue-500 to-cyan-500',
    weekly: 'from-purple-500 to-pink-500',
    special: 'from-orange-500 to-red-500',
    achievement: 'from-yellow-500 to-amber-600'
  };

  const typeLabels = {
    daily: 'Hàng ngày',
    weekly: 'Hàng tuần',
    special: 'Đặc biệt',
    achievement: 'Thành tích'
  };

  const canComplete = quest.progress >= quest.target && !quest.isCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-white rounded-xl shadow-md p-5 transition-all touch-manipulation active:scale-95 ${
        quest.isCompleted ? 'border-2 border-green-500' : 'border border-gray-200'
      } ${canComplete ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={canComplete ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${typeColors[quest.type]} rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-md`}
          >
            {quest.icon}
          </motion.div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-sm md:text-base">{quest.title}</h3>
              {quest.isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${typeColors[quest.type]} text-white`}>
              {typeLabels[quest.type]}
            </span>
          </div>
        </div>

        {quest.rewards.badge && (
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="bg-yellow-50 p-2 rounded-lg" title="Có huy hiệu"
          >
            <Trophy className="h-5 w-5 text-yellow-600" />
          </motion.div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{quest.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700 font-semibold">
            Tiến độ: {quest.progress}/{quest.target}
          </span>
          <span className="font-bold text-primary">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-3 rounded-full ${
              quest.isCompleted
                ? 'bg-green-500'
                : `bg-gradient-to-r ${typeColors[quest.type]}`
            }`}
          />
        </div>
      </div>

      {/* Rewards & Expiry */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
            <span className="text-lg">💰</span>
            <span className="font-bold text-yellow-700 text-sm">
              +{quest.rewards.coins}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-bold text-purple-700 text-sm">
              +{quest.rewards.xp} XP
            </span>
          </div>
        </div>

        {quest.expiresAt && !quest.isCompleted && (
          <div className={`flex items-center gap-1 ${isExpiringSoon ? 'text-red-600' : 'text-gray-500'}`}>
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold">
              {isExpiringSoon ? 'Sắp hết hạn!' : getTimeRemaining(quest.expiresAt)}
            </span>
          </div>
        )}
      </div>

      {/* Action Button or Completed State */}
      {quest.isCompleted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <span className="text-green-700 font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Đã hoàn thành!
          </span>
        </div>
      ) : canComplete ? (
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Button
            onClick={() => onComplete?.(quest.id)}
            className="w-full touch-manipulation active:scale-95"
            size="lg"
          >
            🎉 Nhận thưởng ngay!
          </Button>
        </motion.div>
      ) : (
        <Button
          variant="outline"
          className="w-full touch-manipulation"
          disabled
        >
          Tiếp tục phấn đấu! 💪
        </Button>
      )}
    </motion.div>
  );
}

function getTimeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 24) {
    return `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} ngày`;
}