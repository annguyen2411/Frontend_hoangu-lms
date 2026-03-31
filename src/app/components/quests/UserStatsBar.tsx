import { TrendingUp, Award, Coins } from 'lucide-react';

interface UserStatsBarProps {
  stats: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    coins: number;
    badges: string[];
    completedQuests: number;
  };
}

export function UserStatsBar({ stats }: UserStatsBarProps) {
  if (!stats) return null;
  const xpToNextLevel = stats.xpToNextLevel || stats.xp_to_next_level || 100;
  const xpPercentage = (stats.xp / xpToNextLevel) * 100;

  return (
    <div className="bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl shadow-lg text-white p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level & XP */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border-2 border-white/30">
              <span className="text-3xl font-bold">{stats.level}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg">Cấp độ {stats.level}</h3>
                <span className="text-sm text-white">
                  {stats.xp}/{xpToNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-gray-900/50 rounded-full h-3 overflow-hidden border border-white/20">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <p className="text-xs text-white/90 mt-1">
                Còn {xpToNextLevel - stats.xp} XP để lên cấp {stats.level + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
            <Coins className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
            <div className="font-bold text-lg">{stats.coins}</div>
            <div className="text-xs text-white">Xu</div>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
            <Award className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
            <div className="font-bold text-lg">0</div>
            <div className="text-xs text-white">Huy hiệu</div>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-300" />
            <div className="font-bold text-lg">{stats.completed_quests || 0}</div>
            <div className="text-xs text-white">Nhiệm vụ</div>
          </div>
        </div>
      </div>
    </div>
  );
}