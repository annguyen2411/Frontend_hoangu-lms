import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Sparkles, Clock, TrendingUp, Target, Calendar } from 'lucide-react';
import { recommendationEngine, Recommendation } from '../utils/recommendationEngine';
import { motion } from 'motion/react';

interface RecommendationsPanelProps {
  variant?: 'full' | 'compact';
}

export function RecommendationsPanel({ variant = 'full' }: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'time' | 'difficulty'>('all');

  useEffect(() => {
    loadRecommendations();
  }, [activeFilter]);

  const loadRecommendations = () => {
    switch (activeFilter) {
      case 'time':
        setRecommendations(recommendationEngine.getTimeBasedRecommendations());
        break;
      case 'difficulty':
        const prefs = recommendationEngine.getPreferences();
        setRecommendations(recommendationEngine.getDifficultyRecommendations(prefs.difficulty));
        break;
      default:
        setRecommendations(recommendationEngine.generateRecommendations());
    }
  };

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'course':
        return '📚';
      case 'lesson':
        return '📖';
      case 'practice':
        return '✍️';
      case 'review':
        return '🔄';
      case 'challenge':
        return '🎯';
      default:
        return '📝';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (variant === 'compact') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[var(--theme-primary)]" />
          <h3 className="text-lg font-bold text-foreground">Gợi ý cho bạn</h3>
        </div>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <div
              key={rec.id}
              className="flex items-start gap-3 p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors cursor-pointer"
            >
              <div className="text-2xl">{getTypeIcon(rec.type)}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">{rec.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {rec.estimatedTime} phút
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-3 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gợi ý học tập</h2>
            <p className="text-sm text-muted-foreground">
              Được cá nhân hóa dựa trên phong cách và tiến độ của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveFilter('all')}
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          className={activeFilter === 'all' ? 'bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white' : ''}
        >
          <Target className="h-4 w-4 mr-2" />
          Tất cả
        </Button>
        <Button
          onClick={() => setActiveFilter('time')}
          variant={activeFilter === 'time' ? 'default' : 'outline'}
          size="sm"
          className={activeFilter === 'time' ? 'bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white' : ''}
        >
          <Clock className="h-4 w-4 mr-2" />
          Theo thời gian
        </Button>
        <Button
          onClick={() => setActiveFilter('difficulty')}
          variant={activeFilter === 'difficulty' ? 'default' : 'outline'}
          size="sm"
          className={activeFilter === 'difficulty' ? 'bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white' : ''}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Theo độ khó
        </Button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-xl flex items-center justify-center text-2xl">
                  {getTypeIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-foreground">{rec.title}</h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-[var(--theme-primary)]">
                      <TrendingUp className="h-3 w-3" />
                      {rec.priority}/10
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(rec.difficulty)}`}>
                      {rec.difficulty === 'easy' ? 'Dễ' : rec.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                    <span className="px-2 py-1 bg-accent rounded-full text-xs font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {rec.estimatedTime}p
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rec.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Reason */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">💡</span>
                      <span>{rec.reason}</span>
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white">
                    Bắt đầu ngay
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Plan */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-[var(--theme-primary)]" />
          <h3 className="text-lg font-bold text-foreground">Kế hoạch tuần này</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {recommendationEngine.generateWeeklyPlan().map((day, idx) => (
            <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                {day.day}
              </div>
              <div className="space-y-1">
                {day.activities.slice(0, 2).map((activity, aidx) => (
                  <div
                    key={aidx}
                    className="text-xs p-1.5 bg-accent rounded text-foreground truncate"
                    title={activity.title}
                  >
                    {getTypeIcon(activity.type)} {activity.estimatedTime}p
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}