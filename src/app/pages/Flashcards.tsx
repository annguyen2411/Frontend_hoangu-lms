import { useState, useEffect } from 'react';
import { Zap, TrendingUp, BookOpen, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FlashcardReview } from '../components/FlashcardReview';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { spacedRepetition } from '../utils/spacedRepetition';
import { toast } from 'sonner';
import { LoginPrompt, LoadingSpinner } from '../components/LoginPrompt';

export function Flashcards() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'review' | 'browse'>('review');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    pronunciation: '',
    category: 'HSK 1',
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading || isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  const stats = spacedRepetition.getStats();

  const handleCreateCard = () => {
    if (!newCard.front || !newCard.back || !newCard.pronunciation || !newCard.category) {
      toast.error('Vui lòng điền đầy đủ thông tin cho thẻ mới.');
      return;
    }
    spacedRepetition.addCard(newCard);
    toast.success('Thẻ mới đã được thêm thành công.');
    setShowCreateModal(false);
    setNewCard({
      front: '',
      back: '',
      pronunciation: '',
      category: 'HSK 1',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Flashcard Spaced Repetition</h1>
              <p className="text-muted-foreground mt-1">
                Ghi nhớ từ vựng hiệu quả với thuật toán khoa học
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="text-xs text-muted-foreground mb-1">Tổng thẻ</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCards}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <div className="text-xs text-muted-foreground mb-1">Cần ôn</div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.dueCards}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="text-xs text-muted-foreground mb-1">Đang học</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.learningCards}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="text-xs text-muted-foreground mb-1">Thành thạo</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.masteredCards}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
              <div className="text-xs text-muted-foreground mb-1">Chưa học</div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.newCards}</div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveView('review')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeView === 'review'
                  ? 'text-[var(--theme-primary)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Ôn tập
              {stats.dueCards > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {stats.dueCards}
                </span>
              )}
              {activeView === 'review' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
              )}
            </button>
            <button
              onClick={() => setActiveView('browse')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeView === 'browse'
                  ? 'text-[var(--theme-primary)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Thư viện
              {activeView === 'browse' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeView === 'review' ? (
          <FlashcardReview />
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Bộ thẻ của bạn</h3>
                <Button className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo thẻ mới
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['HSK 1', 'HSK 2', 'Giao tiếp hàng ngày', 'Gia đình', 'Số đếm'].map((category, idx) => {
                  const categoryCards = spacedRepetition.getCardsByCategory(category);
                  return (
                    <Card key={idx} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-foreground mb-1">{category}</h4>
                          <p className="text-sm text-muted-foreground">
                            {categoryCards.length} thẻ
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-lg flex items-center justify-center text-2xl">
                          📚
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Học ngay
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--theme-primary)]" />
                Spaced Repetition là gì?
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Spaced Repetition (Lặp lại ngắt quãng) là phương pháp học tập khoa học, giúp bạn ghi nhớ lâu dài bằng cách:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)] font-bold">1.</span>
                  <span>Ôn tập các từ vựng vào đúng thời điểm trước khi bạn quên</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)] font-bold">2.</span>
                  <span>Tăng dần khoảng cách giữa các lần ôn tập dựa trên độ quen thuộc</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--theme-primary)] font-bold">3.</span>
                  <span>Tối ưu hóa thời gian học, tập trung vào những gì bạn chưa nắm vững</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* Create Card Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Tạo Thẻ Mới</h3>
                <Button className="bg-red-500 text-white" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Trước (Front)</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-border rounded-md"
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Sau (Back)</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-border rounded-md"
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phát âm</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-border rounded-md"
                    value={newCard.pronunciation}
                    onChange={(e) => setNewCard({ ...newCard, pronunciation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Danh mục</label>
                  <select
                    className="w-full p-2 border border-border rounded-md"
                    value={newCard.category}
                    onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                  >
                    <option value="HSK 1">HSK 1</option>
                    <option value="HSK 2">HSK 2</option>
                    <option value="Giao tiếp hàng ngày">Giao tiếp hàng ngày</option>
                    <option value="Gia đình">Gia đình</option>
                    <option value="Số đếm">Số đếm</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <Button className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white" onClick={handleCreateCard}>
                  Tạo Thẻ
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}