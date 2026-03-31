import { Link, useLocation } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'my-courses': 'Khóa học của tôi',
  'courses': 'Khóa học',
  'settings': 'Cài đặt',
  'schedule': 'Lịch học',
  'analytics': 'Phân tích',
  'community': 'Cộng đồng',
  'flashcards': 'Flashcards',
  'certificates': 'Chứng chỉ',
  'gamification': 'Gamification',
  'quests': 'Nhiệm vụ',
  'shop': 'Cửa hàng',
  'contact': 'Liên hệ',
  'auth': 'Đăng nhập',
  'admin': 'Quản trị',
};

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const location = useLocation();

  // If custom items provided, use them
  if (items && items.length > 0) {
    return (
      <nav className={`flex items-center gap-2 text-sm ${className}`}>
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        
        {items.map((item, index) => (
          <div key={item.path} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    );
  }

  // Auto-generate from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return null; // Don't show breadcrumbs on home page
  }

  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return { label, path };
  });

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      <Link
        to="/"
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Trang chủ</span>
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
