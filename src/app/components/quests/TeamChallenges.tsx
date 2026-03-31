import { Users, Clock, Trophy, TrendingUp } from 'lucide-react';
import type { TeamChallenge } from '../../data/leaderboardData';

interface TeamChallengesProps {
  challenges: TeamChallenge[];
}

export function TeamChallenges({ challenges }: TeamChallengesProps) {
  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ngày`;
    return `${hours} giờ`;
  };

  const getTypeLabel = (type: TeamChallenge['type']) => {
    const labels = {
      vocabulary: '📚 Từ vựng',
      lessons: '📖 Bài học',
      pronunciation: '🎤 Phát âm',
      study_time: '⏰ Thời gian học'
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {challenges.map((challenge) => {
        const teamAPercentage = (challenge.teamA.progress / challenge.target) * 100;
        const teamBPercentage = (challenge.teamB.progress / challenge.target) * 100;
        const isTeamALeading = challenge.teamA.progress > challenge.teamB.progress;

        return (
          <div
            key={challenge.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold mb-2">
                    {getTypeLabel(challenge.type)}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{challenge.title}</h3>
                  <p className="text-white">{challenge.description}</p>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/30">
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs font-semibold whitespace-nowrap">
                    {getTimeRemaining(challenge.endsAt)}
                  </div>
                </div>
              </div>

              {/* Rewards Preview */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-white/20">
                  <span>💰</span>
                  <span className="font-semibold">+{challenge.rewards.coins}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-white/20">
                  <Trophy className="h-4 w-4" />
                  <span className="font-semibold">+{challenge.rewards.xp} XP</span>
                </div>
                {challenge.rewards.badge && (
                  <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-white/20">
                    <span>🏆</span>
                    <span className="font-semibold text-xs">Huy hiệu</span>
                  </div>
                )}
              </div>
            </div>

            {/* Teams Battle */}
            <div className="p-6">
              {/* Team A */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                      {challenge.teamA.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {challenge.teamA.name}
                        {isTeamALeading && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                            Dẫn đầu
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {challenge.teamA.members} thành viên
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {challenge.teamA.progress.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(teamAPercentage)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(teamAPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex items-center justify-center my-4">
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                <div className="px-4">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-4 py-2 rounded-full text-sm shadow-md">
                    VS
                  </div>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              </div>

              {/* Team B */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-2xl">
                      {challenge.teamB.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {challenge.teamB.name}
                        {!isTeamALeading && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                            Dẫn đầu
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {challenge.teamB.members} thành viên
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {challenge.teamB.progress.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(teamBPercentage)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(teamBPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Target */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Mục tiêu</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {challenge.target.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                Tham gia thử thách
              </button>
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {challenges.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Chưa có thử thách nhóm nào
          </h3>
          <p className="text-gray-600">
            Hãy quay lại sau để tham gia các thử thách mới!
          </p>
        </div>
      )}
    </div>
  );
}