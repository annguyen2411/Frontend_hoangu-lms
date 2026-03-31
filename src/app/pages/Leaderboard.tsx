import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, RefreshCw, User, Zap, Flame, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  xp: number;
  coins: number;
  streak: number;
  lessons_completed: number;
  rank: number;
  full_name: string;
  avatar_url: string | null;
  level: number;
}

export function Leaderboard() {
  const { profile, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const [allRes, myRankRes] = await Promise.all([
        api.leaderboard.getAll(),
        isAuthenticated ? api.leaderboard.getMyRank() : Promise.resolve({ success: true, data: null })
      ]);
      
      if (allRes.success && allRes.data) {
        setEntries(allRes.data);
      }
      if (myRankRes.success && myRankRes.data) {
        setMyRank(myRankRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.leaderboard.refresh();
      await fetchLeaderboard();
    } finally {
      setRefreshing(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bảng xếp hạng</h1>
          <p className="text-gray-600">Học tiếng Hoa mỗi ngày để dẫn đầu!</p>
        </div>

        {/* My Rank Card */}
        {isAuthenticated && myRank && (
          <Card className="mb-8 bg-gradient-to-r from-red-600 to-yellow-500 text-white border-0">
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Xếp hạng của bạn</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-4xl font-bold">#{myRank.rank}</span>
                  <div>
                    <p className="font-semibold">{profile?.full_name}</p>
                    <p className="text-white/80 text-sm">Level {myRank.level}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Zap className="h-4 w-4" /> {myRank.xp} XP</span>
                  <span className="flex items-center gap-1"><Flame className="h-4 w-4" /> {myRank.streak} ngày</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {myRank.lessons_completed} bài</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Top 3 */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd place */}
            <div className={`rounded-2xl p-6 border-2 ${getRankBg(2)} flex flex-col items-center pt-8`}>
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold mb-2">
                {entries[1]?.full_name?.[0] || '2'}
              </div>
              <p className="font-semibold text-gray-900">{entries[1]?.full_name}</p>
              <p className="text-sm text-gray-500">Level {entries[1]?.level}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-medium">{entries[1]?.xp} XP</span>
              </div>
            </div>
            
            {/* 1st place */}
            <div className={`rounded-2xl p-6 border-2 ${getRankBg(1)} flex flex-col items-center pt-4 -mt-4`}>
              <Crown className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-3xl font-bold mb-2 text-white">
                {entries[0]?.full_name?.[0] || '1'}
              </div>
              <p className="font-bold text-gray-900">{entries[0]?.full_name}</p>
              <p className="text-sm text-gray-500">Level {entries[0]?.level}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-bold">{entries[0]?.xp} XP</span>
              </div>
            </div>
            
            {/* 3rd place */}
            <div className={`rounded-2xl p-6 border-2 ${getRankBg(3)} flex flex-col items-center pt-10`}>
              <div className="w-14 h-14 rounded-full bg-amber-200 flex items-center justify-center text-xl font-bold mb-2">
                {entries[2]?.full_name?.[0] || '3'}
              </div>
              <p className="font-semibold text-gray-900">{entries[2]?.full_name}</p>
              <p className="text-sm text-gray-500">Level {entries[2]?.level}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-medium">{entries[2]?.xp} XP</span>
              </div>
            </div>
          </div>
        )}

        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </div>

        {/* Full list */}
        <Card>
          <div className="divide-y divide-gray-100">
            {entries.slice(3).map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center p-4 ${entry.user_id === profile?.id ? 'bg-red-50' : ''}`}
              >
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600 ml-2">
                  {entry.full_name?.[0]}
                </div>
                <div className="flex-1 ml-4">
                  <p className="font-semibold text-gray-900">
                    {entry.full_name}
                    {entry.user_id === profile?.id && <span className="ml-2 text-xs text-red-600">(Bạn)</span>}
                  </p>
                  <p className="text-sm text-gray-500">Level {entry.level}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    {entry.xp}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Flame className="h-4 w-4 text-orange-500" />
                    {entry.streak}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    {entry.lessons_completed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
