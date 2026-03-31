import { useState, useEffect } from 'react';
import { Target, Clock, Calendar, Heart, Save, Sparkles, BookOpen, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

interface UserGoals {
  target_level: string;
  daily_study_time: number;
  study_days_per_week: number;
  goal_description: string;
  interests: string[];
}

export function Goals() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<UserGoals>({
    target_level: '',
    daily_study_time: 30,
    study_days_per_week: 7,
    goal_description: '',
    interests: [],
  });

  const interestOptions = [
    'Giao tiếp', 'Du lịch', 'Thương mại', 'HSK', 'Phát âm', 
    'Ngữ pháp', 'Từ vựng', 'Chữ Hán', 'Kinh doanh', 'Văn hóa Trung Quốc'
  ];

  const levelOptions = [
    { value: 'beginner', label: 'Sơ cấp (HSK 1-2)' },
    { value: 'intermediate', label: 'Trung cấp (HSK 3-4)' },
    { value: 'advanced', label: 'Nâng cao (HSK 5-6)' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
    }
  }, [isAuthenticated]);

  const loadGoals = async () => {
    try {
      const res = await api.student.getGoals();
      if (res.success && res.data) {
        setGoals({
          target_level: res.data.target_level || '',
          daily_study_time: res.data.daily_study_time || 30,
          study_days_per_week: res.data.study_days_per_week || 7,
          goal_description: res.data.goal_description || '',
          interests: res.data.interests || [],
        });
      }
    } catch (err) {
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.student.saveGoals(goals);
      if (res.success) {
        toast.success('Lưu mục tiêu thành công!');
      }
    } catch (err) {
      toast.error('Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setGoals(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập để đặt mục tiêu</h2>
          <p className="text-gray-600">Thiết lập mục tiêu học tập cá nhân</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-900">Mục tiêu học tập</h1>
          </div>
          <p className="text-gray-600">Thiết lập mục tiêu để nhận gợi ý khóa học phù hợp</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Target Level */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Mục tiêu trình độ
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {levelOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setGoals(prev => ({ ...prev, target_level: option.value }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      goals.target_level === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Study Time */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Thời gian học tập
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian mỗi ngày (phút)
                  </label>
                  <Input
                    type="number"
                    value={goals.daily_study_time}
                    onChange={(e) => setGoals(prev => ({ ...prev, daily_study_time: parseInt(e.target.value) || 30 }))}
                    min={10}
                    max={180}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số ngày học mỗi tuần
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <button
                        key={day}
                        onClick={() => setGoals(prev => ({ ...prev, study_days_per_week: day }))}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          goals.study_days_per_week === day
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Interests */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Quan tâm
              </h2>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      goals.interests.includes(interest)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </Card>

            {/* Goal Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Mô tả mục tiêu</h2>
              <textarea
                value={goals.goal_description}
                onChange={(e) => setGoals(prev => ({ ...prev, goal_description: e.target.value }))}
                placeholder="Mô tả mục tiêu học tiếng Hoa của bạn..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={4}
              />
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 text-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu mục tiêu'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
