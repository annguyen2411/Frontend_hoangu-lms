import { useState } from 'react';
import { Loader2, Trophy, Target, Award, Users, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Leaderboard } from '../components/quests/Leaderboard';
import { LoginPrompt } from '../components/LoginPrompt';
import { useAuth } from '../contexts/AuthContext';
import { useGamificationData } from '../hooks/useAdmin';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function Gamification() {
  const { isAuthenticated, profile } = useAuth();
  const { quests, achievements, leaderboard, loading, completeQuest } = useGamificationData();
  const [activeTab, setActiveTab] = useState('overview');
  const [completingQuest, setCompletingQuest] = useState<string | null>(null);

  const getQuestsByType = (type: string) => quests.filter((q: any) => q.type === type);
  
  const dailyQuests = getQuestsByType('daily');
  const weeklyQuests = getQuestsByType('weekly');
  const specialQuests = getQuestsByType('special');
  const achievementQuests = getQuestsByType('achievement');

  const completedCount = quests.filter((q: any) => q.user_progress?.[0]?.is_completed).length;

  const handleCompleteQuest = async (questId: string) => {
    if (!isAuthenticated) return;
    setCompletingQuest(questId);
    try {
      const response = await api.gamification.completeQuest(questId);
      if (response.success) {
        const rewards = response.data?.rewards || {};
        toast.success(`Hoàn thành nhiệm vụ! +${rewards.coins || 0} coins, +${rewards.xp || 0} XP`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (error) {
      toast.error('Không thể hoàn thành nhiệm vụ');
    } finally {
      setCompletingQuest(null);
    }
  };

  if (!isAuthenticated) {
    return <LoginPrompt title="Gamification" message="Đăng nhập để theo dõi tiến độ và nhận thưởng" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Trophy },
    { id: 'quests', label: 'Nhiệm vụ', icon: Target },
    { id: 'achievements', label: 'Thành tựu', icon: Award },
    { id: 'leaderboard', label: 'Bảng xếp hạng', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gamification</h1>
          <p className="text-gray-600 mt-1">Theo dõi tiến độ và nhận thưởng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Level</p>
                <p className="text-xl font-bold text-gray-900">{profile?.level || 1}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">XP</p>
                <p className="text-xl font-bold text-gray-900">{profile?.total_xp || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Coins</p>
                <p className="text-xl font-bold text-gray-900">{profile?.coins || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Award className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Streak</p>
                <p className="text-xl font-bold text-gray-900">{profile?.streak || 0} ngày</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ học tập</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Hoàn thành nhiệm vụ</span>
                    <span className="font-medium">{completedCount}/{quests.length}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${quests.length ? (completedCount / quests.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-6">
            {/* Daily Quests */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nhiệm vụ hàng ngày</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyQuests.map((quest: any) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={() => handleCompleteQuest(quest.id)}
                    loading={completingQuest === quest.id}
                  />
                ))}
              </div>
            </div>

            {/* Weekly Quests */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nhiệm vụ hàng tuần</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyQuests.map((quest: any) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={() => handleCompleteQuest(quest.id)}
                    loading={completingQuest === quest.id}
                  />
                ))}
              </div>
            </div>

            {/* Special Quests */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nhiệm vụ đặc biệt</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialQuests.concat(achievementQuests).map((quest: any) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={() => handleCompleteQuest(quest.id)}
                    loading={completingQuest === quest.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thành tựu đã mở khóa</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement: any) => (
                <Card key={achievement.id} className={`p-4 text-center ${achievement.unlocked ? '' : 'opacity-50'}`}>
                  <div className="text-3xl mb-2">{achievement.icon || '🏆'}</div>
                  <h3 className="font-medium text-gray-900 text-sm">{achievement.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard entries={leaderboard} currentUserId={profile?.id} />
        )}
      </div>
    </div>
  );
}

// Quest Card Component
function QuestCard({ quest, onComplete, loading }: { quest: any; onComplete: () => void; loading: boolean }) {
  const isCompleted = quest.user_progress?.[0]?.is_completed || false;
  const progress = quest.user_progress?.[0]?.progress || 0;
  const rewards = typeof quest.rewards === 'string' ? JSON.parse(quest.rewards) : quest.rewards;

  return (
    <Card className={`p-4 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-500' : 'bg-purple-100'
          }`}>
            {isCompleted ? (
              <span className="text-white">✓</span>
            ) : (
              <Target className="h-4 w-4 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{quest.title}</h3>
            <p className="text-xs text-gray-500">{quest.description}</p>
          </div>
        </div>
      </div>

      {!isCompleted && (
        <>
          <div className="mb-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${Math.min((progress / quest.target) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}/{quest.target}</p>
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={onComplete}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hoàn thành'}
          </Button>
        </>
      )}

      {isCompleted && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <span>✓</span> Hoàn thành
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
        <Badge variant="outline" className="text-xs">
          +{rewards?.coins || 0} coins
        </Badge>
        <Badge variant="outline" className="text-xs">
          +{rewards?.xp || 0} XP
        </Badge>
      </div>
    </Card>
  );
}