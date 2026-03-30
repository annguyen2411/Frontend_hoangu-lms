import type { ApiResponse } from '../types/database';

// Dynamic API URL - uses current host if available, fallback to env or localhost
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // For network access, construct URL from current location
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiUrl();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

// Input validation utilities
const validators = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword(password: string): boolean {
    return password && password.length >= 6;
  },

  isValidName(name: string): boolean {
    return name && name.trim().length >= 2 && name.length <= 100;
  },

  sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  },

  isValidId(id: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(id);
  }
};

function ValidationError(message: string) {
  this.message = message;
  this.name = 'ValidationError';
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
      try {
        config.body = JSON.stringify(body);
      } catch {
        throw new Error('Invalid body data');
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối internet.');
      }
      throw error;
    }
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
    register: (email: string, password: string, full_name: string) => {
      if (!validators.isValidEmail(email)) {
        return Promise.reject(new Error('Email không hợp lệ'));
      }
      if (!validators.isValidPassword(password)) {
        return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự'));
      }
      if (!validators.isValidName(full_name)) {
        return Promise.reject(new Error('Tên phải có ít nhất 2 ký tự'));
      }
      return this.post<ApiResponse<{ user: any; token: string }>>('/auth/register', { 
        email: validators.sanitizeInput(email), 
        password, 
        full_name: validators.sanitizeInput(full_name) 
      });
    },
    
    login: (email: string, password: string) => {
      if (!email || !password) {
        return Promise.reject(new Error('Vui lòng nhập email và mật khẩu'));
      }
      return this.post<ApiResponse<{ user: any; token: string }>>('/auth/login', { email, password });
    },
    
    getMe: () => this.get<ApiResponse<any>>('/auth/me'),
    
    updateProfile: (data: { full_name?: string; avatar_url?: string; language?: string; theme?: string; notification_enabled?: boolean }) => {
      if (data.full_name && !validators.isValidName(data.full_name)) {
        return Promise.reject(new Error('Tên không hợp lệ'));
      }
      return this.put<ApiResponse<any>>('/auth/me', data);
    },
    
    changePassword: (current_password: string, new_password: string) => {
      if (!current_password) {
        return Promise.reject(new Error('Vui lòng nhập mật khẩu hiện tại'));
      }
      if (!validators.isValidPassword(new_password)) {
        return Promise.reject(new Error('Mật khẩu mới phải có ít nhất 6 ký tự'));
      }
      return this.put<ApiResponse<any>>('/auth/password', { current_password, new_password });
    },
    
    forgotPassword: (email: string) => {
      if (!email || !validators.isValidEmail(email)) {
        return Promise.reject(new Error('Vui lòng nhập email hợp lệ'));
      }
      return this.post<ApiResponse<any>>('/auth/forgot-password', { email });
    },
    
    resetPassword: (token: string, new_password: string) => {
      if (!token) {
        return Promise.reject(new Error('Token không hợp lệ'));
      }
      if (!validators.isValidPassword(new_password)) {
        return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự'));
      }
      return this.post<ApiResponse<any>>('/auth/reset-password', { token, new_password });
    },
  };

  courses = {
    getAll: (params?: { category?: string; level?: string; featured?: boolean; published?: boolean; page?: number; limit?: number; free?: boolean }) =>
      this.get<ApiResponse<any[]>>(`/courses?${new URLSearchParams(params as any).toString()}`),
    
    getBySlug: (slug: string) => {
      if (!slug || slug.length > 200) {
        return Promise.reject(new Error('Slug không hợp lệ'));
      }
      return this.get<ApiResponse<any>>(`/courses/slug/${encodeURIComponent(slug)}`);
    },
    
    getById: (id: string) => {
      if (!validators.isValidId(id)) {
        return Promise.reject(new Error('ID không hợp lệ'));
      }
      return this.get<ApiResponse<any>>(`/courses/${encodeURIComponent(id)}`);
    },
    
    create: (course: any) => {
      if (!course?.title || course.title.trim().length < 3) {
        return Promise.reject(new Error('Tiêu đề khóa học phải có ít nhất 3 ký tự'));
      }
      return this.post<ApiResponse<any>>('/courses', course);
    },
    
    update: (id: string, course: any) => {
      if (!validators.isValidId(id)) {
        return Promise.reject(new Error('ID không hợp lệ'));
      }
      return this.put<ApiResponse<any>>(`/courses/${encodeURIComponent(id)}`, course);
    },
    
    delete: (id: string) => {
      if (!validators.isValidId(id)) {
        return Promise.reject(new Error('ID không hợp lệ'));
      }
      return this.delete<ApiResponse<any>>(`/courses/${encodeURIComponent(id)}`);
    },
    
    checkAccess: (id: string) => {
      if (!validators.isValidId(id)) {
        return Promise.reject(new Error('ID không hợp lệ'));
      }
      return this.get<ApiResponse<any>>(`/courses/${encodeURIComponent(id)}/check-access`);
    },
  };

  lessons = {
    getByCourse: (courseId: string, published = true) =>
      this.get<ApiResponse<any[]>>(`/lessons/course/${courseId}?published=${published}`),
    
    getById: (id: string) => this.get<ApiResponse<any>>(`/lessons/${id}`),
    
    getResources: (lessonId: string) => this.get<ApiResponse<any[]>>(`/lessons/${lessonId}/resources`),
    
    create: (lesson: any) => this.post<ApiResponse<any>>('/lessons', lesson),
    
    update: (id: string, lesson: any) => this.put<ApiResponse<any>>(`/lessons/${id}`, lesson),
    
    delete: (id: string) => this.delete<ApiResponse<any>>(`/lessons/${id}`),
  };

  quizzes = {
    getByLesson: (lessonId: string) => this.get<ApiResponse<any[]>>(`/student/exercises/lesson/${lessonId}`),
    
    submitAnswer: (exercise_id: string, user_answer: string) =>
      this.post<ApiResponse<any>>('/student/exercises/submit', { exercise_id, user_answer }),
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
    
    getUsers: (params?: { search?: string; page?: number; limit?: number; role?: string; mshv?: string }) =>
      this.get<ApiResponse<any[]>>(`/admin/users?${new URLSearchParams(params as any).toString()}`),
    
    createUser: (data: { full_name: string; email: string; password: string; role: string; mshv?: string }) =>
      this.post<ApiResponse<any>>('/admin/users', data),
    
    updateUser: (id: string, data: { full_name?: string; role?: string; level?: number; coins?: number; mshv?: string }) =>
      this.put<ApiResponse<any>>(`/admin/users/${id}`, data),
    
    deleteUser: (id: string) => this.delete<ApiResponse<any>>(`/admin/users/${id}`),
    
    getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
      this.get<ApiResponse<any[]>>(`/admin/orders?${new URLSearchParams(params as any).toString()}`),
    
    updateOrder: (id: string, status: string) => this.put<ApiResponse<any>>(`/admin/orders/${id}`, { status }),
    
    // Course Approval
    getPendingCourses: () => this.get<ApiResponse<any[]>>('/admin/courses/pending'),
    approveCourse: (id: string) => this.put<ApiResponse<any>>(`/admin/courses/${id}/approve`, {}),
    rejectCourse: (id: string, reason: string) => this.put<ApiResponse<any>>(`/admin/courses/${id}/reject`, { reason }),
    
    // Free Users Management
    getFreeUsers: (courseId: string) => this.get<ApiResponse<any[]>>(`/admin/courses/${courseId}/free-users`),
    addFreeUser: (courseId: string, userId: string) => this.post<ApiResponse<any>>(`/admin/courses/${courseId}/free-users`, { userId, action: 'add' }),
    removeFreeUser: (courseId: string, userId: string) => this.post<ApiResponse<any>>(`/admin/courses/${courseId}/free-users`, { userId, action: 'remove' }),
    
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
    
    // Grammar Exercises
    getExercises: (lessonId: string) => this.get<ApiResponse<any[]>>(`/instructors/exercises/lesson/${lessonId}`),
    createExercise: (data: { lesson_id: string; question: string; question_type?: string; options?: string[]; correct_answer: string; explanation?: string; difficulty?: string; order_index?: number }) =>
      this.post<ApiResponse<any>>('/instructors/exercises', data),
    updateExercise: (id: string, data: { question?: string; question_type?: string; options?: string[]; correct_answer?: string; explanation?: string; difficulty?: string; order_index?: number }) =>
      this.put<ApiResponse<any>>(`/instructors/exercises/${id}`, data),
    deleteExercise: (id: string) => this.delete<ApiResponse<any>>(`/instructors/exercises/${id}`),
    
    // Vocabulary
    getVocabulary: (lessonId: string) => this.get<ApiResponse<any[]>>(`/instructors/vocabulary/lesson/${lessonId}`),
    createVocabulary: (data: { lesson_id: string; word: string; pinyin?: string; meaning: string; example_sentence?: string; audio_url?: string; image_url?: string; category?: string; hsk_level?: number }) =>
      this.post<ApiResponse<any>>('/instructors/vocabulary', data),
    updateVocabulary: (id: string, data: { word?: string; pinyin?: string; meaning?: string; example_sentence?: string; audio_url?: string; image_url?: string; category?: string; hsk_level?: number }) =>
      this.put<ApiResponse<any>>(`/instructors/vocabulary/${id}`, data),
    deleteVocabulary: (id: string) => this.delete<ApiResponse<any>>(`/instructors/vocabulary/${id}`),
    
    // Lesson Resources
    getResources: (lessonId: string) => this.get<ApiResponse<any[]>>(`/instructors/resources/lesson/${lessonId}`),
    createResource: (data: { lesson_id: string; title: string; type: string; url: string; description?: string }) =>
      this.post<ApiResponse<any>>('/instructors/resources', data),
    updateResource: (id: string, data: { title?: string; type?: string; url?: string; description?: string }) =>
      this.put<ApiResponse<any>>(`/instructors/resources/${id}`, data),
    deleteResource: (id: string) => this.delete<ApiResponse<any>>(`/instructors/resources/${id}`),
    
    // Student Progress
    getStudentProgress: (courseId: string) => this.get<ApiResponse<any[]>>(`/instructors/student-progress/${courseId}`),
    
    // Bulk Import Lessons
    importLessons: async (courseId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', courseId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/instructors/lessons/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return response.json();
    },
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
