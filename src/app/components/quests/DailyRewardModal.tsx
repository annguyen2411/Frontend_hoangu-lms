import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Coins, Zap, X, Flame } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

interface DailyRewardModalProps {
  isOpen: boolean;
  streak: number;
  onClaim: () => void;
  onClose: () => void;
}

export function DailyRewardModal({ isOpen, streak, onClaim, onClose }: DailyRewardModalProps) {
  const [claimed, setClaimed] = useState(false);

  // Calculate rewards based on streak
  const baseCoins = 50;
  const streakBonus = Math.min(streak * 10, 200); // Max 200 bonus
  const totalCoins = baseCoins + streakBonus;
  const xpReward = 25 + Math.min(streak * 5, 100);

  useEffect(() => {
    if (isOpen && !claimed) {
      // Trigger confetti when modal opens
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#8b5cf6', '#fbbf24'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#8b5cf6', '#fbbf24'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen, claimed]);

  const handleClaim = () => {
    setClaimed(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#fbbf24', '#10b981'],
    });
    setTimeout(() => {
      onClaim();
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative z-10 w-full max-w-md"
          >
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-white to-secondary/10 border-2 border-primary shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-warning to-primary mb-4"
                >
                  <Gift className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Phần thưởng hàng ngày!</h2>
                <p className="text-muted-foreground">
                  Chúc mừng bạn đã quay lại! 🎉
                </p>
              </div>

              {/* Streak Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex items-center justify-center gap-2 mb-6 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border-2 border-orange-500/30"
              >
                <Flame className="h-6 w-6 text-orange-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{streak} ngày</div>
                  <div className="text-sm text-muted-foreground">Streak hiện tại</div>
                </div>
                <Flame className="h-6 w-6 text-orange-500" />
              </motion.div>

              {/* Rewards */}
              {!claimed ? (
                <div className="space-y-4 mb-6">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center">
                        <Coins className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{totalCoins} Xu</div>
                        {streakBonus > 0 && (
                          <div className="text-xs text-muted-foreground">
                            ({baseCoins} cơ bản + {streakBonus} streak bonus)
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{xpReward} XP</div>
                        <div className="text-xs text-muted-foreground">
                          Kinh nghiệm học tập
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-xl font-bold text-success">Đã nhận thưởng!</p>
                </motion.div>
              )}

              {/* Action Button */}
              {!claimed && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleClaim}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    <Gift className="h-5 w-5" />
                    Nhận thưởng ngay!
                  </Button>
                </motion.div>
              )}

              {/* Motivation Text */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Tiếp tục streak để nhận thưởng lớn hơn! 🔥
              </p>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
