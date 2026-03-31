import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      action: () => navigate('/'),
      description: 'Trang chủ',
    },
    {
      key: 'd',
      ctrl: true,
      action: () => navigate('/dashboard'),
      description: 'Dashboard',
    },
    {
      key: 'c',
      ctrl: true,
      action: () => navigate('/courses'),
      description: 'Khóa học',
    },
    {
      key: 'f',
      ctrl: true,
      action: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Tìm kiếm',
    },
    {
      key: 'l',
      ctrl: true,
      action: () => navigate('/leaderboard'),
      description: 'Bảng xếp hạng',
    },
    {
      key: 's',
      ctrl: true,
      action: () => navigate('/settings'),
      description: 'Cài đặt',
    },
    {
      key: '?',
      shift: true,
      action: () => {
        const helpModal = document.querySelector('[data-shortcuts-modal]');
        if (helpModal) {
          (helpModal as HTMLElement).click();
        }
      },
      description: 'Hiển thị phím tắt',
    },
    {
      key: 'Escape',
      action: () => {
        document.dispatchEvent(new CustomEvent('modal:close'));
      },
      description: 'Đóng modal',
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;
    
    if (isInput && event.key !== 'Escape') return;

    const shortcut = shortcuts.find(s => {
      const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!s.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = !!s.shift === event.shiftKey;
      const altMatch = !!s.alt === event.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

// Keyboard shortcuts modal component
export function KeyboardShortcutsModal() {
  const { shortcuts } = useKeyboardShortcuts();

  return (
    <div className="text-sm">
      <h3 className="font-semibold mb-4">Phím tắt bàn phím</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-muted-foreground">{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
              {shortcut.ctrl && 'Ctrl + '}
              {shortcut.shift && 'Shift + '}
              {shortcut.alt && 'Alt + '}
              {shortcut.key.toUpperCase()}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
