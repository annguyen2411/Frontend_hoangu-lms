import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Send } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { socialSystem, Post } from '../utils/socialSystem';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface SocialFeedProps {
  userId?: string;
  showCreatePost?: boolean;
  filter?: 'all' | 'following';
}

export function SocialFeed({ userId, showCreatePost = true, filter = 'all' }: SocialFeedProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadPosts();
  }, [userId, filter]);

  const loadPosts = () => {
    if (userId) {
      setPosts(socialSystem.getUserPosts(userId));
    } else if (filter === 'following' && currentUser) {
      setPosts(socialSystem.getFeedPosts(currentUser.id, true));
    } else {
      setPosts(socialSystem.getAllPosts());
    }
  };

  const handleCreatePost = () => {
    if (!currentUser || !newPostContent.trim()) return;

    socialSystem.createPost(
      currentUser.id,
      currentUser.name,
      currentUser.avatar,
      5, // Mock level
      {
        content: newPostContent,
        type: 'text'
      }
    );

    setNewPostContent('');
    loadPosts();
  };

  const handleLike = (postId: string) => {
    if (!currentUser) return;
    socialSystem.likePost(postId, currentUser.id);
    loadPosts();
  };

  const handleComment = (postId: string) => {
    if (!currentUser || !commentInputs[postId]?.trim()) return;

    socialSystem.addComment(
      postId,
      currentUser.id,
      currentUser.name,
      currentUser.avatar,
      commentInputs[postId]
    );

    setCommentInputs({ ...commentInputs, [postId]: '' });
    loadPosts();
  };

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const getPostTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'milestone':
        return '🎯';
      case 'question':
        return '❓';
      case 'tip':
        return '💡';
      default:
        return '📝';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {showCreatePost && currentUser && (
        <Card className="p-6">
          <div className="flex gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Chia sẻ điều gì đó với cộng đồng..."
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg resize-none focus:outline-none focus:border-[var(--theme-primary)] text-foreground"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    📷 Hình ảnh
                  </button>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    🏆 Thành tích
                  </button>
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
                >
                  Đăng bài
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Posts Feed */}
      <AnimatePresence>
        {posts.map((post) => {
          const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">{post.userName}</h4>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white text-xs font-bold rounded">
                          Lv {post.userLevel}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(post.timestamp)}
                      </p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Post Type Badge */}
                {post.type !== 'text' && (
                  <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-accent rounded-full text-sm font-semibold">
                    <span>{getPostTypeIcon(post.type)}</span>
                    <span className="capitalize">{post.type}</span>
                  </div>
                )}

                {/* Achievement Card */}
                {post.type === 'achievement' && post.achievementData && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-500 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{post.achievementData.icon}</span>
                      <div>
                        <h5 className="font-bold text-foreground">{post.achievementData.title}</h5>
                        <p className="text-sm text-muted-foreground">{post.achievementData.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post Content */}
                <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {post.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-accent text-[var(--theme-primary)] text-xs font-semibold rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      isLiked
                        ? 'text-red-500'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span className="font-semibold">{post.likes.length}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-semibold">{post.comments.length}</span>
                  </button>

                  <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span className="font-semibold">Chia sẻ</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {/* Comment List */}
                    <div className="space-y-3 mb-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <img
                            src={comment.userAvatar}
                            alt={comment.userName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-accent rounded-lg p-3">
                              <h5 className="font-semibold text-foreground text-sm">
                                {comment.userName}
                              </h5>
                              <p className="text-foreground text-sm">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(comment.timestamp)}</span>
                              <button className="hover:text-foreground">Thích</button>
                              <button className="hover:text-foreground">Trả lời</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    {currentUser && (
                      <div className="flex gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                            }
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleComment(post.id);
                            }}
                            placeholder="Viết bình luận..."
                            className="flex-1 px-4 py-2 bg-accent border border-border rounded-full text-foreground focus:outline-none focus:border-[var(--theme-primary)]"
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                            className="p-2 text-[var(--theme-primary)] hover:bg-accent rounded-full transition-colors disabled:opacity-50"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {posts.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-foreground mb-2">Chưa có bài đăng nào</h3>
          <p className="text-muted-foreground">
            {userId ? 'Người dùng này chưa đăng bài nào.' : 'Hãy là người đầu tiên chia sẻ!'}
          </p>
        </Card>
      )}
    </div>
  );
}