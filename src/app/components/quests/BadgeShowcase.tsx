import { Lock } from 'lucide-react';
import type { Badge } from '../../data/questsData';

interface BadgeShowcaseProps {
  badges: Badge[];
  userBadges: string[];
}

export function BadgeShowcase({ badges, userBadges }: BadgeShowcaseProps) {
  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-500 to-pink-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityLabels = {
    common: 'Phổ thông',
    rare: 'Hiếm',
    epic: 'Sử thi',
    legendary: 'Huyền thoại'
  };

  const rarityTextColors = {
    common: 'text-gray-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-orange-600'
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {badges.map((badge) => {
        const isUnlocked = userBadges.includes(badge.id);
        
        return (
          <div
            key={badge.id}
            className={`relative bg-white rounded-xl shadow-md p-4 transition-all hover:shadow-lg ${
              isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-60'
            }`}
          >
            {/* Badge Icon */}
            <div
              className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${rarityColors[badge.rarity]} flex items-center justify-center text-4xl shadow-lg relative`}
            >
              {isUnlocked ? (
                badge.icon
              ) : (
                <Lock className="h-10 w-10 text-white" />
              )}
            </div>

            {/* Badge Info */}
            <div className="text-center">
              <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {badge.name}
              </h4>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2 h-8">
                {badge.description}
              </p>
              <span className={`text-xs font-semibold ${rarityTextColors[badge.rarity]}`}>
                {rarityLabels[badge.rarity]}
              </span>
            </div>

            {/* Unlocked Date */}
            {isUnlocked && badge.unlockedAt && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Mở khóa: {new Date(badge.unlockedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}

            {/* Locked Overlay */}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/5 rounded-xl pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}
