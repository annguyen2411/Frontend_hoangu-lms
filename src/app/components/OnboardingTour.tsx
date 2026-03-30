import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

const ONBOARDING_KEY = 'hoangu-onboarding-complete';

export function useOnboarding() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      setIsFirstVisit(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsFirstVisit(false);
  }, []);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return { isFirstVisit, currentStep, setCurrentStep, completeOnboarding, skipOnboarding };
}

export function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      onComplete?.();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onSkip?.();
  };

  const step = steps[currentStep];

  const getPositionStyles = () => {
    if (!targetRect) return {};
    
    const offset = 10;
    switch (step.position) {
      case 'top':
        return {
          top: targetRect.top - offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - offset,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + offset,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />
      
      {/* Highlight target */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary rounded-lg shadow-lg pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute pointer-events-auto"
        style={getPositionStyles()}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-80 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">Bước {currentStep + 1}/{steps.length}</span>
            </div>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-lg font-bold mb-2">{step.title}</h3>
          <p className="text-muted-foreground mb-4">{step.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-colors ${
                    i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>Hoàn thành <Check className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Tiếp theo <ChevronRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default onboarding steps for new users
export const defaultOnboardingSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: 'Chào mừng! 👋',
    content: 'Đây là dashboard của bạn. Tại đây bạn có thể theo dõi tiến trình học tập.',
    position: 'right',
  },
  {
    target: '[data-tour="courses"]',
    title: 'Khám phá khóa học',
    content: 'Tìm kiếm các khóa học tiếng Hoa phù hợp với trình độ của bạn.',
    position: 'bottom',
  },
  {
    target: '[data-tour="flashcards"]',
    title: 'Flashcard thông minh',
    content: 'Ôn từ vựng với thuật toán Spaced Repetition giúp nhớ lâu hơn.',
    position: 'top',
  },
  {
    target: '[data-tour="achievements"]',
    title: 'Thành tựu & Phần thưởng',
    content: 'Hoàn thành nhiệm vụ để nhận XP, coins và huy hiệu đặc biệt!',
    position: 'top',
  },
];
