import { useState } from 'react';
import { 
  MessageCircle, Send, ThumbsUp, ThumbsDown, MoreVertical,
  Reply, Flag, CheckCircle, Clock, User
} from 'lucide-react';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  likes: number;
  is_teacher: boolean;
  replies?: Comment[];
  is_answered?: boolean;
}

interface LessonQAProps {
  lessonId: string;
  comments: Comment[];
  currentUserId?: string;
  onPostComment?: (content: string, parentId?: string) => Promise<void>;
  onLike?: (commentId: string) => Promise<void>;
  onReport?: (commentId: string, reason: string) => Promise<void>;
}

export function LessonQA({ 
  lessonId, 
  comments, 
  currentUserId, 
  onPostComment, 
  onLike,
  onReport 
}: LessonQAProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    
    if (onPostComment) {
      await onPostComment(newComment);
    }
    setNewComment('');
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    if (onPostComment) {
      await onPostComment(replyContent, parentId);
    }
    setReplyContent('');
    setReplyTo(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-400" />
          Hỏi đáp ({comments.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="latest">Mới nhất</option>
          <option value="popular">Phổ biến nhất</option>
        </select>
      </div>

      {/* New Comment Input */}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Hỏi về bài học này..."
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-white/20 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="h-4 w-4" /> Gửi
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Chưa có câu hỏi nào</p>
          <p className="text-sm mt-2">Hãy là người đầu tiên đặt câu hỏi!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
              {/* Comment Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  {comment.user_avatar ? (
                    <img src={comment.user_avatar} alt={comment.user_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-medium">{comment.user_name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium">{comment.user_name}</span>
                    {comment.is_teacher && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Giáo viên
                      </span>
                    )}
                    {comment.is_answered && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Đã trả lời
                      </span>
                    )}
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatTime(comment.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-white/80 mt-2 whitespace-pre-wrap">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => onLike?.(comment.id)}
                      className="flex items-center gap-1 text-white/40 hover:text-purple-400 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Reply className="h-4 w-4" />
                      <span className="text-sm">Trả lời</span>
                    </button>
                    <button
                      onClick={() => setShowReportModal(comment.id)}
                      className="flex items-center gap-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Reply Input */}
                  {replyTo === comment.id && (
                    <div className="mt-3 pl-4 border-l-2 border-purple-500/30">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Viết câu trả lời..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => { setReplyTo(null); setReplyContent(''); }}
                          className="px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handlePostReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-white/20 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/10">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{reply.user_name}</span>
                            {reply.is_teacher && (
                              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                GV
                              </span>
                            )}
                            <span className="text-white/40 text-xs">{formatTime(reply.created_at)}</span>
                          </div>
                          <p className="text-white/70 text-sm mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowReportModal(null)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-4">Báo cáo bình luận</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-4"
            >
              <option value="">Chọn lý do</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Nội dung không phù hợp</option>
              <option value="incorrect">Thông tin sai</option>
              <option value="other">Khác</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(null)}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onReport?.(showReportModal, reportReason);
                  setShowReportModal(null);
                  setReportReason('');
                }}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-white/20 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
