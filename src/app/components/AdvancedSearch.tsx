import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { searchEngine, SearchFilters } from '../utils/searchEngine';
import { motion, AnimatePresence } from 'motion/react';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClose?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  filterOptions?: {
    categories?: string[];
    levels?: string[];
    tags?: string[];
  };
  asModal?: boolean;
}

export function AdvancedSearch({
  onSearch,
  onClose,
  placeholder = 'Tìm kiếm khóa học, bài học, từ vựng...',
  showFilters = true,
  filterOptions,
  asModal = false,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get suggestions when query changes
    if (query.length > 0) {
      const sug = searchEngine.getSuggestions(query);
      setSuggestions(sug);
      setShowSuggestions(sug.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onSearch(query, filters);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onSearch(query, {});
  };

  const popularSearches = searchEngine.getPopularSearches();
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                showFilterPanel || activeFilterCount > 0
                  ? 'border-[var(--theme-primary)] bg-accent text-[var(--theme-primary)]'
                  : 'border-border hover:border-[var(--theme-primary)]/50 text-foreground'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline font-semibold">Lọc</span>
              {activeFilterCount > 0 && (
                <span className="bg-[var(--theme-primary)] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white px-6"
          >
            Tìm
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Tìm kiếm gần đây
                </div>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded transition-colors text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {popularSearches.length > 0 && (
              <div className="border-t border-border p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Tìm kiếm phổ biến
                </div>
                <div className="flex flex-wrap gap-2 px-3 py-2">
                  {popularSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="px-3 py-1 bg-accent hover:bg-accent/80 rounded-full text-sm text-foreground transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Bộ lọc nâng cao</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-[var(--theme-primary)] hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                {filterOptions?.categories && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Danh mục
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                    >
                      <option value="">Tất cả</option>
                      {filterOptions.categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Level Filter */}
                {filterOptions?.levels && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Cấp độ
                    </label>
                    <select
                      value={filters.level || ''}
                      onChange={(e) => setFilters({ ...filters, level: e.target.value || undefined })}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                    >
                      <option value="">Tất cả</option>
                      {filterOptions.levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Đánh giá tối thiểu
                  </label>
                  <select
                    value={filters.rating || ''}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  >
                    <option value="">Tất cả</option>
                    <option value="4.5">4.5+ ⭐</option>
                    <option value="4.0">4.0+ ⭐</option>
                    <option value="3.5">3.5+ ⭐</option>
                    <option value="3.0">3.0+ ⭐</option>
                  </select>
                </div>
              </div>

              {/* Tags Filter */}
              {filterOptions?.tags && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.tags.map((tag) => {
                      const isSelected = filters.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            const currentTags = filters.tags || [];
                            const newTags = isSelected
                              ? currentTags.filter(t => t !== tag)
                              : [...currentTags, tag];
                            setFilters({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[var(--theme-primary)] text-white'
                              : 'bg-accent text-foreground hover:bg-accent/80'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  onClick={() => setShowFilterPanel(false)}
                  variant="outline"
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
                >
                  Áp dụng
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}