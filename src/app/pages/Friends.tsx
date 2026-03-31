import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Check, X, Users, Search, Crown, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  friend_name: string;
  friend_avatar: string | null;
  friend_level: number;
}

interface SuggestedUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
}

export function Friends() {
  const { profile, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');

  useEffect(() => {
    if (isAuthenticated) {
      fetchFriends();
      fetchSuggestions();
    }
  }, [isAuthenticated]);

  const fetchFriends = async () => {
    try {
      const response = await api.friends.getAll('accepted');
      if (response.success && response.data) {
        setFriends(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.friends.getSuggestions();
      if (response.success && response.data) {
        setSuggestions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await api.friends.sendRequest(userId);
      setSuggestions(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const friend = friends.find(f => f.id);
      if (friend) {
        await api.friends.remove(friend.id);
        fetchFriends();
      }
    } catch (err) {
      console.error('Failed to remove friend:', err);
    }
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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bạn bè</h1>
            <p className="text-gray-600">Kết nối và học cùng bạn bè</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'friends' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserCheck className="h-4 w-4 inline mr-2" />
            Bạn bè ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'suggestions' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Gợi ý ({suggestions.length})
          </button>
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map(friend => (
              <Card key={friend.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                    {friend.friend_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{friend.friend_name}</h3>
                    <p className="text-sm text-gray-500">Level {friend.friend_level}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveFriend(friend.friend_id)}>
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            {friends.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có bạn bè nào</p>
                <Button className="mt-4" onClick={() => setActiveTab('suggestions')}>
                  Tìm bạn bè
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map(user => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {user.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                    <p className="text-sm text-gray-500">Level {user.level}</p>
                  </div>
                  <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Kết bạn
                  </Button>
                </div>
              </Card>
            ))}
            {suggestions.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có gợi ý nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
