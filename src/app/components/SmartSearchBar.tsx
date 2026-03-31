import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { smartSearch } from '../utils/smartSearch';

interface SmartSearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
  onFilterClick?: () => void;
  showFilterButton?: boolean;
}

export function SmartSearchBar({
  placeholder = 'Tìm kiếm khóa học...',
  onSearch,
  suggestions = [],
  onFilterClick,
  showFilterButton = true
}: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(
      smartSearch.getSearchHistory()
        .slice(0, 5)
        .map(h => h.query)
        .filter(Boolean)
    );
    setPopular(smartSearch.getPopularSearches(5));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
    onSearch('');
  };

  const allSuggestions = [...new Set([...suggestions, ...history])].slice(0, 8);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-12 pr-12 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {showFilterButton && (
            <button
              type="button"
              onClick={onFilterClick}
              className="px-4 py-3 bg-accent hover:bg-accent/80 border-2 border-border rounded-xl flex items-center gap-2 font-semibold text-foreground transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Lọc</span>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (query.length > 0 || history.length > 0 || popular.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-xl shadow-lg overflow-hidden z-50"
          >
            {/* Auto-complete Suggestions */}
            {allSuggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Gợi ý tìm kiếm
                </div>
                {allSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground flex-1 truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {popular.length > 0 && query.length === 0 && (
              <div className="p-2 border-t border-border">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tìm kiếm phổ biến
                </div>
                {popular.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <TrendingUp className="h-4 w-4 text-[var(--theme-primary)] flex-shrink-0" />
                    <span className="text-foreground flex-1 truncate">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Clear History */}
            {history.length > 0 && query.length === 0 && (
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => {
                    smartSearch.clearSearchHistory();
                    setHistory([]);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                >
                  Xóa lịch sử tìm kiếm
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}