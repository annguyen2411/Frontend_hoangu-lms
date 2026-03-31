// Social Features & Community System
import { offlineStorage } from './offlineStorage';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  badges: string[];
  coursesCompleted: number;
  studyStreak: number;
  joinedDate: Date;
  location?: string;
  learningGoal?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  content: string;
  images?: string[];
  type: 'text' | 'achievement' | 'milestone' | 'question' | 'tip';
  achievementData?: {
    title: string;
    icon: string;
    description: string;
  };
  timestamp: Date;
  likes: string[]; // user IDs
  comments: Comment[];
  tags: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: string[];
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  avatar: string;
  creatorId: string;
  members: string[]; // user IDs
  memberLimit: number;
  isPublic: boolean;
  category: string;
  createdAt: Date;
  stats: {
    totalStudyTime: number;
    lessonsCompleted: number;
    averageLevel: number;
  };
}

export interface Friendship {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  initiatedBy: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'lesson_completed' | 'achievement_earned' | 'streak_milestone' | 'course_completed' | 'level_up' | 'friend_added';
  description: string;
  icon: string;
  color: string;
  timestamp: Date;
  metadata?: any;
}

class SocialSystem {
  private readonly POSTS_KEY = 'hoangu-social-posts';
  private readonly GROUPS_KEY = 'hoangu-study-groups';
  private readonly FRIENDS_KEY = 'hoangu-friendships';
  private readonly MESSAGES_KEY = 'hoangu-messages';
  private readonly ACTIVITIES_KEY = 'hoangu-activities';
  private readonly FOLLOWING_KEY = 'hoangu-following';
  private readonly MIGRATION_KEY = 'hoangu-social-migration-v2'; // Bumped to v2
  private idCounter = 0;

  constructor() {
    // Run migration on initialization
    this.migrateDuplicateIds();
  }

  // ============= MIGRATION =============

  private migrateDuplicateIds(): void {
    // Check if migration already ran
    if (offlineStorage.get(this.MIGRATION_KEY)) {
      return;
    }

    console.log('[Migration] Starting duplicate ID migration...');

    // Fix all posts with duplicate IDs
    const posts = offlineStorage.get<Post[]>(this.POSTS_KEY) || [];
    const seenIds = new Set<string>();
    let postsFixed = 0;
    let commentsFixed = 0;
    
    posts.forEach(post => {
      // If ID already exists or is just a timestamp (old format), regenerate it
      if (seenIds.has(post.id) || !post.id.includes('-')) {
        console.log(`[Migration] Fixing duplicate post ID: ${post.id}`);
        post.id = this.generateId();
        postsFixed++;
      }
      seenIds.add(post.id);

      // Fix comment IDs too
      const commentIds = new Set<string>();
      post.comments.forEach(comment => {
        if (commentIds.has(comment.id) || !comment.id.includes('-')) {
          console.log(`[Migration] Fixing duplicate comment ID: ${comment.id}`);
          comment.id = this.generateId();
          commentsFixed++;
        }
        commentIds.add(comment.id);
      });
    });

    console.log(`[Migration] Fixed ${postsFixed} posts and ${commentsFixed} comments`);

    offlineStorage.set(this.POSTS_KEY, posts);
    offlineStorage.set(this.MIGRATION_KEY, true);
    
    console.log('[Migration] Migration complete!');
  }

  // ============= POSTS & FEED =============

  private generateId(): string {
    this.idCounter++;
    return `${Date.now()}-${this.idCounter}-${Math.random().toString(36).substring(2, 9)}`;
  }

  createPost(userId: string, userName: string, userAvatar: string, userLevel: number, postData: Partial<Post>): Post {
    const newPost: Post = {
      id: this.generateId(),
      userId,
      userName,
      userAvatar,
      userLevel,
      content: postData.content || '',
      images: postData.images || [],
      type: postData.type || 'text',
      achievementData: postData.achievementData,
      timestamp: new Date(),
      likes: [],
      comments: [],
      tags: postData.tags || []
    };

    const posts = this.getAllPosts();
    posts.unshift(newPost);
    offlineStorage.set(this.POSTS_KEY, posts);

    // Create activity
    this.createActivity(userId, userName, userAvatar, {
      type: 'lesson_completed',
      description: 'đã đăng bài mới',
      icon: '📝',
      color: 'text-blue-600'
    });

    return newPost;
  }

  getAllPosts(): Post[] {
    return offlineStorage.get<Post[]>(this.POSTS_KEY) || [];
  }

  getUserPosts(userId: string): Post[] {
    return this.getAllPosts().filter(post => post.userId === userId);
  }

  getFeedPosts(userId: string, includeFollowing: boolean = true): Post[] {
    const posts = this.getAllPosts();
    
    if (!includeFollowing) {
      return posts;
    }

    const following = this.getFollowing(userId);
    const friends = this.getFriends(userId);
    const allowedUserIds = new Set([
      userId,
      ...following,
      ...friends.map(f => f.userId === userId ? f.friendId : f.userId)
    ]);

    return posts.filter(post => allowedUserIds.has(post.userId));
  }

  likePost(postId: string, userId: string): void {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (post) {
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
      }
      offlineStorage.set(this.POSTS_KEY, posts);
    }
  }

  addComment(postId: string, userId: string, userName: string, userAvatar: string, content: string): void {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (post) {
      const comment: Comment = {
        id: this.generateId(),
        userId,
        userName,
        userAvatar,
        content,
        timestamp: new Date(),
        likes: []
      };
      post.comments.push(comment);
      offlineStorage.set(this.POSTS_KEY, posts);
    }
  }

  deletePost(postId: string, userId: string): boolean {
    const posts = this.getAllPosts();
    const postIndex = posts.findIndex(p => p.id === postId && p.userId === userId);
    
    if (postIndex >= 0) {
      posts.splice(postIndex, 1);
      offlineStorage.set(this.POSTS_KEY, posts);
      return true;
    }
    return false;
  }

  // ============= STUDY GROUPS =============

  createStudyGroup(creatorId: string, groupData: Partial<StudyGroup>): StudyGroup {
    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: groupData.name || 'Nhóm học mới',
      description: groupData.description || '',
      avatar: groupData.avatar || '👥',
      creatorId,
      members: [creatorId],
      memberLimit: groupData.memberLimit || 50,
      isPublic: groupData.isPublic !== undefined ? groupData.isPublic : true,
      category: groupData.category || 'general',
      createdAt: new Date(),
      stats: {
        totalStudyTime: 0,
        lessonsCompleted: 0,
        averageLevel: 1
      }
    };

    const groups = this.getAllGroups();
    groups.push(newGroup);
    offlineStorage.set(this.GROUPS_KEY, groups);

    return newGroup;
  }

  getAllGroups(): StudyGroup[] {
    return offlineStorage.get<StudyGroup[]>(this.GROUPS_KEY) || [];
  }

  getPublicGroups(): StudyGroup[] {
    return this.getAllGroups().filter(g => g.isPublic);
  }

  getUserGroups(userId: string): StudyGroup[] {
    return this.getAllGroups().filter(g => g.members.includes(userId));
  }

  joinGroup(groupId: string, userId: string): boolean {
    const groups = this.getAllGroups();
    const group = groups.find(g => g.id === groupId);
    
    if (group && !group.members.includes(userId) && group.members.length < group.memberLimit) {
      group.members.push(userId);
      offlineStorage.set(this.GROUPS_KEY, groups);
      return true;
    }
    return false;
  }

  leaveGroup(groupId: string, userId: string): boolean {
    const groups = this.getAllGroups();
    const group = groups.find(g => g.id === groupId);
    
    if (group && group.creatorId !== userId) {
      group.members = group.members.filter(id => id !== userId);
      offlineStorage.set(this.GROUPS_KEY, groups);
      return true;
    }
    return false;
  }

  // ============= FRIENDS & FOLLOWING =============

  sendFriendRequest(userId: string, friendId: string): void {
    const friendships = this.getAllFriendships();
    
    const existing = friendships.find(
      f => (f.userId === userId && f.friendId === friendId) || 
           (f.userId === friendId && f.friendId === userId)
    );

    if (!existing) {
      const friendship: Friendship = {
        userId,
        friendId,
        status: 'pending',
        initiatedBy: userId,
        timestamp: new Date()
      };
      friendships.push(friendship);
      offlineStorage.set(this.FRIENDS_KEY, friendships);
    }
  }

  acceptFriendRequest(userId: string, friendId: string): void {
    const friendships = this.getAllFriendships();
    const friendship = friendships.find(
      f => ((f.userId === userId && f.friendId === friendId) || 
           (f.userId === friendId && f.friendId === userId)) &&
           f.status === 'pending'
    );

    if (friendship) {
      friendship.status = 'accepted';
      offlineStorage.set(this.FRIENDS_KEY, friendships);
    }
  }

  removeFriend(userId: string, friendId: string): void {
    const friendships = this.getAllFriendships();
    const filtered = friendships.filter(
      f => !((f.userId === userId && f.friendId === friendId) || 
            (f.userId === friendId && f.friendId === userId))
    );
    offlineStorage.set(this.FRIENDS_KEY, filtered);
  }

  getAllFriendships(): Friendship[] {
    return offlineStorage.get<Friendship[]>(this.FRIENDS_KEY) || [];
  }

  getFriends(userId: string): Friendship[] {
    return this.getAllFriendships().filter(
      f => ((f.userId === userId || f.friendId === userId) && f.status === 'accepted')
    );
  }

  getPendingRequests(userId: string): Friendship[] {
    return this.getAllFriendships().filter(
      f => f.friendId === userId && f.status === 'pending'
    );
  }

  // Following system (different from friends)
  followUser(userId: string, targetUserId: string): void {
    const following = this.getFollowing(userId);
    if (!following.includes(targetUserId)) {
      following.push(targetUserId);
      offlineStorage.set(`${this.FOLLOWING_KEY}-${userId}`, following);
    }
  }

  unfollowUser(userId: string, targetUserId: string): void {
    const following = this.getFollowing(userId);
    const filtered = following.filter(id => id !== targetUserId);
    offlineStorage.set(`${this.FOLLOWING_KEY}-${userId}`, filtered);
  }

  getFollowing(userId: string): string[] {
    return offlineStorage.get<string[]>(`${this.FOLLOWING_KEY}-${userId}`) || [];
  }

  getFollowers(userId: string): string[] {
    // This is inefficient but works for demo
    const allUsers = ['user1', 'user2', 'user3', 'user4', 'user5']; // Mock
    return allUsers.filter(id => this.getFollowing(id).includes(userId));
  }

  // ============= MESSAGES =============

  sendMessage(senderId: string, receiverId: string, content: string): Message {
    const message: Message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false
    };

    const messages = this.getAllMessages();
    messages.push(message);
    offlineStorage.set(this.MESSAGES_KEY, messages);

    return message;
  }

  getConversation(userId: string, otherUserId: string): Message[] {
    return this.getAllMessages().filter(
      m => (m.senderId === userId && m.receiverId === otherUserId) ||
           (m.senderId === otherUserId && m.receiverId === userId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getAllMessages(): Message[] {
    return offlineStorage.get<Message[]>(this.MESSAGES_KEY) || [];
  }

  markAsRead(messageId: string): void {
    const messages = this.getAllMessages();
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
      offlineStorage.set(this.MESSAGES_KEY, messages);
    }
  }

  getUnreadCount(userId: string): number {
    return this.getAllMessages().filter(m => m.receiverId === userId && !m.read).length;
  }

  // ============= ACTIVITIES =============

  createActivity(userId: string, userName: string, userAvatar: string, activityData: Partial<Activity>): void {
    const activity: Activity = {
      id: Date.now().toString(),
      userId,
      userName,
      userAvatar,
      type: activityData.type || 'lesson_completed',
      description: activityData.description || '',
      icon: activityData.icon || '📚',
      color: activityData.color || 'text-blue-600',
      timestamp: new Date(),
      metadata: activityData.metadata
    };

    const activities = this.getAllActivities();
    activities.unshift(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(100);
    }

    offlineStorage.set(this.ACTIVITIES_KEY, activities);
  }

  getAllActivities(): Activity[] {
    return offlineStorage.get<Activity[]>(this.ACTIVITIES_KEY) || [];
  }

  getUserActivities(userId: string, limit?: number): Activity[] {
    const activities = this.getAllActivities().filter(a => a.userId === userId);
    return limit ? activities.slice(0, limit) : activities;
  }

  getFeedActivities(userId: string, limit?: number): Activity[] {
    const following = this.getFollowing(userId);
    const friends = this.getFriends(userId);
    const allowedUserIds = new Set([
      userId,
      ...following,
      ...friends.map(f => f.userId === userId ? f.friendId : f.userId)
    ]);

    const activities = this.getAllActivities().filter(a => allowedUserIds.has(a.userId));
    return limit ? activities.slice(0, limit) : activities;
  }
}

export const socialSystem = new SocialSystem();