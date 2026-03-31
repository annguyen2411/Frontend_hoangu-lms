import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  Image,
  Bell,
  Award,
  CheckCircle
} from 'lucide-react';
import { adminAuthUtils } from '../../utils/adminAuth';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = adminAuthUtils.getCurrentAdmin();

  useEffect(() => {
    if (!admin) {
      navigate('/admin');
    }
  }, [admin, navigate]);

  const handleLogout = () => {
    adminAuthUtils.adminLogout();
    navigate('/admin');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Quản lý khóa học', href: '/admin/courses', icon: BookOpen },
    { name: 'Duyệt khóa học', href: '/admin/course-approval', icon: CheckCircle },
    { name: 'Quản lý giảng viên', href: '/admin/instructors', icon: GraduationCap },
    { name: 'Quản lý người dùng', href: '/admin/users', icon: Users },
    { name: 'Thanh toán & Đơn hàng', href: '/admin/orders', icon: CreditCard },
    { name: 'Mã giảm giá', href: '/admin/coupons', icon: Tag },
    { name: 'Banner', href: '/admin/banners', icon: Image },
    { name: 'Thông báo', href: '/admin/notifications', icon: Bell },
    { name: 'Chứng chỉ', href: '/admin/certificates', icon: Award },
    { name: 'Báo cáo Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ];

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-red-600" />
              <div>
                <span className="text-xl font-bold text-gray-900">HoaNgữ Admin</span>
                <div className="text-xs text-gray-500">Management System</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">{admin.name}</div>
              <div className="text-xs text-gray-500">{admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2 overflow-y-auto h-full">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
