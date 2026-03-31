import { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card } from '../components/ui/Card';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: { type: string; target: number };
  reward: { xp: number; coins: number };
  unlocked: boolean;
  unlockedAt?: string;
}

export function Achievements() {
  const { profile, isAuthenticated } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.achievements.getAll();
        if (response.success && response.data) {
          setAchievements(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAchievements();
    }
  }, [isAuthenticated]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Thành tựu</h1>
          <p className="text-gray-600">
            Hoàn thành các thử thách để nhận thưởng!
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
            <Star className="h-5 w-5" />
            <span className="font-semibold">{unlockedCount} / {achievements.length} thành tựu</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
              style={{ width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`p-6 ${achievement.unlocked 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                : 'bg-gray-50 opacity-75'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{achievement.name}</h3>
                    {achievement.unlocked ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {achievement.reward?.xp > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        +{achievement.reward.xp} XP
                      </span>
                    )}
                    {achievement.reward?.coins > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        +{achievement.reward.coins} Coins
                      </span>
                    )}
                  </div>

                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Đã mở: {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có thành tựu nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
