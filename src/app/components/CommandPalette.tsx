import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, BookOpen, Calendar, Trophy, Settings, 
  LogOut, Home, Users, Award, Zap, X 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Action {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  keywords?: string[];
  section?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const actions: Action[] = [
    // Navigation
    { 
      id: 'home', 
      label: 'Trang chủ', 
      icon: Home, 
      action: () => navigate('/'),
      keywords: ['trang chu', 'home'],
      section: 'Navigation'
    },
    { 
      id: 'courses', 
      label: 'Khóa học', 
      icon: BookOpen, 
      action: () => navigate('/courses'),
      keywords: ['khoa hoc', 'courses', 'learn'],
      section: 'Navigation'
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Zap, 
      action: () => navigate('/dashboard'),
      keywords: ['dashboard', 'overview'],
      section: 'Navigation'
    },
    
    // Learning
    { 
      id: 'my-courses', 
      label: 'Khóa học của tôi', 
      icon: BookOpen, 
      action: () => navigate('/dashboard/my-courses'),
      keywords: ['khoa hoc cua toi', 'my courses'],
      section: 'Learning'
    },
    { 
      id: 'schedule', 
      label: 'Lịch học', 
      icon: Calendar, 
      action: () => navigate('/schedule'),
      keywords: ['lich hoc', 'schedule', 'calendar'],
      section: 'Learning'
    },
    { 
      id: 'flashcards', 
      label: 'Flashcards', 
      icon: Award, 
      action: () => navigate('/flashcards'),
      keywords: ['flashcard', 'tu vung', 'vocabulary'],
      section: 'Learning'
    },
    
    // Gamification
    { 
      id: 'quests', 
      label: 'Nhiệm vụ', 
      icon: Trophy, 
      action: () => navigate('/quests'),
      keywords: ['nhiem vu', 'quests', 'missions'],
      section: 'Gamification'
    },
    { 
      id: 'leaderboard', 
      label: 'Bảng xếp hạng', 
      icon: Trophy, 
      action: () => navigate('/gamification'),
      keywords: ['bang xep hang', 'leaderboard', 'ranking'],
      section: 'Gamification'
    },
    { 
      id: 'shop', 
      label: 'Cửa hàng', 
      icon: Award, 
      action: () => navigate('/shop'),
      keywords: ['cua hang', 'shop', 'items'],
      section: 'Gamification'
    },
    
    // Social
    { 
      id: 'community', 
      label: 'Cộng đồng', 
      icon: Users, 
      action: () => navigate('/community'),
      keywords: ['cong dong', 'community', 'social'],
      section: 'Social'
    },
    
    // Settings
    { 
      id: 'settings', 
      label: 'Cài đặt', 
      icon: Settings, 
      action: () => navigate('/settings'),
      keywords: ['cai dat', 'settings', 'preferences'],
      section: 'Settings'
    },
  ];

  if (isAuthenticated) {
    actions.push({
      id: 'logout',
      label: 'Đăng xuất',
      icon: LogOut,
      action: () => {
        logout();
        setIsOpen(false);
        navigate('/');
      },
      keywords: ['dang xuat', 'logout', 'sign out'],
      section: 'Account'
    });
  }

  const filteredActions = query === ''
    ? actions
    : actions.filter(action => {
        const searchText = query.toLowerCase();
        const labelMatch = action.label.toLowerCase().includes(searchText);
        const keywordMatch = action.keywords?.some(kw => kw.includes(searchText));
        return labelMatch || keywordMatch;
      });

  // Group actions by section
  const groupedActions = filteredActions.reduce((acc, action) => {
    const section = action.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  // Keyboard shortcut to open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleActionClick = (action: Action) => {
    action.action();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-accent rounded-lg hover:bg-accent/80 transition-colors border border-border"
      >
        <Search className="h-4 w-4" />
        <span>Tìm kiếm...</span>
        <kbd className="px-2 py-0.5 text-xs bg-background border border-border rounded">
          ⌘K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Command Palette */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="w-full max-w-2xl bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm hành động..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {Object.entries(groupedActions).length > 0 ? (
                    Object.entries(groupedActions).map(([section, sectionActions]) => (
                      <div key={section} className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {section}
                        </div>
                        {sectionActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.id}
                              onClick={() => handleActionClick(action)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] flex items-center justify-center flex-shrink-0">
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-foreground font-medium group-hover:text-[var(--theme-primary)] transition-colors">
                                {action.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">Không tìm thấy kết quả</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border bg-accent/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Nhấn <kbd className="px-2 py-0.5 bg-background border border-border rounded">ESC</kbd> để đóng</span>
                    <span><kbd className="px-2 py-0.5 bg-background border border-border rounded">↵</kbd> để chọn</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
