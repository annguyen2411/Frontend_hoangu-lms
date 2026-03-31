import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icon or Illustration */}
      <div className="mb-6">
        {illustration ? (
          illustration
        ) : Icon ? (
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground mb-8 max-w-md">
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
            >
              {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
            >
              {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4 mr-2" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states
export const EmptyStates = {
  NoCourses: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Chưa có khóa học nào"
      description="Bắt đầu hành trình học tiếng Hoa của bạn ngay hôm nay"
      {...props}
    />
  ),
  
  NoResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Không tìm thấy kết quả"
      description="Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm"
      {...props}
    />
  ),
  
  NoProgress: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Chưa có tiến trình"
      description="Bắt đầu học để theo dõi tiến trình của bạn"
      {...props}
    />
  ),
  
  NoCertificates: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Chưa có chứng chỉ nào"
      description="Hoàn thành khóa học để nhận chứng chỉ HSK"
      {...props}
    />
  ),
  
  NoFlashcards: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Chưa có flashcard nào"
      description="Tạo flashcard để ôn tập từ vựng hiệu quả"
      {...props}
    />
  ),
  
  NoQuests: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Chưa có nhiệm vụ nào"
      description="Hoàn thành nhiệm vụ để nhận XP và phần thưởng"
      {...props}
    />
  ),
};
