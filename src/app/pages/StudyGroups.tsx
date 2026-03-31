import { useState, useEffect } from 'react';
import { Users, Plus, Search, UserPlus, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  creator_name: string;
  is_public: boolean;
  max_members: number;
  member_count: number;
  created_at: string;
}

export function StudyGroups() {
  const { profile, isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', is_public: true });

  useEffect(() => {
    fetchGroups();
    if (isAuthenticated) {
      fetchMyGroups();
    }
  }, [isAuthenticated]);

  const fetchGroups = async () => {
    try {
      const response = await api.studyGroups.getAll(searchQuery);
      if (response.success && response.data) {
        setGroups(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const response = await api.studyGroups.getMy();
      if (response.success && response.data) {
        setMyGroups(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch my groups:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleCreateGroup = async () => {
    try {
      await api.studyGroups.create(newGroup);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', is_public: true });
      fetchGroups();
      fetchMyGroups();
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.studyGroups.join(groupId);
      fetchGroups();
      fetchMyGroups();
    } catch (err) {
      console.error('Failed to join group:', err);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await api.studyGroups.leave(groupId);
      fetchGroups();
      fetchMyGroups();
    } catch (err) {
      console.error('Failed to leave group:', err);
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nhóm học tập</h1>
              <p className="text-gray-600">Tham gia nhóm để học cùng bạn bè</p>
            </div>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Tạo nhóm
            </Button>
          )}
        </div>

        {/* My Groups */}
        {isAuthenticated && myGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nhóm của tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myGroups.map(group => (
                <Card key={group.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.member_count} thành viên</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleLeaveGroup(group.id)}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm nhóm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Tìm kiếm</Button>
          </div>
        </form>

        {/* Groups List */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Khám phá nhóm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(group => (
            <Card key={group.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{group.description || 'Không có mô tả'}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.member_count}/{group.max_members}
                    </span>
                    <span>Tạo bởi {group.creator_name}</span>
                  </div>
                </div>
                {isAuthenticated && !myGroups.find(g => g.id === group.id) && group.member_count < group.max_members && (
                  <Button size="sm" onClick={() => handleJoinGroup(group.id)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Tham gia
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy nhóm nào</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Tạo nhóm mới</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên nhóm</label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Nhập tên nhóm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Mô tả nhóm (tùy chọn)"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={newGroup.is_public}
                    onChange={(e) => setNewGroup({ ...newGroup, is_public: e.target.checked })}
                  />
                  <label htmlFor="is_public" className="text-sm">Nhóm công khai</label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                    Hủy
                  </Button>
                  <Button onClick={handleCreateGroup} className="flex-1">
                    Tạo nhóm
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
