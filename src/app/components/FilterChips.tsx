import { X } from 'lucide-react';
import { SearchFilters } from '../utils/smartSearch';

interface FilterChipsProps {
  filters: Partial<SearchFilters>;
  onRemoveFilter: (key: keyof SearchFilters, value?: any) => void;
  onClearAll: () => void;
}

export function FilterChips({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  const activeFilters: Array<{ key: keyof SearchFilters; label: string; value?: any }> = [];

  // Levels
  if (filters.levels && filters.levels.length > 0) {
    filters.levels.forEach(level => {
      activeFilters.push({ key: 'levels', label: level, value: level });
    });
  }

  // Duration
  if (filters.duration && filters.duration.length > 0) {
    filters.duration.forEach(dur => {
      const labels: Record<string, string> = {
        '0-3': '0-3 tháng',
        '3-6': '3-6 tháng',
        '6+': '6+ tháng'
      };
      activeFilters.push({ key: 'duration', label: labels[dur] || dur, value: dur });
    });
  }

  // Price range
  if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000)) {
    const [min, max] = filters.priceRange;
    let label = '';
    if (max === 0) {
      label = 'Miễn phí';
    } else if (min === 0) {
      label = `< ${(max / 1000000).toFixed(0)}tr`;
    } else {
      label = `${(min / 1000000).toFixed(0)}-${(max / 1000000).toFixed(0)}tr`;
    }
    activeFilters.push({ key: 'priceRange', label });
  }

  // Rating
  if (filters.rating && filters.rating > 0) {
    activeFilters.push({ key: 'rating', label: `${filters.rating}★+` });
  }

  // Sort by
  if (filters.sortBy && filters.sortBy !== 'relevance') {
    const sortLabels: Record<string, string> = {
      'price-asc': 'Giá thấp → cao',
      'price-desc': 'Giá cao → thấp',
      'rating': 'Đánh giá cao',
      'newest': 'Mới nhất',
      'popular': 'Phổ biến'
    };
    activeFilters.push({ key: 'sortBy', label: sortLabels[filters.sortBy] });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-muted-foreground">Bộ lọc:</span>
      
      {activeFilters.map((filter, idx) => (
        <button
          key={`${filter.key}-${filter.value || idx}`}
          onClick={() => onRemoveFilter(filter.key, filter.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-full text-sm font-semibold hover:bg-[var(--theme-primary)]/20 transition-colors group"
        >
          <span>{filter.label}</span>
          <X className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        </button>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
}
