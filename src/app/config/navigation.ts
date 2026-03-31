import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Users, 
  Award,
  Zap,
  Settings,
  ShoppingBag,
  Sparkles,
  CreditCard,
  Trophy,
  GraduationCap,
  UserPlus,
  PenTool,
  TrendingUp,
  FileText,
  DollarSign,
  UserCog,
  ClipboardList,
  Megaphone,
  Bell,
  Image
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export const studentNavigation: NavItem[] = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Khóa học của tôi', href: '/dashboard/my-courses', icon: BookOpen },
  { name: 'Lịch học', href: '/schedule', icon: Calendar },
  { name: 'Phân tích', href: '/analytics', icon: BarChart3 },
  { name: 'Cộng đồng', href: '/community', icon: Users },
  { name: 'Nhóm học tập', href: '/study-groups', icon: Users },
  { name: 'Bạn bè', href: '/friends', icon: UserPlus },
  { name: 'Chứng chỉ', href: '/certificates', icon: Award },
  { name: 'Flashcards', href: '/flashcards', icon: Sparkles },
  { name: 'Nhiệm vụ', href: '/quests', icon: Zap },
  { name: 'Thành tựu', href: '/achievements', icon: Trophy },
  { name: 'Xếp hạng', href: '/leaderboard', icon: Trophy },
  { name: 'Cửa hàng', href: '/shop', icon: ShoppingBag },
  { name: 'Gamification', href: '/gamification', icon: CreditCard },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export const instructorNavigation: NavItem[] = [
  { name: 'Tổng quan', href: '/instructor/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Quản lý khóa học', href: '/instructor/courses', icon: BookOpen },
  { name: 'Học viên', href: '/instructor/students', icon: Users },
  { name: 'Doanh thu', href: '/instructor/revenue', icon: DollarSign },
  { name: 'Phân tích', href: '/instructor/analytics', icon: TrendingUp },
  { name: 'Bài tập & Quiz', href: '/instructor/quizzes', icon: ClipboardList },
  { name: 'Thông báo', href: '/instructor/messages', icon: Bell },
  { name: 'Cài đặt', href: '/instructor/settings', icon: Settings },
];

export const adminNavigation: NavItem[] = [
  { name: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Quản lý khóa học', href: '/admin/courses', icon: BookOpen },
  { name: 'Quản lý người dùng', href: '/admin/users', icon: Users },
  { name: 'Quản lý giáo viên', href: '/admin/instructors', icon: GraduationCap },
  { name: 'Duyệt khóa học', href: '/admin/course-approval', icon: PenTool },
  { name: 'Đơn hàng', href: '/admin/orders', icon: FileText },
  { name: 'Mã giảm giá', href: '/admin/coupons', icon: CreditCard },
  { name: 'Phân tích', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Banner', href: '/admin/banners', icon: Image },
  { name: 'Thông báo', href: '/admin/notifications', icon: Megaphone },
  { name: 'Chứng chỉ', href: '/admin/certificates', icon: Award },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
];

export const guestNavigation: NavItem[] = [
  { name: 'Trang chủ', href: '/', icon: LayoutDashboard, exact: true },
  { name: 'Khóa học', href: '/courses', icon: BookOpen },
  { name: 'Liên hệ', href: '/contact', icon: Users },
];

export function getNavigationForRole(role: string | undefined): NavItem[] {
  switch (role) {
    case 'admin':
      return adminNavigation;
    case 'instructor':
      return instructorNavigation;
    case 'student':
    default:
      return studentNavigation;
  }
}

export function getDashboardTitle(role: string | undefined): string {
  switch (role) {
    case 'admin':
      return 'Quản trị';
    case 'instructor':
      return 'Giáo viên';
    case 'student':
    default:
      return 'Học viên';
  }
}
