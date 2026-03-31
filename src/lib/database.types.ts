export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: string;
          level: number;
          xp: number;
          total_xp: number;
          xp_to_next_level: number;
          coins: number;
          streak: number;
          completed_quests: number;
          language: string;
          theme: string;
          notification_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          xp_to_next_level?: number;
          coins?: number;
          streak?: number;
          completed_quests?: number;
          language?: string;
          theme?: string;
          notification_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          xp_to_next_level?: number;
          coins?: number;
          streak?: number;
          completed_quests?: number;
          language?: string;
          theme?: string;
          notification_enabled?: boolean;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          teacher_name: string | null;
          level: string;
          category: string | null;
          price_vnd: number;
          original_price_vnd: number | null;
          discount_percent: number;
          rating: number;
          students_enrolled: number;
          total_lessons: number;
          duration_hours: number | null;
          has_certificate: boolean;
          is_published: boolean;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          teacher_name?: string | null;
          level: string;
          category?: string | null;
          price_vnd: number;
          original_price_vnd?: number | null;
          discount_percent?: number;
          rating?: number;
          students_enrolled?: number;
          total_lessons?: number;
          duration_hours?: number | null;
          has_certificate?: boolean;
          is_published?: boolean;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          teacher_name?: string | null;
          level?: string;
          category?: string | null;
          price_vnd?: number;
          original_price_vnd?: number | null;
          discount_percent?: number;
          rating?: number;
          students_enrolled?: number;
          total_lessons?: number;
          duration_hours?: number | null;
          has_certificate?: boolean;
          is_published?: boolean;
          is_featured?: boolean;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string | null;
          title: string;
          description: string | null;
          order_index: number;
          video_url: string | null;
          video_duration: number | null;
          is_free: boolean;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          title: string;
          description?: string | null;
          order_index: number;
          video_url?: string | null;
          video_duration?: number | null;
          is_free?: boolean;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          title?: string;
          description?: string | null;
          order_index?: number;
          video_url?: string | null;
          video_duration?: number | null;
          is_free?: boolean;
          is_published?: boolean;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          status: string;
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress?: number;
          status?: string;
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          progress?: number;
          status?: string;
          enrolled_at?: string;
          completed_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          amount_vnd: number;
          payment_method: string;
          status: string;
          transaction_id: string | null;
          note: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          amount_vnd: number;
          payment_method: string;
          status?: string;
          transaction_id?: string | null;
          note?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          amount_vnd?: number;
          payment_method?: string;
          status?: string;
          transaction_id?: string | null;
          note?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          is_completed: boolean;
          watched_seconds: number;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          is_completed?: boolean;
          watched_seconds?: number;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          is_completed?: boolean;
          watched_seconds?: number;
          completed_at?: string | null;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quests: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: string;
          target: number;
          rewards: Json;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: string;
          target?: number;
          rewards?: Json;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          target?: number;
          rewards?: Json;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
      };
      user_quest_progress: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string;
          progress: number;
          is_completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_id: string;
          progress?: number;
          is_completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          quest_id?: string;
          progress?: number;
          is_completed?: boolean;
          completed_at?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          requirement: Json;
          reward: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          requirement: Json;
          reward?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          requirement?: Json;
          reward?: Json;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          xp: number;
          coins: number;
          streak: number;
          lessons_completed: number;
          rank: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xp?: number;
          coins?: number;
          streak?: number;
          lessons_completed?: number;
          rank?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          xp?: number;
          coins?: number;
          streak?: number;
          lessons_completed?: number;
          rank?: number | null;
          updated_at?: string;
        };
      };
      shop_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          price: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: string;
          price: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          price?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_shop_purchases: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          purchased_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          purchased_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          purchased_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type: string;
          tags: Json;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          type?: string;
          tags?: Json;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          type?: string;
          tags?: Json;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      post_comments: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      study_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          is_public: boolean;
          member_limit: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          is_public?: boolean;
          member_limit?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          is_public?: boolean;
          member_limit?: number;
          created_by?: string | null;
          created_at?: string;
        };
      };
      study_group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          description: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          description: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          description?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      increment_course_enrolled: {
        Args: {
          course_id: string;
        };
        Returns: undefined;
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type Setting = Database['public']['Tables']['settings']['Row'];
export type Quest = Database['public']['Tables']['quests']['Row'];
export type UserQuestProgress = Database['public']['Tables']['user_quest_progress']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
export type Leaderboard = Database['public']['Tables']['leaderboard']['Row'];
export type ShopItem = Database['public']['Tables']['shop_items']['Row'];
export type UserShopPurchase = Database['public']['Tables']['user_shop_purchases']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostComment = Database['public']['Tables']['post_comments']['Row'];
export type StudyGroup = Database['public']['Tables']['study_groups']['Row'];
export type StudyGroupMember = Database['public']['Tables']['study_group_members']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type Friend = Database['public']['Tables']['friends']['Row'];
