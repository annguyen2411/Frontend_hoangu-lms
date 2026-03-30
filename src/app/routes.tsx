import { createBrowserRouter, Navigate, useNavigate } from 'react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { PageLoader } from './components/PageLoader';
import { getDashboardPath } from './components/RoleRouteGuard';
import { useAuth } from './contexts/AuthContext';
import { adminAuthUtils } from './utils/adminAuth';

const Courses = lazy(() => import('./pages/Courses').then(m => ({ default: m.Courses })));
const CourseDetail = lazy(() => import('./pages/CourseDetail').then(m => ({ default: m.CourseDetail })));
const Learn = lazy(() => import('./pages/Learn').then(m => ({ default: m.Learn })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const DashboardLayout = lazy(() => import('./components/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const Overview = lazy(() => import('./pages/dashboard/Overview').then(m => ({ default: m.Overview })));
const MyCourses = lazy(() => import('./pages/dashboard/MyCourses').then(m => ({ default: m.MyCourses })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Schedule = lazy(() => import('./pages/Schedule').then(m => ({ default: m.Schedule })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Community = lazy(() => import('./pages/Community').then(m => ({ default: m.Community })));
const Flashcards = lazy(() => import('./pages/Flashcards').then(m => ({ default: m.Flashcards })));
const Certificates = lazy(() => import('./pages/Certificates').then(m => ({ default: m.Certificates })));
const Gamification = lazy(() => import('./pages/Gamification').then(m => ({ default: m.Gamification })));
const Quests = lazy(() => import('./pages/Quests').then(m => ({ default: m.Quests })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Achievements = lazy(() => import('./pages/Achievements').then(m => ({ default: m.Achievements })));
const StudyGroups = lazy(() => import('./pages/StudyGroups').then(m => ({ default: m.StudyGroups })));
const Friends = lazy(() => import('./pages/Friends').then(m => ({ default: m.Friends })));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard').then(m => ({ default: m.InstructorDashboard })));
const InstructorLayout = lazy(() => import('./components/InstructorLayout').then(m => ({ default: m.InstructorLayout })));
const Practice = lazy(() => import('./pages/Practice').then(m => ({ default: m.Practice })));
const VoicePractice = lazy(() => import('./pages/VoicePractice').then(m => ({ default: m.VoicePractice })));
const Recommendations = lazy(() => import('./pages/Recommendations').then(m => ({ default: m.Recommendations })));
const LearningHistory = lazy(() => import('./pages/LearningHistory').then(m => ({ default: m.LearningHistory })));
const Goals = lazy(() => import('./pages/Goals').then(m => ({ default: m.Goals })));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses').then(m => ({ default: m.AdminCourses })));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents').then(m => ({ default: m.AdminStudents })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminInstructors = lazy(() => import('./pages/admin/AdminInstructors').then(m => ({ default: m.AdminInstructors })));
const AdminCourseApproval = lazy(() => import('./pages/admin/AdminCourseApproval').then(m => ({ default: m.AdminCourseApproval })));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners').then(m => ({ default: m.AdminBanners })));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications').then(m => ({ default: m.AdminNotifications })));
const AdminCertificates = lazy(() => import('./pages/admin/AdminCertificates').then(m => ({ default: m.AdminCertificates })));

const Checkout = lazy(() => import('./pages/payment/Checkout').then(m => ({ default: m.default })));

const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));

function Page({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function DashboardIndex() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const path = getDashboardPath(user.role);
      if (window.location.pathname === '/dashboard') {
        window.location.href = path;
      }
    }
  }, [user, isAuthenticated, isLoading]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to={getDashboardPath(user?.role || 'student')} replace />;
}

function AdminIndex() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        if (!adminAuthUtils.isAdminAuthenticated()) {
          adminAuthUtils.syncAdminFromUser(user);
        }
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <PageLoader />;
}

export const router = createBrowserRouter([
  // Public routes with main layout
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'courses',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Courses />
          </Suspense>
        ),
      },
      {
        path: 'courses/:slug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CourseDetail />
          </Suspense>
        ),
      },
      {
        path: 'courses/:slug/learn',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Learn />
          </Suspense>
        ),
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: 'forgot-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: 'reset-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  // Checkout
  {
    path: 'checkout/:courseId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Checkout />
      </Suspense>
    ),
  },
  // Dashboard routes with sidebar
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardIndex />,
      },
      {
        path: 'dashboard/my-courses',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MyCourses />
          </Suspense>
        ),
      },
      {
        path: 'quests',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Quests />
          </Suspense>
        ),
      },
      {
        path: 'shop',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Shop />
          </Suspense>
        ),
      },
      {
        path: 'leaderboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Leaderboard />
          </Suspense>
        ),
      },
      {
        path: 'achievements',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Achievements />
          </Suspense>
        ),
      },
      {
        path: 'study-groups',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StudyGroups />
          </Suspense>
        ),
      },
      {
        path: 'friends',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Friends />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: 'schedule',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Schedule />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: 'community',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Community />
          </Suspense>
        ),
      },
      {
        path: 'flashcards',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Flashcards />
          </Suspense>
        ),
      },
      {
        path: 'certificates',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Certificates />
          </Suspense>
        ),
      },
      {
        path: 'gamification',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Gamification />
          </Suspense>
        ),
      },
      {
        path: 'practice',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Practice />
          </Suspense>
        ),
      },
      {
        path: 'voice-practice',
        element: (
          <Suspense fallback={<PageLoader />}>
            <VoicePractice />
          </Suspense>
        ),
      },
      {
        path: 'recommendations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Recommendations />
          </Suspense>
        ),
      },
      {
        path: 'history',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LearningHistory />
          </Suspense>
        ),
      },
      {
        path: 'goals',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Goals />
          </Suspense>
        ),
      },
    ],
  },
  // Instructor routes
  {
    path: 'instructor',
    element: (
      <Suspense fallback={<PageLoader />}>
        <InstructorLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/instructor/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
      {
        path: 'courses',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
      {
        path: 'students',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
      {
        path: 'revenue',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
      {
        path: 'quizzes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
      {
        path: 'messages',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstructorDashboard />
          </Suspense>
        ),
      },
    ],
  },
  // Admin routes
  {
    path: 'admin',
    children: [
      {
        index: true,
        element: <AdminIndex />,
      },
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminLayout />
          </Suspense>
        ),
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: 'courses',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminCourses />
              </Suspense>
            ),
          },
          {
            path: 'users',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminStudents />
              </Suspense>
            ),
          },
          {
            path: 'orders',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminOrders />
              </Suspense>
            ),
          },
          {
            path: 'coupons',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminCoupons />
              </Suspense>
            ),
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminAnalytics />
              </Suspense>
            ),
          },
          {
            path: 'instructors',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminInstructors />
              </Suspense>
            ),
          },
          {
            path: 'course-approval',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminCourseApproval />
              </Suspense>
            ),
          },
          {
            path: 'banners',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminBanners />
              </Suspense>
            ),
          },
          {
            path: 'notifications',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminNotifications />
              </Suspense>
            ),
          },
          {
            path: 'certificates',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminCertificates />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminSettings />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);