import { Link, useLocation } from 'react-router';
import { BookOpen, Menu, User, LogOut, LayoutDashboard, Target, Users, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { PWAInstallButton } from './PWAInstallPrompt';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { profile, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Khóa học', href: '/courses' },
    { name: 'Cộng đồng', href: '/community', icon: Users },
    { name: 'Liên hệ', href: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm backdrop-blur-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Modern Flat Style */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-[var(--primary)] transition-transform group-hover:scale-110" />
            </div>
            <span className="text-2xl font-bold text-[var(--primary)]">
              HoaNgữ
            </span>
          </Link>

          {/* Desktop Navigation - Clean & Minimal */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.href
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-foreground hover:bg-[var(--muted)]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette */}
            <CommandPalette />
            
            {/* PWA Install */}
            <PWAInstallButton />

            {/* Notifications */}
            {isAuthenticated && <NotificationCenter />}

            {isAuthenticated ? (
              <>
                {/* User Menu - Modern Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                      {profile?.full_name?.[0] || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {profile?.full_name || 'User'}
                    </span>
                  </button>

                  {/* Dropdown Menu - Flat Style */}
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                        <div className="p-3 border-b border-border bg-[var(--muted)]">
                          <p className="font-semibold text-sm">{profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email}</p>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          
                          <Link
                            to="/gamification"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Target className="h-4 w-4" />
                            Gamification
                          </Link>
                          
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Hồ sơ
                          </Link>
                          
                          <div className="border-t border-border my-1" />
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left text-error hover:bg-error-light transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-[var(--primary)] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-all shadow-sm hover:shadow-md"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Modern Slide */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-border">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-foreground hover:bg-[var(--muted)]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {!isAuthenticated && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  to="/login"
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[var(--muted)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium text-center hover:bg-[var(--primary-hover)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}