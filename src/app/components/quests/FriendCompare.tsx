import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Trophy, TrendingUp, Zap, Target, Award } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  achievements: number;
  lessonsCompleted: number;
}

interface FriendCompareProps {
  currentUser: {
    level: number;
    xp: number;
    streak: number;
    achievements: number;
    lessonsCompleted: number;
  };
}

const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Minh Anh',
    avatar: '👩‍🎓',
    level: 8,
    xp: 850,
    streak: 12,
    achievements: 8,
    lessonsCompleted: 45,
  },
  {
    id: '2',
    name: 'Tuấn Kiệt',
    avatar: '👨‍💼',
    level: 6,
    xp: 620,
    streak: 7,
    achievements: 5,
    lessonsCompleted: 32,
  },
  {
    id: '3',
    name: 'Thu Hà',
    avatar: '👩‍💻',
    level: 10,
    xp: 1050,
    streak: 15,
    achievements: 12,
    lessonsCompleted: 58,
  },
];

export function FriendCompare({ currentUser }: FriendCompareProps) {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const compareStats = (friendStat: number, userStat: number) => {
    const diff = userStat - friendStat;
    return {
      diff: Math.abs(diff),
      isAhead: diff > 0,
      isEqual: diff === 0,
    };
  };

  const StatComparison = ({
    icon: Icon,
    label,
    friendValue,
    userValue,
    suffix = '',
  }: {
    icon: any;
    label: string;
    friendValue: number;
    userValue: number;
    suffix?: string;
  }) => {
    const { diff, isAhead, isEqual } = compareStats(friendValue, userValue);
    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {friendValue}{suffix}
          </span>
          <div className="w-px h-6 bg-border" />
          <span className="text-sm font-bold">{userValue}{suffix}</span>
          {!isEqual && (
            <Badge
              variant={isAhead ? 'default' : 'secondary'}
              size="sm"
              className={isAhead ? 'bg-success' : 'bg-muted'}
            >
              {isAhead ? '+' : '-'}{diff}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Friends List */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          So sánh với bạn bè
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {mockFriends.map((friend) => (
            <motion.div
              key={friend.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  selectedFriend?.id === friend.id
                    ? 'border-2 border-primary shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() =>
                  setSelectedFriend(selectedFriend?.id === friend.id ? null : friend)
                }
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">{friend.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold">{friend.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-3 w-3" />
                      <span>Level {friend.level}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium">{friend.xp} XP</span>
                  </div>
                  <Progress value={(friend.xp % 100)} className="h-1.5" />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-500">
                      {friend.streak}
                    </div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {friend.achievements}
                    </div>
                    <div className="text-xs text-muted-foreground">Thành tích</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">
                      {friend.lessonsCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground">Bài học</div>
                  </div>
                </div>

                {selectedFriend?.id === friend.id && (
                  <Button size="sm" className="w-full mt-3" variant="outline">
                    Chi tiết so sánh
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Comparison */}
      {selectedFriend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-2 border-primary">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                So sánh chi tiết với {selectedFriend.name}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFriend(null)}
              >
                Đóng
              </Button>
            </div>

            <div className="space-y-3">
              <StatComparison
                icon={Trophy}
                label="Level"
                friendValue={selectedFriend.level}
                userValue={currentUser.level}
              />
              <StatComparison
                icon={Zap}
                label="Kinh nghiệm"
                friendValue={selectedFriend.xp}
                userValue={currentUser.xp}
                suffix=" XP"
              />
              <StatComparison
                icon={Target}
                label="Streak"
                friendValue={selectedFriend.streak}
                userValue={currentUser.streak}
                suffix=" ngày"
              />
              <StatComparison
                icon={Award}
                label="Thành tích"
                friendValue={selectedFriend.achievements}
                userValue={currentUser.achievements}
              />
              <StatComparison
                icon={Trophy}
                label="Bài học"
                friendValue={selectedFriend.lessonsCompleted}
                userValue={currentUser.lessonsCompleted}
              />
            </div>

            {/* Motivational Message */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <p className="text-sm text-center">
                {currentUser.level >= selectedFriend.level ? (
                  <>
                    🎉 <strong>Tuyệt vời!</strong> Bạn đang dẫn trước {selectedFriend.name}. Tiếp tục phát huy nhé!
                  </>
                ) : (
                  <>
                    💪 <strong>Cố lên!</strong> Bạn chỉ còn cách {selectedFriend.name}{' '}
                    {selectedFriend.level - currentUser.level} level. Bạn làm được!
                  </>
                )}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Invite Friends CTA */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-dashed">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold mb-1">Mời bạn bè cùng học</h4>
            <p className="text-sm text-muted-foreground">
              Học cùng bạn bè giúp bạn tiến bộ nhanh hơn 2x!
            </p>
          </div>
          <Button variant="outline">
            <Users className="h-4 w-4" />
            Mời bạn bè
          </Button>
        </div>
      </Card>
    </div>
  );
}
