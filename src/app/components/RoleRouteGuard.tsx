import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

type UserRole = 'student' | 'instructor' | 'admin';

interface RoleRouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleRouteGuard({ allowedRoles, children }: RoleRouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to={`/${user?.role || 'dashboard'}`} replace />;
  }

  return <>{children}</>;
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    default:
      return '/dashboard';
  }
}
