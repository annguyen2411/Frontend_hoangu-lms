import type { ApiResponse } from '../types/database';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data as T;
  }

  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  private post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  private put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  auth = {
    register: (email: string, password: string, full_name: string) =>
      this.post<ApiResponse<{ user: any; token: string }>>('/auth/register', { email, password, full_name }),
    
    login: (email: string, password: string) =>
      this.post<ApiResponse<{ user: any; token: string }>>('/auth/login', { email, password }),
    
    getMe: () => this.get<ApiResponse<any>>('/auth/me'),
    
    updateProfile: (data: { full_name?: string; avatar_url?: string; language?: string; theme?: string; notification_enabled?: boolean }) =>
      this.put<ApiResponse<any>>('/auth/me', data),
    
    changePassword: (current_password: string, new_password: string) =>
      this.put<ApiResponse<any>>('/auth/password', { current_password, new_password }),
  };

  courses = {
    getAll: (params?: { category?: string; level?: string; featured?: boolean; published?: boolean; page?: number; limit?: number }) =>
      this.get<ApiResponse<any[]>>(`/courses?${new URLSearchParams(params as any).toString()}`),
    
    getBySlug: (slug: string) => this.get<ApiResponse<any>>(`/courses/slug/${slug}`),
    
    getById: (id: string) => this.get<ApiResponse<any>>(`/courses/${id}`),
    
    create: (course: any) => this.post<ApiResponse<any>>('/courses', course),
    
    update: (id: string, course: any) => this.put<ApiResponse<any>>(`/courses/${id}`, course),
    
    delete: (id: string) => this.delete<ApiResponse<any>>(`/courses/${id}`),
  };

  lessons = {
    getByCourse: (courseId: string, published = true) =>
      this.get<ApiResponse<any[]>>(`/lessons/course/${courseId}?published=${published}`),
    
    getById: (id: string) => this.get<ApiResponse<any>>(`/lessons/${id}`),
    
    create: (lesson: any) => this.post<ApiResponse<any>>('/lessons', lesson),
    
    update: (id: string, lesson: any) => this.put<ApiResponse<any>>(`/lessons/${id}`, lesson),
    
    delete: (id: string) => this.delete<ApiResponse<any>>(`/lessons/${id}`),
  };

  enrollments = {
    getAll: () => this.get<ApiResponse<any[]>>('/enrollments'),
    
    getByCourse: (courseId: string) => this.get<ApiResponse<any>>(`/enrollments/course/${courseId}`),
    
    check: (courseId: string) => this.get<ApiResponse<{ enrolled: boolean; enrollment: any }>>(`/enrollments/check/${courseId}`),
    
    create: (course_id: string) => this.post<ApiResponse<any>>('/enrollments', { course_id }),
    
    update: (id: string, data: { progress?: number; status?: string }) =>
      this.put<ApiResponse<any>>(`/enrollments/${id}`, data),
  };

  payments = {
    getAll: (params?: { status?: string; page?: number; limit?: number }) =>
      this.get<ApiResponse<any[]>>(`/payments?${new URLSearchParams(params as any).toString()}`),
    
    create: (data: { course_id: string; amount_vnd: number; payment_method: string }) =>
      this.post<ApiResponse<any>>('/payments', data),
    
    complete: (id: string, transaction_id: string) =>
      this.post<ApiResponse<any>>(`/payments/${id}/complete`, { transaction_id }),
  };

  progress = {
    getLesson: (lessonId: string) => this.get<ApiResponse<any>>(`/progress/lesson/${lessonId}`),
    
    getCourse: (courseId: string) => this.get<ApiResponse<Record<string, any>>>(`/progress/course/${courseId}`),
    
    update: (data: { lesson_id: string; is_completed: boolean; watched_seconds: number }) =>
      this.post<ApiResponse<any>>('/progress', data),
  };

  settings = {
    getAll: () => this.get<ApiResponse<any[]>>('/settings'),
    
    get: (key: string) => this.get<ApiResponse<any>>(`/settings?key=${key}`),
    
    set: (key: string, value: string) => this.post<ApiResponse<any>>('/settings', { key, value }),
    
    update: (key: string, value: string) => this.put<ApiResponse<any>>(`/settings/${key}`, { value }),
    
    delete: (key: string) => this.delete<ApiResponse<any>>(`/settings/${key}`),
  };

  admin = {
    getStats: () => this.get<ApiResponse<any>>('/admin/stats'),
    
    getUsers: (params?: { search?: string; page?: number; limit?: number }) =>
      this.get<ApiResponse<any[]>>(`/admin/users?${new URLSearchParams(params as any).toString()}`),
    
    createUser: (data: { full_name: string; email: string; password: string; role: string }) =>
      this.post<ApiResponse<any>>('/admin/users', data),
    
    updateUser: (id: string, data: { full_name?: string; role?: string; level?: number; coins?: number }) =>
      this.put<ApiResponse<any>>(`/admin/users/${id}`, data),
    
    deleteUser: (id: string) => this.delete<ApiResponse<any>>(`/admin/users/${id}`),
    
    getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
      this.get<ApiResponse<any[]>>(`/admin/orders?${new URLSearchParams(params as any).toString()}`),
    
    updateOrder: (id: string, status: string) => this.put<ApiResponse<any>>(`/admin/orders/${id}`, { status }),
    
    // Course Approval
    getPendingCourses: () => this.get<ApiResponse<any[]>>('/admin/courses/pending'),
    approveCourse: (id: string) => this.put<ApiResponse<any>>(`/admin/courses/${id}/approve`, {}),
    rejectCourse: (id: string, reason: string) => this.put<ApiResponse<any>>(`/admin/courses/${id}/reject`, { reason }),
    
    // Analytics
    getRevenueAnalytics: (period?: number) => this.get<ApiResponse<any[]>>(`/admin/analytics/revenue?period=${period || 30}`),
    getTopCourses: (limit?: number) => this.get<ApiResponse<any[]>>(`/admin/analytics/top-courses?limit=${limit || 10}`),
    getEngagement: () => this.get<ApiResponse<any>>('/admin/analytics/engagement'),
    
    // Banners
    getBanners: () => this.get<ApiResponse<any[]>>('/admin/banners'),
    createBanner: (data: any) => this.post<ApiResponse<any>>('/admin/banners', data),
    updateBanner: (id: string, data: any) => this.put<ApiResponse<any>>(`/admin/banners/${id}`, data),
    deleteBanner: (id: string) => this.delete<ApiResponse<any>>(`/admin/banners/${id}`),
    
    // Notifications
    getNotifications: () => this.get<ApiResponse<any[]>>('/admin/notifications'),
    createNotification: (data: any) => this.post<ApiResponse<any>>('/admin/notifications', data),
    updateNotification: (id: string, data: any) => this.put<ApiResponse<any>>(`/admin/notifications/${id}`, data),
    deleteNotification: (id: string) => this.delete<ApiResponse<any>>(`/admin/notifications/${id}`),
    
    // Certificates
    getCertificates: (params?: { search?: string; page?: number; limit?: number }) =>
      this.get<ApiResponse<any[]>>(`/admin/certificates?${new URLSearchParams(params as any).toString()}`),
    createCertificate: (userId: string, courseId: string) =>
      this.post<ApiResponse<any>>('/admin/certificates', { user_id: userId, course_id: courseId }),
  };

  coupons = {
    getAll: () => this.get<ApiResponse<any[]>>('/coupons'),
    
    create: (data: any) => this.post<ApiResponse<any>>('/coupons', data),
    
    update: (id: string, data: any) => this.put<ApiResponse<any>>(`/coupons/${id}`, data),
    
    delete: (id: string) => this.delete<ApiResponse<any>>(`/coupons/${id}`),
    
    validate: (code: string, amount?: number) => 
      this.get<ApiResponse<any>>(`/coupons/validate/${code}?${amount ? `amount=${amount}` : ''}`),
  };

  gamification = {
    getQuests: () => this.get<ApiResponse<any[]>>('/gamification/quests'),
    
    completeQuest: (id: string) => this.post<ApiResponse<any>>(`/gamification/quests/${id}/complete`),
    
    getAchievements: () => this.get<ApiResponse<any[]>>('/gamification/achievements'),
    
    getLeaderboard: () => this.get<ApiResponse<any[]>>('/gamification/leaderboard'),
  };

  shop = {
    getItems: (type?: string) => this.get<ApiResponse<any[]>>(`/shop?${type ? `type=${type}` : ''}`),
    
    purchase: (itemId: string) => this.post<ApiResponse<any>>(`/shop/purchase/${itemId}`),
  };

  community = {
    getPosts: (params?: { page?: number; limit?: number }) =>
      this.get<ApiResponse<any[]>>(`/community/posts?${new URLSearchParams(params as any).toString()}`),
    
    createPost: (data: { content: string; type?: string; tags?: string[] }) =>
      this.post<ApiResponse<any>>('/community/posts', data),
    
    likePost: (postId: string) => this.post<ApiResponse<any>>(`/community/posts/${postId}/like`),
    
    getComments: (postId: string) => this.get<ApiResponse<any[]>>(`/community/posts/${postId}/comments`),
    
    createComment: (postId: string, content: string) =>
      this.post<ApiResponse<any>>(`/community/posts/${postId}/comments`, { content }),
    
    getGroups: () => this.get<ApiResponse<any[]>>('/community/groups'),
    
    createGroup: (data: { name: string; description?: string; is_public?: boolean; max_members?: number }) =>
      this.post<ApiResponse<any>>('/community/groups', data),
    
    getActivities: (limit = 20) => this.get<ApiResponse<any[]>>(`/community/activities?limit=${limit}`),
  };

  leaderboard = {
    getAll: () => this.get<ApiResponse<any[]>>('/leaderboard'),
    getMyRank: () => this.get<ApiResponse<any>>('/leaderboard/my-rank'),
    refresh: () => this.post<ApiResponse<any[]>>('/leaderboard/refresh'),
  };

  achievements = {
    getAll: () => this.get<ApiResponse<any[]>>('/achievements'),
    check: (type: string, value: number) => this.post<ApiResponse<any[]>>('/achievements/check', { type, value }),
  };

  studyGroups = {
    getAll: (search?: string) => this.get<ApiResponse<any[]>>(`/study-groups${search ? `?search=${search}` : ''}`),
    getMy: () => this.get<ApiResponse<any[]>>('/study-groups/my'),
    getById: (id: string) => this.get<ApiResponse<any>>(`/study-groups/${id}`),
    create: (data: { name: string; description?: string; is_public?: boolean; max_members?: number }) =>
      this.post<ApiResponse<any>>('/study-groups', data),
    join: (groupId: string) => this.post<ApiResponse<any>>(`/study-groups/${groupId}/join`),
    leave: (groupId: string) => this.post<ApiResponse<any>>(`/study-groups/${groupId}/leave`),
  };

  friends = {
    getAll: (status?: string) => this.get<ApiResponse<any[]>>(`/friends${status ? `?status=${status}` : ''}`),
    getSuggestions: () => this.get<ApiResponse<any[]>>('/friends/suggestions'),
    sendRequest: (friendId: string) => this.post<ApiResponse<any>>('/friends/request', { friendId }),
    accept: (id: string) => this.put<ApiResponse<any>>(`/friends/${id}/accept`),
    decline: (id: string) => this.put<ApiResponse<any>>(`/friends/${id}/decline`),
    remove: (id: string) => this.delete<ApiResponse<any>>(`/friends/${id}`),
  };

  notifications = {
    getAll: (limit?: number, offset?: number) => 
      this.get<ApiResponse<any>>(`/notifications?limit=${limit || 20}&offset=${offset || 0}`),
    markRead: (id: string) => this.put<ApiResponse<any>>(`/notifications/${id}/read`),
    markAllRead: () => this.put<ApiResponse<any>>('/notifications/read-all'),
    delete: (id: string) => this.delete<ApiResponse<any>>(`/notifications/${id}`),
  };

  instructors = {
    getAll: () => this.get<ApiResponse<any[]>>('/instructors'),
    getMyCourses: () => this.get<ApiResponse<any[]>>('/instructors/my-courses'),
    getCourses: (id: string) => this.get<ApiResponse<any[]>>(`/instructors/${id}/courses`),
    createCourse: (data: {
      title: string;
      description?: string;
      thumbnail_url?: string;
      level?: string;
      category?: string;
      price_vnd?: number;
      original_price_vnd?: number;
      discount_percent?: number;
      has_certificate?: boolean;
      total_lessons?: number;
      duration_hours?: number;
      teacher_name?: string;
    }) => this.post<ApiResponse<any>>('/instructors/courses', data),
    getStats: () => this.get<ApiResponse<any>>('/instructors/stats'),
    getStudents: () => this.get<ApiResponse<any[]>>('/instructors/students'),
    getMessages: () => this.get<ApiResponse<any[]>>('/instructors/messages'),
    sendMessage: (userId: string, subject: string, content: string) =>
      this.post<ApiResponse<any>>('/instructors/messages', { user_id: userId, subject, content }),
    markMessageRead: (messageId: string) =>
      this.put<ApiResponse<any>>(`/instructors/messages/${messageId}/read`, {}),
    updateProfile: (data: { bio?: string; specialty?: string; hourly_rate?: number; is_available?: boolean }) =>
      this.post<ApiResponse<any>>('/instructors/profile', data),
    assignCourse: (courseId: string, teacherId: string) =>
      this.put<ApiResponse<any>>('/instructors/assign-course', { course_id: courseId, teacher_id: teacherId }),
  };

  student = {
    // Grammar Exercises
    getExercises: (lessonId: string) => this.get<ApiResponse<any[]>>(`/student/exercises/lesson/${lessonId}`),
    submitExercise: (exerciseId: string, userAnswer: string) =>
      this.post<ApiResponse<any>>('/student/exercises/submit', { exercise_id: exerciseId, user_answer: userAnswer }),
    
    // Vocabulary
    getVocabulary: (lessonId: string) => this.get<ApiResponse<any[]>>(`/student/vocabulary/lesson/${lessonId}`),
    getVocabularyByHSK: (level: number) => this.get<ApiResponse<any[]>>(`/student/vocabulary/hsk/${level}`),
    saveVocabulary: (vocabularyId: string) => this.post<ApiResponse<any>>('/student/vocabulary/save', { vocabulary_id: vocabularyId }),
    getMyVocabulary: () => this.get<ApiResponse<any[]>>('/student/vocabulary/my-words'),
    
    // Goals
    getGoals: () => this.get<ApiResponse<any>>('/student/goals'),
    saveGoals: (data: { target_level?: string; daily_study_time?: number; study_days_per_week?: number; goal_description?: string; interests?: string[] }) =>
      this.post<ApiResponse<any>>('/student/goals', data),
    
    // Recommendations
    getRecommendations: () => this.get<ApiResponse<any[]>>('/student/recommendations'),
    
    // Learning History
    getHistory: (params?: { page?: number; limit?: number }) =>
      this.get<ApiResponse<any>>(`/student/history?${new URLSearchParams(params as any).toString()}`),
    saveHistory: (lessonId: string, action: string, durationSeconds?: number) =>
      this.post<ApiResponse<any>>('/student/history', { lesson_id: lessonId, action, duration_seconds: durationSeconds }),
    
    // Voice Practice
    saveVoicePractice: (data: { lesson_id?: string; vocabulary_id?: string; recording_url: string; transcript?: string; score?: number; feedback?: string }) =>
      this.post<ApiResponse<any>>('/student/voice-practice', data),
    getVoicePractices: () => this.get<ApiResponse<any[]>>('/student/voice-practice'),
  };
}

export const api = new ApiClient();
