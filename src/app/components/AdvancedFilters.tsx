import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, DollarSign, Star, Clock, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import { Checkbox } from './ui/Checkbox';
import { SearchFilters, smartSearch } from '../utils/smartSearch';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Partial<SearchFilters>) => void;
  initialFilters?: Partial<SearchFilters>;
}

export function AdvancedFilters({ isOpen, onClose, onApply, initialFilters = {} }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<Partial<SearchFilters>>(initialFilters);
  const presets = smartSearch.getFilterPresets();

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const handlePresetClick = (preset: any) => {
    setFilters(preset.filters);
  };

  const toggleLevel = (level: string) => {
    const current = filters.levels || [];
    if (current.includes(level)) {
      setFilters({ ...filters, levels: current.filter(l => l !== level) });
    } else {
      setFilters({ ...filters, levels: [...current, level] });
    }
  };

  const toggleDuration = (duration: string) => {
    const current = filters.duration || [];
    if (current.includes(duration)) {
      setFilters({ ...filters, duration: current.filter(d => d !== duration) });
    } else {
      setFilters({ ...filters, duration: [...current, duration] });
    }
  };

  const levels = [
    { id: 'HSK 1', name: 'HSK 1', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { id: 'HSK 2', name: 'HSK 2', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { id: 'HSK 3', name: 'HSK 3', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { id: 'HSK 4', name: 'HSK 4', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { id: 'HSK 5', name: 'HSK 5', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { id: 'HSK 6', name: 'HSK 6', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  ];

  const durations = [
    { id: '0-3', name: '0-3 tháng', icon: '⚡' },
    { id: '3-6', name: '3-6 tháng', icon: '📅' },
    { id: '6+', name: '6+ tháng', icon: '📚' },
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Liên quan nhất' },
    { id: 'rating', name: 'Đánh giá cao' },
    { id: 'popular', name: 'Phổ biến nhất' },
    { id: 'newest', name: 'Mới nhất' },
    { id: 'price-asc', name: 'Giá thấp đến cao' },
    { id: 'price-desc', name: 'Giá cao đến thấp' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] lg:w-[480px] bg-background z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-lg flex items-center justify-center">
                    <SlidersHorizontal className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Bộ lọc nâng cao</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Filter Presets */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-[var(--theme-primary)]" />
                  <h3 className="font-bold text-foreground">Bộ lọc nhanh</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className="p-3 border-2 border-border rounded-lg hover:border-[var(--theme-primary)] hover:bg-accent transition-all text-left"
                    >
                      <div className="text-2xl mb-1">{preset.icon}</div>
                      <div className="font-semibold text-foreground text-sm mb-1">
                        {preset.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-[var(--theme-primary)]" />
                  <Label className="font-bold text-foreground">Trình độ</Label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {levels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => toggleLevel(level.id)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                        filters.levels?.includes(level.id)
                          ? `${level.color} border-current`
                          : 'bg-accent text-foreground border-transparent hover:border-border'
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-[var(--theme-primary)]" />
                  <Label className="font-bold text-foreground">Thời lượng</Label>
                </div>
                <div className="space-y-2">
                  {durations.map(duration => (
                    <button
                      key={duration.id}
                      onClick={() => toggleDuration(duration.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                        filters.duration?.includes(duration.id)
                          ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-foreground'
                          : 'bg-accent border-transparent hover:border-border text-foreground'
                      }`}
                    >
                      <span className="text-2xl">{duration.icon}</span>
                      <span className="font-semibold">{duration.name}</span>
                      {filters.duration?.includes(duration.id) && (
                        <span className="ml-auto text-[var(--theme-primary)]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-[var(--theme-primary)]" />
                  <Label className="font-bold text-foreground">Khoảng giá</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.priceRange?.[0] || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: [Number(e.target.value), filters.priceRange?.[1] || 10000000]
                      })}
                      className="flex-1 px-3 py-2 border-2 border-border rounded-lg bg-background text-foreground"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.priceRange?.[1] || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: [filters.priceRange?.[0] || 0, Number(e.target.value)]
                      })}
                      className="flex-1 px-3 py-2 border-2 border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: 'Miễn phí', range: [0, 0] },
                      { label: '< 1tr', range: [0, 1000000] },
                      { label: '1-3tr', range: [1000000, 3000000] },
                      { label: '> 3tr', range: [3000000, 10000000] },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => setFilters({ ...filters, priceRange: preset.range as [number, number] })}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-[var(--theme-primary)]" />
                  <Label className="font-bold text-foreground">Đánh giá tối thiểu</Label>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 4.5, 4, 3.5, 3].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters({ ...filters, rating })}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                        filters.rating === rating
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-500'
                          : 'bg-accent text-foreground border-transparent hover:border-border'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal className="h-4 w-4 text-[var(--theme-primary)]" />
                  <Label className="font-bold text-foreground">Sắp xếp theo</Label>
                </div>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground font-semibold focus:outline-none focus:border-[var(--theme-primary)]"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 sticky bottom-0 bg-background pt-4 border-t border-border">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Đặt lại
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
                  size="lg"
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}