// Smart Search & Fuzzy Matching Utilities
import { offlineStorage } from './offlineStorage';

export interface SearchFilters {
  query: string;
  levels: string[];
  priceRange: [number, number];
  duration: string[]; // '0-3', '3-6', '6+'
  rating: number;
  categories: string[];
  instructor: string[];
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: Partial<SearchFilters>;
  timestamp: Date;
  resultsCount: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: Partial<SearchFilters>;
}

class SmartSearch {
  private readonly HISTORY_KEY = 'hoangu-search-history';
  private readonly MAX_HISTORY = 20;

  // Vietnamese to ASCII mapping for fuzzy search
  private vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
  };

  // Remove Vietnamese accents
  removeAccents(str: string): string {
    return str
      .toLowerCase()
      .split('')
      .map(char => this.vietnameseMap[char] || char)
      .join('');
  }

  // Calculate Levenshtein distance for fuzzy matching
  levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // Calculate similarity score (0-1)
  similarity(a: string, b: string): number {
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 1.0;
    const distance = this.levenshteinDistance(a, b);
    return 1 - distance / maxLength;
  }

  // Fuzzy search match
  fuzzyMatch(query: string, text: string, threshold: number = 0.6): boolean {
    const normalizedQuery = this.removeAccents(query);
    const normalizedText = this.removeAccents(text);

    // Exact match
    if (normalizedText.includes(normalizedQuery)) {
      return true;
    }

    // Split into words and check each
    const queryWords = normalizedQuery.split(/\s+/);
    const textWords = normalizedText.split(/\s+/);

    for (const queryWord of queryWords) {
      let found = false;
      for (const textWord of textWords) {
        if (this.similarity(queryWord, textWord) >= threshold) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }

    return true;
  }

  // Search and filter items
  search<T extends Record<string, any>>(
    items: T[],
    filters: Partial<SearchFilters>,
    searchFields: string[]
  ): T[] {
    let results = [...items];

    // Text search
    if (filters.query) {
      results = results.filter(item => {
        return searchFields.some(field => {
          const value = this.getNestedValue(item, field);
          if (typeof value === 'string') {
            return this.fuzzyMatch(filters.query!, value);
          }
          return false;
        });
      });
    }

    // Level filter
    if (filters.levels && filters.levels.length > 0) {
      results = results.filter(item => {
        // Check if any selected level matches
        return filters.levels!.some(selectedLevel => {
          // Match exact level string (Cơ bản, Trung cấp, Nâng cao)
          if (item.level === selectedLevel) return true;
          
          // Match HSK level (e.g., "HSK 1" matches hskLevel: 1)
          if (selectedLevel.startsWith('HSK ')) {
            const hskNum = parseInt(selectedLevel.replace('HSK ', ''));
            if (item.hskLevel === hskNum) return true;
          }
          
          // Match by tags
          if (item.tags && Array.isArray(item.tags)) {
            if (item.tags.includes(selectedLevel)) return true;
          }
          
          return false;
        });
      });
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      results = results.filter(item => {
        const price = item.price || item.discountPrice || 0;
        return price >= min && price <= max;
      });
    }

    // Duration filter
    if (filters.duration && filters.duration.length > 0) {
      results = results.filter(item => {
        const durationStr = item.duration || '';
        
        // Parse duration from string like "90 ngày", "120 ngày", "30 ngày"
        let durationInMonths = 0;
        
        if (typeof durationStr === 'string') {
          const dayMatch = durationStr.match(/(\d+)\s*ngày/i);
          const monthMatch = durationStr.match(/(\d+)\s*tháng/i);
          
          if (dayMatch) {
            durationInMonths = parseInt(dayMatch[1]) / 30; // Convert days to months
          } else if (monthMatch) {
            durationInMonths = parseInt(monthMatch[1]);
          }
        } else if (typeof durationStr === 'number') {
          durationInMonths = durationStr;
        }
        
        return filters.duration!.some(range => {
          if (range === '0-3') return durationInMonths <= 3;
          if (range === '3-6') return durationInMonths > 3 && durationInMonths <= 6;
          if (range === '6+') return durationInMonths > 6;
          return false;
        });
      });
    }

    // Rating filter
    if (filters.rating) {
      results = results.filter(item => {
        const rating = item.rating || 0;
        return rating >= filters.rating!;
      });
    }

    // Categories filter
    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(item => {
        const category = item.category;
        return filters.categories!.includes(category);
      });
    }

    // Instructor filter
    if (filters.instructor && filters.instructor.length > 0) {
      results = results.filter(item => {
        const instructor = item.instructor;
        return filters.instructor!.includes(instructor);
      });
    }

    // Sort results
    if (filters.sortBy) {
      results = this.sortResults(results, filters.sortBy);
    }

    return results;
  }

  // Sort results
  sortResults<T extends Record<string, any>>(items: T[], sortBy: SearchFilters['sortBy']): T[] {
    const sorted = [...items];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      
      case 'popular':
        return sorted.sort((a, b) => (b.students || 0) - (a.students || 0));
      
      case 'relevance':
      default:
        return sorted;
    }
  }

  // Get nested object value
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  // Generate search suggestions
  getSuggestions(query: string, items: any[], fields: string[], limit: number = 5): string[] {
    if (!query || query.length < 2) return [];

    const normalizedQuery = this.removeAccents(query.toLowerCase());
    const suggestions = new Set<string>();

    items.forEach(item => {
      fields.forEach(field => {
        const value = this.getNestedValue(item, field);
        if (typeof value === 'string') {
          const normalizedValue = this.removeAccents(value.toLowerCase());
          if (normalizedValue.includes(normalizedQuery)) {
            suggestions.add(value);
          }
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Save search to history
  saveSearchHistory(query: string, filters: Partial<SearchFilters>, resultsCount: number): void {
    const history = this.getSearchHistory();
    
    const newEntry: SearchHistory = {
      id: Date.now().toString(),
      query,
      filters,
      timestamp: new Date(),
      resultsCount
    };

    // Add to beginning and limit size
    history.unshift(newEntry);
    const trimmed = history.slice(0, this.MAX_HISTORY);

    offlineStorage.set(this.HISTORY_KEY, trimmed);
  }

  // Get search history
  getSearchHistory(): SearchHistory[] {
    return offlineStorage.get<SearchHistory[]>(this.HISTORY_KEY) || [];
  }

  // Clear search history
  clearSearchHistory(): void {
    offlineStorage.remove(this.HISTORY_KEY);
  }

  // Get popular searches
  getPopularSearches(limit: number = 5): string[] {
    const history = this.getSearchHistory();
    const queryCounts = new Map<string, number>();

    history.forEach(entry => {
      if (entry.query) {
        const count = queryCounts.get(entry.query) || 0;
        queryCounts.set(entry.query, count + 1);
      }
    });

    return Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  // Predefined filter presets
  getFilterPresets(): FilterPreset[] {
    return [
      {
        id: 'beginner-free',
        name: 'Người mới - Miễn phí',
        description: 'Khóa học miễn phí cho người mới bắt đầu',
        icon: '🎓',
        filters: {
          levels: ['HSK 1'],
          priceRange: [0, 0],
          sortBy: 'rating'
        }
      },
      {
        id: 'intensive',
        name: 'Khóa cấp tốc',
        description: 'Khóa học ngắn hạn, cao cấp',
        icon: '⚡',
        filters: {
          duration: ['0-3'],
          rating: 4.5,
          sortBy: 'rating'
        }
      },
      {
        id: 'comprehensive',
        name: 'Toàn diện',
        description: 'Khóa học dài hạn, đầy đủ kiến thức',
        icon: '📚',
        filters: {
          duration: ['6+'],
          rating: 4.0,
          sortBy: 'popular'
        }
      },
      {
        id: 'best-value',
        name: 'Giá tốt nhất',
        description: 'Chất lượng cao, giá cả hợp lý',
        icon: '💎',
        filters: {
          priceRange: [0, 2000000],
          rating: 4.5,
          sortBy: 'price-asc'
        }
      },
      {
        id: 'premium',
        name: 'Cao cấp',
        description: 'Khóa học premium, đánh giá cao',
        icon: '⭐',
        filters: {
          rating: 4.8,
          sortBy: 'rating'
        }
      },
      {
        id: 'hsk-prep',
        name: 'Luyện thi HSK',
        description: 'Chuẩn bị thi chứng chỉ HSK',
        icon: '🎯',
        filters: {
          categories: ['HSK'],
          sortBy: 'rating'
        }
      }
    ];
  }

  // Highlight search terms in text
  highlightMatches(text: string, query: string): string {
    if (!query) return text;

    const normalizedQuery = this.removeAccents(query.toLowerCase());
    const words = normalizedQuery.split(/\s+/);
    
    let highlighted = text;
    words.forEach(word => {
      if (word.length > 1) {
        const regex = new RegExp(`(${word})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      }
    });

    return highlighted;
  }
}

export const smartSearch = new SmartSearch();