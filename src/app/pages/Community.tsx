import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Users, Search, Plus, TrendingUp, UserPlus, MessageCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { socialSystem } from '../utils/socialSystem';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SocialFeed } from '../components/SocialFeed';
import { StudyGroupCard } from '../components/StudyGroupCard';
import { ActivityFeed } from '../components/ActivityFeed';

function LoginPrompt() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập để tiếp tục</h2>
        <p className="text-gray-600 mb-6">
          Bạn cần đăng nhập trước khi tiếp tục trải nghiệm các tính năng cộng đồng của HoaNgữ LMS.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/?auth=login">
            <Button className="px-8">Đăng nhập</Button>
          </Link>
          <Link to="/?auth=register">
            <Button variant="outline" className="px-8">Đăng ký</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Community() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'activities'>('feed');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(!isAuthenticated && !isLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !isAuthenticated) {
      setShowLoginPrompt(true);
    } else {
      setShowLoginPrompt(false);
      generateSampleData();
    }
  }, [user, isAuthenticated, isLoading]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;
  }

  if (showLoginPrompt) {
    return <LoginPrompt />;
  }

  const generateSampleData = () => {
    // Check if data already exists
    const existingPosts = socialSystem.getAllPosts();
    if (existingPosts.length > 0) return;

    // Sample posts
    const sampleUsers = [
      { id: 'u1', name: 'Nguyễn Minh Anh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', level: 12 },
      { id: 'u2', name: 'Trần Văn Bình', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', level: 8 },
      { id: 'u3', name: 'Lê Thị Hương', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', level: 15 },
    ];

    sampleUsers.forEach((sampleUser, idx) => {
      socialSystem.createPost(sampleUser.id, sampleUser.name, sampleUser.avatar, sampleUser.level, {
        content: idx === 0 
          ? 'Vừa hoàn thành bài học về thanh điệu trong tiếng Hoa! 🎉 Mất 3 tuần nhưng cuối cùng cũng nắm vững được. Ai có tips gì để luyện phát âm chuẩn hơn không?' 
          : idx === 1
          ? 'Chia sẻ kinh nghiệm: Học 30 phút mỗi ngày hiệu quả hơn nhiều so với học dồn 3-4 tiếng vào cuối tuần. Consistency is key! 💪'
          : 'Đã đạt streak 100 ngày! 🔥 Cảm ơn cộng đồng HoaNgữ đã luôn động viên và hỗ trợ!',
        type: idx === 0 ? 'question' : idx === 1 ? 'tip' : 'milestone',
        tags: idx === 0 ? ['phátâm', 'thanhđiệu'] : idx === 1 ? ['mẹohọc', 'tips'] : ['streak', 'thànhtích']
      });

      // Create activity
      socialSystem.createActivity(sampleUser.id, sampleUser.name, sampleUser.avatar, {
        type: idx === 0 ? 'lesson_completed' : idx === 1 ? 'achievement_earned' : 'streak_milestone',
        description: idx === 0 
          ? 'đã hoàn thành bài học Thanh điệu'
          : idx === 1
          ? 'đã nhận huy hiệu Người hướng dẫn'
          : 'đã đạt streak 100 ngày',
        icon: idx === 0 ? '📚' : idx === 1 ? '🏆' : '🔥',
        color: idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-yellow-600' : 'text-orange-600'
      });
    });

    // Sample groups
    const sampleGroups = [
      {
        name: 'HSK 1 - Nhóm tự học',
        description: 'Nhóm dành cho những người mới bắt đầu học tiếng Hoa, cùng nhau chinh phục HSK 1!',
        avatar: '📚',
        category: 'HSK 1',
        isPublic: true,
        memberLimit: 50
      },
      {
        name: 'Luyện phát âm mỗi ngày',
        description: 'Thực hành phát âm chuẩn Bắc Kinh 15 phút mỗi ngày. Voice chat hàng tuần!',
        avatar: '🎤',
        category: 'Phát âm',
        isPublic: true,
        memberLimit: 30
      },
      {
        name: 'Đọc truyện tiếng Hoa',
        description: 'Cùng nhau đọc và thảo luận các truyện ngắn tiếng Hoa, cải thiện kỹ năng đọc hiểu.',
        avatar: '📖',
        category: 'Đọc hiểu',
        isPublic: true,
        memberLimit: 40
      }
    ];

    if (user) {
      sampleGroups.forEach(group => {
        socialSystem.createStudyGroup(user.id, group);
      });
    }
  };

  const handleCreateGroup = () => {
    if (!user || !newGroupName.trim()) return;

    socialSystem.createStudyGroup(user.id, {
      name: newGroupName,
      description: newGroupDesc,
      avatar: '👥',
      category: 'general',
      isPublic: true,
      memberLimit: 50
    });

    setNewGroupName('');
    setNewGroupDesc('');
    setShowCreateGroup(false);
  };

  const handleJoinGroup = (groupId: string) => {
    if (!user) return;
    socialSystem.joinGroup(groupId, user.id);
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!user) return;
    socialSystem.leaveGroup(groupId, user.id);
  };

  const groups = socialSystem.getPublicGroups();
  const activities = socialSystem.getFeedActivities(user?.id || '', 20);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-3 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Cộng đồng</h1>
                <p className="text-muted-foreground mt-1">
                  Kết nối và học tập cùng nhau
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'feed'
                  ? 'text-[var(--theme-primary)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Bảng tin
              {activeTab === 'feed' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'groups'
                  ? 'text-[var(--theme-primary)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Nhóm học ({groups.length})
              {activeTab === 'groups' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'activities'
                  ? 'text-[var(--theme-primary)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Hoạt động
              {activeTab === 'activities' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <SocialFeed showCreatePost={true} filter="all" />
            )}

            {activeTab === 'groups' && (
              <div>
                {/* Create Group */}
                {showCreateGroup ? (
                  <Card className="p-6 mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">Tạo nhóm học mới</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Tên nhóm
                        </label>
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="VD: HSK 2 - Luyện thi cùng nhau"
                          className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-[var(--theme-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Mô tả
                        </label>
                        <textarea
                          value={newGroupDesc}
                          onChange={(e) => setNewGroupDesc(e.target.value)}
                          placeholder="Mô tả về nhóm học..."
                          rows={3}
                          className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-[var(--theme-primary)] resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateGroup}
                          className="flex-1 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
                        >
                          Tạo nhóm
                        </Button>
                        <Button
                          onClick={() => setShowCreateGroup(false)}
                          variant="outline"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Button
                    onClick={() => setShowCreateGroup(true)}
                    className="w-full mb-6 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Tạo nhóm học mới
                  </Button>
                )}

                {/* Groups Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {groups.map(group => (
                    <StudyGroupCard
                      key={group.id}
                      group={group}
                      currentUserId={user.id}
                      onJoin={handleJoinGroup}
                      onLeave={handleLeaveGroup}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <ActivityFeed activities={activities} maxItems={20} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Thống kê của bạn</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bạn bè</span>
                  <span className="font-bold text-foreground">
                    {socialSystem.getFriends(user.id).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nhóm học</span>
                  <span className="font-bold text-foreground">
                    {socialSystem.getUserGroups(user.id).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bài đăng</span>
                  <span className="font-bold text-foreground">
                    {socialSystem.getUserPosts(user.id).length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Suggested Friends */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Gợi ý kết bạn</h3>
              <div className="space-y-3">
                {[
                  { name: 'Mai Phương', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', level: 10 },
                  { name: 'Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', level: 8 },
                  { name: 'Thu Hà', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', level: 12 }
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{person.name}</p>
                      <p className="text-xs text-muted-foreground">Level {person.level}</p>
                    </div>
                    <button className="p-2 text-[var(--theme-primary)] hover:bg-accent rounded-full transition-colors">
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Popular Tags */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Tags phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {['HSK', 'phátâm', 'từvựng', 'ngữpháp', 'giaotiếp', 'vănhóa'].map((tag, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1.5 bg-accent hover:bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-full text-sm font-semibold transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}