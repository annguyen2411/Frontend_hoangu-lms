# 🔧 Backend Integration Guide - Supabase

**Goal:** Replace mock data with real Supabase backend  
**Time:** Week 1-2 (10-15 hours)  
**Difficulty:** Medium

---

## 📚 Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Database Schema](#database-schema)
3. [Environment Variables](#environment-variables)
4. [Authentication](#authentication)
5. [Data Fetching](#data-fetching)
6. [Testing](#testing)

---

## 🚀 Supabase Setup

### Step 1: Create Account

**Go to:** https://supabase.com

```
1. Click "Start your project"
2. Sign up with GitHub (recommended)
3. Verify email
4. Login to dashboard
```

---

### Step 2: Create New Project

**In Supabase Dashboard:**

```
1. Click "New Project"
2. Fill in:
   - Name: hoangữ-production
   - Database Password: [STRONG PASSWORD - SAVE THIS!]
   - Region: Southeast Asia (Singapore)
   - Pricing: Free tier

3. Click "Create new project"
4. Wait 2-3 minutes for setup
```

---

### Step 3: Get API Credentials

**In Project Settings:**

```
1. Click "Settings" (gear icon)
2. Click "API"
3. Copy these values:

   ✅ Project URL: https://xxxxx.supabase.co
   ✅ anon public key: eyJhbGc...
   ✅ service_role key: eyJhbGc... (keep secret!)

4. Save to password manager!
```

---

## 🗄️ Database Schema

### Step 1: Open SQL Editor

**In Supabase Dashboard:**

```
1. Click "SQL Editor" (left sidebar)
2. Click "New Query"
```

---

### Step 2: Run Schema

**Copy content from `/supabase_setup.sql` and run:**

```sql
-- This file already exists in your project
-- Just copy & paste entire content into SQL Editor
-- Click "Run" button

-- It will create:
-- ✅ users table
-- ✅ courses table
-- ✅ lessons table
-- ✅ enrollments table
-- ✅ progress table
-- ✅ quests table
-- ✅ user_quests table
-- ✅ badges table
-- ✅ shop_items table
-- ... and more
```

**Result:**
```
Success. No rows returned
```

✅ All tables created!

---

### Step 3: Enable Row Level Security (RLS)

**For each table, run:**

```sql
-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

---

### Step 4: Create Security Policies

**Courses (public read, admin write):**

```sql
-- Anyone can read courses
CREATE POLICY "Courses are viewable by everyone"
ON courses FOR SELECT
USING (true);

-- Only authenticated users with admin role can insert/update
CREATE POLICY "Admins can manage courses"
ON courses FOR ALL
USING (auth.uid() IN (
  SELECT id FROM user_profiles WHERE role = 'admin'
));
```

**Enrollments (user can read own, authenticated can create):**

```sql
-- Users can see their own enrollments
CREATE POLICY "Users can view own enrollments"
ON enrollments FOR SELECT
USING (auth.uid() = user_id);

-- Users can create enrollments
CREATE POLICY "Users can create enrollments"
ON enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Progress (user can read/update own):**

```sql
-- Users can view own progress
CREATE POLICY "Users can view own progress"
ON progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own progress
CREATE POLICY "Users can update own progress"
ON progress FOR UPDATE
USING (auth.uid() = user_id);

-- Users can create progress
CREATE POLICY "Users can create progress"
ON progress FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Copy all policies from `supabase_setup.sql` - they're already written!**

---

## 🔐 Environment Variables

### Step 1: Create `.env.local`

**In project root:**

```bash
touch .env.local
```

---

### Step 2: Add Variables

**Edit `.env.local`:**

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Optional (for admin functions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Environment
VITE_APP_ENV=development
```

**Replace with your actual values from Step 3 of Supabase Setup!**

---

### Step 3: Add to `.gitignore`

**Ensure `.env.local` is in `.gitignore`:**

```gitignore
# Environment variables
.env.local
.env.production
.env*.local
```

✅ Never commit secrets to Git!

---

## 🔌 Installation & Setup

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @tanstack/react-query
```

---

### Step 2: Create Supabase Client

**Create `/src/lib/supabase.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will add later)
export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          level: string;
          price: number;
          created_at: string;
          // ... add all fields
        };
      };
      // ... other tables
    };
  };
};
```

---

### Step 3: Test Connection

**Create `/src/lib/testSupabase.ts`:**

```typescript
import { supabase } from './supabase';

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('count');
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connected!', data);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}
```

**Run in browser console:**

```typescript
import { testConnection } from './lib/testSupabase';
testConnection();
```

✅ Should see: "Supabase connected!"

---

## 🔐 Authentication Implementation

### Step 1: Update AuthContext

**Edit `/src/app/contexts/AuthContext.tsx`:**

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        name,
        email,
        level: 1,
        xp: 0,
        coins: 0,
        streak: 0,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

### Step 2: Update Auth Page

**Edit `/src/app/pages/Auth.tsx`:**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        await signUp(email, password, name);
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </Button>
        </form>

        <p className="text-center mt-4">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}
```

---

## 📊 Data Fetching with React Query

### Step 1: Setup QueryClient

**Edit `/src/app/App.tsx`:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router';
import { router } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

### Step 2: Create API Hooks

**Create `/src/app/hooks/api/useCourses.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  hsk_level: number;
  price: number;
  duration: number;
  image_url: string;
  teacher_name: string;
  students_count: number;
  rating: number;
  created_at: string;
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
```

**Create `/src/app/hooks/api/useEnrollments.ts`:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function useEnrollments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user!.id,
          course_id: courseId,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}
```

---

### Step 3: Update Components to Use Hooks

**Edit `/src/app/pages/Courses.tsx`:**

```typescript
import { useCourses } from '../hooks/api/useCourses';
import { Loader2 } from 'lucide-react';

export default function Courses() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Lỗi: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Khóa Học</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Testing

### Test Checklist

**Authentication:**
- [ ] Sign up new user
- [ ] Verify email confirmation sent
- [ ] Login with credentials
- [ ] Stay logged in on refresh
- [ ] Logout works
- [ ] Error messages display

**Data Fetching:**
- [ ] Courses load from database
- [ ] Single course loads with lessons
- [ ] Enrollments show for user
- [ ] Progress updates save

**Error Handling:**
- [ ] Network errors caught
- [ ] Loading states shown
- [ ] Empty states handled
- [ ] Toast notifications work

---

## 🐛 Common Issues & Solutions

### Issue 1: "Missing environment variables"

**Solution:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify variables are set
cat .env.local

# Restart dev server
npm run dev
```

---

### Issue 2: "Row Level Security policy violation"

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT * FROM pg_policies 
WHERE schemaname = 'public';

-- Disable RLS temporarily for testing (NOT in production!)
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
```

---

### Issue 3: "Cannot read properties of null"

**Solution:**
```typescript
// Add loading check
if (loading) return <Loader />;
if (!user) return <Login />;

// Use optional chaining
const name = user?.user_metadata?.name;

// Use nullish coalescing
const level = user?.level ?? 1;
```

---

### Issue 4: "CORS error"

**Solution:**
- Check Supabase URL is correct
- Verify API key is correct
- Check if using `https://` not `http://`
- Try in incognito mode

---

## 📚 Next Steps

**After completing this guide:**

1. ✅ Read `/CONTENT_CREATION_GUIDE.md`
2. ✅ Seed database with real course data
3. ✅ Test all features end-to-end
4. ✅ Move to Week 3 (Content Creation)

---

## 🔗 Resources

**Supabase Docs:**
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- RLS: https://supabase.com/docs/guides/auth/row-level-security

**React Query Docs:**
- https://tanstack.com/query/latest

**Troubleshooting:**
- Supabase Discord: https://discord.supabase.com
- Stack Overflow: tag `supabase`

---

**Last Updated:** March 14, 2026  
**Estimated Time:** 10-15 hours  
**Difficulty:** ⭐⭐⭐ Medium

---

**Good luck! You got this! 💪**
