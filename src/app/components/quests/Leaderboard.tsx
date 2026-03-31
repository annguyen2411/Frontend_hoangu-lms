import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal } from 'lucide-react';
import type { LeaderboardUser } from '../../data/leaderboardData';

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserId?: string;
}

export function Leaderboard({ users, currentUserId = 'current' }: LeaderboardProps) {
  const topThree = users.slice(0, 3);
  const others = users.slice(3);
  const currentUser = users.find(u => u.id === currentUserId);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-gray-200 to-gray-300';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          Top 3 cao thủ
        </h3>

        <div className="flex items-end justify-center gap-4 mb-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex-1 text-center">
              <div className="relative inline-block mb-3">
                <img
                  src={topThree[1].avatar}
                  alt={topThree[1].name}
                  className="w-16 h-16 rounded-full border-4 border-gray-400"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-300 to-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <div className="font-bold text-gray-900 text-sm mb-1 truncate">
                {topThree[1].name}
              </div>
              <div className="text-xs text-gray-600">
                {topThree[1].xp.toLocaleString()} XP
              </div>
              <div className="mt-2 bg-gray-200 rounded-lg h-20 flex items-end justify-center pb-2">
                <Medal className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex-1 text-center">
              <div className="relative inline-block mb-3">
                <img
                  src={topThree[0].avatar}
                  alt={topThree[0].name}
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                  1
                </div>
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
                </div>
              </div>
              <div className="font-bold text-gray-900 mb-1 truncate">
                {topThree[0].name}
              </div>
              <div className="text-sm text-yellow-600 font-semibold">
                {topThree[0].xp.toLocaleString()} XP
              </div>
              <div className="mt-2 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-lg h-28 flex items-end justify-center pb-2">
                <Trophy className="h-10 w-10 text-yellow-700" />
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex-1 text-center">
              <div className="relative inline-block mb-3">
                <img
                  src={topThree[2].avatar}
                  alt={topThree[2].name}
                  className="w-16 h-16 rounded-full border-4 border-orange-400"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <div className="font-bold text-gray-900 text-sm mb-1 truncate">
                {topThree[2].name}
              </div>
              <div className="text-xs text-gray-600">
                {topThree[2].xp.toLocaleString()} XP
              </div>
              <div className="mt-2 bg-orange-200 rounded-lg h-16 flex items-end justify-center pb-2">
                <Medal className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Other Rankings */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Bảng xếp hạng</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {others.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            return (
              <div
                key={user.id}
                className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${getRankColor(
                      user.rank
                    )} text-white font-bold`}
                  >
                    {user.rank}
                  </div>
                </div>

                {/* Avatar */}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate flex items-center gap-2">
                    {user.name}
                    {isCurrentUser && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Bạn
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cấp {user.level} • {user.xp.toLocaleString()} XP
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-yellow-600">{user.coins}</div>
                    <div className="text-xs text-gray-500">Xu</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-orange-600">{user.streak}</div>
                    <div className="text-xs text-gray-500">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{user.badges}</div>
                    <div className="text-xs text-gray-500">Huy hiệu</div>
                  </div>
                </div>

                {/* Change */}
                <div className="flex items-center gap-1">
                  {getChangeIcon(user.change)}
                  {user.change !== 0 && (
                    <span
                      className={`text-sm font-semibold ${
                        user.change > 0
                          ? 'text-green-600'
                          : user.change < 0
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {Math.abs(user.change)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current User Highlight (if not in top 10) */}
      {currentUser && currentUser.rank > 10 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-xl border-2 border-white/30">
              {currentUser.rank}
            </div>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full border-4 border-white/50"
            />
            <div className="flex-1">
              <div className="font-bold text-xl mb-1">Vị trí của bạn</div>
              <div className="text-white">
                Cấp {currentUser.level} • {currentUser.xp.toLocaleString()} XP
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                {getChangeIcon(currentUser.change)}
                <span className="font-bold">
                  {currentUser.change > 0 ? '+' : ''}
                  {currentUser.change}
                </span>
              </div>
              <div className="text-sm text-white/80">Tuần này</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}