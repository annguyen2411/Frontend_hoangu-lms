export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  badges: number;
  change: number; // Rank change from last week
}

export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  teamA: {
    name: string;
    members: number;
    progress: number;
    avatar: string;
  };
  teamB: {
    name: string;
    members: number;
    progress: number;
    avatar: string;
  };
  target: number;
  rewards: {
    coins: number;
    xp: number;
    badge?: string;
  };
  endsAt: string;
  type: 'vocabulary' | 'lessons' | 'pronunciation' | 'study_time';
}

export const leaderboardData: LeaderboardUser[] = [
  {
    id: 'user1',
    rank: 1,
    name: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    level: 12,
    xp: 15420,
    coins: 5600,
    streak: 45,
    badges: 18,
    change: 2
  },
  {
    id: 'user2',
    rank: 2,
    name: 'Trần Thị B',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    level: 11,
    xp: 14850,
    coins: 5200,
    streak: 38,
    badges: 16,
    change: -1
  },
  {
    id: 'user3',
    rank: 3,
    name: 'Lê Văn C',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    level: 11,
    xp: 14200,
    coins: 4800,
    streak: 42,
    badges: 15,
    change: 1
  },
  {
    id: 'user4',
    rank: 4,
    name: 'Phạm Thị D',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    level: 10,
    xp: 13560,
    coins: 4500,
    streak: 35,
    badges: 14,
    change: 0
  },
  {
    id: 'user5',
    rank: 5,
    name: 'Hoàng Văn E',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    level: 10,
    xp: 12890,
    coins: 4200,
    streak: 30,
    badges: 13,
    change: -2
  },
  {
    id: 'current',
    rank: 23,
    name: 'Bạn',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    level: 5,
    xp: 2350,
    coins: 1250,
    streak: 7,
    badges: 3,
    change: 5
  }
];

export const teamChallenges: TeamChallenge[] = [
  {
    id: 'team1',
    title: 'Cuộc đua từ vựng',
    description: 'Đội nào học được nhiều từ vựng hơn trong tuần này?',
    teamA: {
      name: 'Rồng Vàng',
      members: 156,
      progress: 3240,
      avatar: '🐉'
    },
    teamB: {
      name: 'Phượng Hoàng',
      members: 142,
      progress: 2980,
      avatar: '🔥'
    },
    target: 5000,
    rewards: {
      coins: 500,
      xp: 1000,
      badge: 'team_champion'
    },
    endsAt: '2026-03-16T23:59:59',
    type: 'vocabulary'
  },
  {
    id: 'team2',
    title: 'Thử thách phát âm',
    description: 'Thi đấu phát âm hoàn hảo - Điểm AI trung bình cao hơn',
    teamA: {
      name: 'Hổ Trắng',
      members: 98,
      progress: 87,
      avatar: '🐯'
    },
    teamB: {
      name: 'Rùa Vàng',
      members: 105,
      progress: 85,
      avatar: '🐢'
    },
    target: 95,
    rewards: {
      coins: 400,
      xp: 800,
      badge: 'pronunciation_team'
    },
    endsAt: '2026-03-18T23:59:59',
    type: 'pronunciation'
  }
];
