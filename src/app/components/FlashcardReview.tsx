import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { RotateCcw, Volume2, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import { spacedRepetition, FlashCard } from '../utils/spacedRepetition';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function FlashcardReview() {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ newCards: 0, dueCards: 0, totalCards: 0, masteredCards: 0, learningCards: 0 });
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, incorrect: 0 });

  useEffect(() => {
    loadCards();
    loadStats();
    spacedRepetition.importPredefinedCards();
  }, []);

  const loadCards = () => {
    const dueCards = spacedRepetition.getDueCards();
    const newCards = spacedRepetition.getNewCards(5);
    const combined = [...dueCards, ...newCards];
    setCards(combined);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const loadStats = () => {
    setStats(spacedRepetition.getStats());
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = (quality: number) => {
    if (!isFlipped) {
      toast.error('Hãy lật thẻ trước khi đánh giá!');
      return;
    }

    const currentCard = cards[currentIndex];
    spacedRepetition.reviewCard(currentCard.id, quality);

    // Update session stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      incorrect: prev.incorrect + (quality < 3 ? 1 : 0)
    }));

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Session complete
      toast.success('🎉 Hoàn thành phiên ôn tập!');
      loadCards();
      loadStats();
      setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 });
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast.error('Trình duyệt không hỗ trợ đọc văn bản');
    }
  };

  if (cards.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Tuyệt vời!</h3>
        <p className="text-muted-foreground mb-6">
          Bạn đã hoàn thành tất cả flashcard hôm nay
        </p>
        <Button
          onClick={loadCards}
          className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
        >
          Tải lại
        </Button>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Mới</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.newCards}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Cần ôn</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.dueCards}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Đang học</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.learningCards}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Thành thạo</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.masteredCards}</div>
        </Card>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Tiến độ: {currentIndex + 1}/{cards.length}
          </span>
          <span className="font-semibold text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="perspective-1000">
        <motion.div
          onClick={handleFlip}
          className="relative cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Front */}
          <Card
            className="h-96 flex flex-col items-center justify-center p-8"
            style={{
              backfaceVisibility: 'hidden',
              position: isFlipped ? 'absolute' : 'relative',
              width: '100%'
            }}
          >
            <div className="text-sm text-muted-foreground mb-2">{currentCard.category}</div>
            <div className="text-6xl font-bold mb-4">{currentCard.front}</div>
            <div className="text-2xl text-[var(--theme-primary)] mb-6">{currentCard.pinyin}</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(currentCard.front);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
            >
              <Volume2 className="h-5 w-5 text-[var(--theme-primary)]" />
              <span className="font-semibold text-foreground">Phát âm</span>
            </button>
            <div className="mt-8 text-sm text-muted-foreground">
              👆 Nhấn để lật thẻ
            </div>
          </Card>

          {/* Back */}
          <Card
            className="h-96 flex flex-col items-center justify-center p-8"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: isFlipped ? 'relative' : 'absolute',
              top: 0,
              width: '100%'
            }}
          >
            <div className="text-sm text-muted-foreground mb-2">Nghĩa tiếng Việt</div>
            <div className="text-5xl font-bold mb-4 text-foreground">{currentCard.back}</div>
            <div className="text-xl text-muted-foreground mb-2">{currentCard.front}</div>
            <div className="text-lg text-[var(--theme-primary)]">{currentCard.pinyin}</div>
            {currentCard.example && (
              <div className="mt-6 p-4 bg-accent rounded-lg max-w-md">
                <div className="text-sm text-muted-foreground mb-1">Ví dụ:</div>
                <div className="text-foreground">{currentCard.example}</div>
              </div>
            )}
            <div className="mt-8 text-sm text-muted-foreground">
              👇 Đánh giá độ nhớ của bạn
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Review Buttons (only show when flipped) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <Button
              onClick={() => handleReview(0)}
              variant="outline"
              className="flex-col h-auto py-4 border-2 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <div className="text-2xl mb-1">😰</div>
              <div className="text-xs font-semibold">Không nhớ</div>
            </Button>
            <Button
              onClick={() => handleReview(2)}
              variant="outline"
              className="flex-col h-auto py-4 border-2 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
            >
              <div className="text-2xl mb-1">🤔</div>
              <div className="text-xs font-semibold">Khó</div>
            </Button>
            <Button
              onClick={() => handleReview(3)}
              variant="outline"
              className="flex-col h-auto py-4 border-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
            >
              <div className="text-2xl mb-1">👍</div>
              <div className="text-xs font-semibold">Được</div>
            </Button>
            <Button
              onClick={() => handleReview(5)}
              variant="outline"
              className="flex-col h-auto py-4 border-2 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs font-semibold">Dễ</div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Stats */}
      {sessionStats.reviewed > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{sessionStats.reviewed}</div>
              <div className="text-xs text-muted-foreground">Đã ôn</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{sessionStats.correct}</div>
              <div className="text-xs text-muted-foreground">Đúng</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{sessionStats.incorrect}</div>
              <div className="text-xs text-muted-foreground">Sai</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--theme-primary)]">
                {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Chính xác</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}