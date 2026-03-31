import { Users, Lock, Globe, TrendingUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StudyGroup } from '../utils/socialSystem';

interface StudyGroupCardProps {
  group: StudyGroup;
  currentUserId: string;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  onView?: (groupId: string) => void;
}

export function StudyGroupCard({ group, currentUserId, onJoin, onLeave, onView }: StudyGroupCardProps) {
  const isMember = group.members.includes(currentUserId);
  const isCreator = group.creatorId === currentUserId;
  const isFull = group.members.length >= group.memberLimit;

  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-xl flex items-center justify-center text-3xl">
          {group.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">{group.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {group.isPublic ? (
                  <Globe className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span>{group.isPublic ? 'Công khai' : 'Riêng tư'}</span>
                <span>•</span>
                <span className="font-semibold">{group.category}</span>
              </div>
            </div>
            {isCreator && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-bold rounded">
                Quản lý
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 line-clamp-2">{group.description}</p>

      {/* Group Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-accent rounded-lg">
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Users className="h-3 w-3" />
            Thành viên
          </div>
          <p className="text-lg font-bold text-foreground">
            {group.members.length}/{group.memberLimit}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3 w-3" />
            Bài học
          </div>
          <p className="text-lg font-bold text-foreground">{group.stats.lessonsCompleted}</p>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Level TB</div>
          <p className="text-lg font-bold text-foreground">{group.stats.averageLevel}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Độ đầy</span>
          <span className="font-semibold text-foreground">
            {Math.round((group.members.length / group.memberLimit) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] h-2 rounded-full transition-all"
            style={{ width: `${(group.members.length / group.memberLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isMember ? (
          <>
            <Button
              onClick={() => onView?.(group.id)}
              className="flex-1 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
            >
              Xem nhóm
            </Button>
            {!isCreator && (
              <Button
                onClick={() => onLeave?.(group.id)}
                variant="outline"
              >
                Rời nhóm
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={() => onJoin?.(group.id)}
            disabled={isFull}
            className="flex-1 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white disabled:opacity-50"
          >
            {isFull ? 'Đã đầy' : 'Tham gia'}
          </Button>
        )}
      </div>
    </Card>
  );
}