import { motion } from 'motion/react';

// Skeleton Loader
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg h-48 mb-4" />
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="bg-muted rounded-lg h-20 w-20 flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-4 border-muted border-t-[var(--theme-primary)] rounded-full animate-spin`} />
    </div>
  );
}

// Page Loading
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <div className="text-6xl mb-4">📚</div>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">HoaNgữ</h2>
        <p className="text-muted-foreground">Đang tải...</p>
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}

// Progress Bar
export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] h-2 rounded-full"
      />
    </div>
  );
}

// Button Loading State
export function ButtonLoading() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span>Đang xử lý...</span>
    </div>
  );
}

// Empty State
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </motion.div>
  );
}

// Error State
export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  description = 'Vui lòng thử lại sau',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Thử lại
        </button>
      )}
    </motion.div>
  );
}

// Inline Loading
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <LoadingSpinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
