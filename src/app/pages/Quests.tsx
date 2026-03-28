import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Target, Calendar, Star, Trophy, Award, Gift, Sparkles, Users, Crown, Loader2 } from 'lucide-react';
import { QuestCard } from '../components/quests/QuestCard';
import { QuestModal } from '../components/quests/QuestModal';
import { UserStatsBar } from '../components/quests/UserStatsBar';
import { BadgeShowcase } from '../components/quests/BadgeShowcase';
import { Leaderboard } from '../components/quests/Leaderboard';
import { TeamChallenges } from '../components/quests/TeamChallenges';
import { SocialShare } from '../components/quests/SocialShare';
import { QuestNotifications, useQuestNotifications } from '../components/quests/QuestNotifications';
import { LoginPrompt } from '../components/LoginPrompt';
import { useAuth } from '../contexts/AuthContext';
import { useGamificationData } from '../hooks/useAdmin';
import { api } from '../../lib/api';
import { toast } from 'sonner';

type Tab = 'daily' | 'weekly' | 'special' | 'achievement' | 'badges' | 'leaderboard' | 'teams';

export function Quests() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, profile } = useAuth();
  const { quests, achievements, leaderboard, loading: gamificationLoading, completeQuest } = useGamificationData();
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [questLoading, setQuestLoading] = useState(false);
  const { notifications, addNotification, dismissNotification } = useQuestNotifications();

  const userQuestProgress = quests.reduce((acc: Record<string, any>, quest: any) => {
    if (quest.user_progress?.[0]) {
      acc[quest.id] = quest.user_progress[0];
    }
    return acc;
  }, {});

  const getQuestsByType = (type: string) => quests.filter((q: any) => q.type === type);

  const tabs = [
    { id: 'daily' as Tab, label: 'Hàng ngày', icon: Calendar, count: getQuestsByType('daily').length },
    { id: 'weekly' as Tab, label: 'Hàng tuần', icon: Target, count: getQuestsByType('weekly').length },
    { id: 'special' as Tab, label: 'Đặc biệt', icon: Star, count: getQuestsByType('special').length },
    { id: 'achievement' as Tab, label: 'Thành tích', icon: Trophy, count: getQuestsByType('achievement').length },
    { id: 'badges' as Tab, label: 'Huy hiệu', icon: Award, count: achievements.length },
    { id: 'leaderboard' as Tab, label: 'Bảng xếp hạng', icon: Users, count: leaderboard.length },
    { id: 'teams' as Tab, label: 'Thách thức nhóm', icon: Crown, count: 0 }
  ];

  const currentQuests = activeTab === 'daily' ? getQuestsByType('daily') :
                       activeTab === 'weekly' ? getQuestsByType('weekly') :
                       activeTab === 'special' ? getQuestsByType('special') :
                       activeTab === 'achievement' ? getQuestsByType('achievement') : [];

  const completedQuests = currentQuests.filter((q: any) => userQuestProgress[q.id]?.is_completed).length;

  const handleCompleteQuest = async (questId: string) => {
    if (!isAuthenticated) return;
    setQuestLoading(true);
    try {
      const response = await api.gamification.completeQuest(questId);
      if (response.success) {
        toast.success('Hoàn thành nhiệm vụ!', {
          description: `+${response.data?.rewards?.coins || 0} coins, +${response.data?.rewards?.xp || 0} XP`
        });
        addNotification({
          id: questId,
          type: 'success',
          title: 'Hoàn thành nhiệm vụ!',
          message: `Bạn nhận được ${response.data?.rewards?.coins || 0} coins`
        });
      }
    } catch (error) {
      toast.error('Không thể hoàn thành nhiệm vụ');
    } finally {
      setQuestLoading(false);
    }
  };

  const showLoading = gamificationLoading;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="text-gray-500">Đang tải nhiệm vụ...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt title="Nhiệm vụ" message="Đăng nhập để nhận nhiệm vụ và nhận thưởng" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuestNotifications notifications={notifications} onDismiss={dismissNotification} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nhiệm vụ & Thành tựu</h1>
          <p className="text-gray-600 mt-2">Hoàn thành nhiệm vụ để nhận thưởng và leo lên bảng xếp hạng</p>
        </div>

        {/* User Stats */}
        {profile && <UserStatsBar stats={profile} />}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
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
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'badges' && achievements.length > 0 && (
          <BadgeShowcase achievements={achievements} />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard entries={leaderboard} currentUserId={profile?.id} />
        )}

        {activeTab === 'teams' && (
          <TeamChallenges />
        )}

        {['daily', 'weekly', 'special', 'achievement'].includes(activeTab) && (
          <div>
            {/* Progress */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">
                  {completedQuests}/{currentQuests.length} hoàn thành
                </span>
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${currentQuests.length ? (completedQuests / currentQuests.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Quests Grid */}
            {currentQuests.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có nhiệm vụ nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentQuests.map((quest: any) => (
                  <QuestCard
                    key={quest.id}
                    quest={{
                      ...quest,
                      isCompleted: userQuestProgress[quest.id]?.is_completed || false,
                      progress: userQuestProgress[quest.id]?.progress || 0
                    }}
                    onComplete={() => handleCompleteQuest(quest.id)}
                    loading={questLoading}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Social Share */}
        <div className="mt-12">
          <SocialShare />
        </div>
      </div>

      {/* Quest Modal */}
      {selectedQuest && (
        <QuestModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onComplete={() => handleCompleteQuest(selectedQuest.id)}
        />
      )}
    </div>
  );
}