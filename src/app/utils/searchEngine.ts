// Advanced Search & Filtering Engine
import { offlineStorage } from './offlineStorage';

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: string[];
}

export interface SearchFilters {
  category?: string;
  level?: string;
  tags?: string[];
  priceRange?: [number, number];
  duration?: [number, number];
  rating?: number;
  dateRange?: [Date, Date];
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  filters?: SearchFilters;
  resultCount: number;
}

class SearchEngine {
  private readonly HISTORY_KEY = 'hoangu-search-history';
  private readonly MAX_HISTORY = 20;

  // Advanced search with fuzzy matching
  search<T extends Record<string, any>>(
    items: T[],
    query: string,
    searchFields: (keyof T)[],
    filters?: SearchFilters
  ): SearchResult<T>[] {
    if (!query && !filters) return items.map(item => ({ item, score: 1, matches: [] }));

    let results = items;

    // Apply filters first
    if (filters) {
      results = this.applyFilters(results, filters);
    }

    // Apply text search
    if (query) {
      const searchResults = results.map(item => {
        const { score, matches } = this.calculateScore(item, query, searchFields);
        return { item, score, matches };
      });

      // Filter out low scores and sort by relevance
      results = searchResults
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(r => r.item) as any;

      // Save search history
      this.addToHistory(query, filters, results.length);

      return searchResults.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
    }

    return results.map(item => ({ item, score: 1, matches: [] }));
  }

  // Calculate relevance score
  private calculateScore<T>(
    item: T,
    query: string,
    fields: (keyof T)[]
  ): { score: number; matches: string[] } {
    let score = 0;
    const matches: string[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    fields.forEach(field => {
      const value = String(item[field] || '').toLowerCase();
      
      // Exact match - highest score
      if (value === queryLower) {
        score += 10;
        matches.push(field as string);
      }
      // Starts with query
      else if (value.startsWith(queryLower)) {
        score += 5;
        matches.push(field as string);
      }
      // Contains exact query
      else if (value.includes(queryLower)) {
        score += 3;
        matches.push(field as string);
      }
      // Contains all query words
      else if (queryWords.every(word => value.includes(word))) {
        score += 2;
        matches.push(field as string);
      }
      // Contains some query words
      else {
        const matchedWords = queryWords.filter(word => value.includes(word));
        if (matchedWords.length > 0) {
          score += matchedWords.length * 0.5;
          matches.push(field as string);
        }
      }

      // Fuzzy matching for typos
      if (this.fuzzyMatch(value, queryLower)) {
        score += 1;
        matches.push(field as string);
      }
    });

    return { score, matches: [...new Set(matches)] };
  }

  // Simple fuzzy matching (Levenshtein distance)
  private fuzzyMatch(str1: string, str2: string, threshold: number = 0.7): boolean {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const similarity = 1 - distance / maxLength;
    return similarity >= threshold;
  }

  // Levenshtein distance algorithm
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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

    return matrix[str2.length][str1.length];
  }

  // Apply filters to items
  private applyFilters<T extends Record<string, any>>(
    items: T[],
    filters: SearchFilters
  ): T[] {
    return items.filter(item => {
      // Category filter - check in tags array if item doesn't have category field
      if (filters.category) {
        if (item.category) {
          if (item.category !== filters.category) return false;
        } else if (item.tags && Array.isArray(item.tags)) {
          // Check if category exists in tags
          if (!item.tags.some((tag: string) => tag === filters.category)) return false;
        } else {
          return false;
        }
      }

      // Level filter
      if (filters.level && item.level !== filters.level) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!item.tags || !filters.tags.some((tag: string) => item.tags.includes(tag))) {
          return false;
        }
      }

      // Price range filter
      if (filters.priceRange) {
        const price = item.price || 0;
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
          return false;
        }
      }

      // Duration filter
      if (filters.duration) {
        const duration = item.duration || 0;
        if (duration < filters.duration[0] || duration > filters.duration[1]) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && (item.rating || 0) < filters.rating) {
        return false;
      }

      // Date range filter
      if (filters.dateRange && item.createdAt) {
        const date = new Date(item.createdAt);
        if (date < filters.dateRange[0] || date > filters.dateRange[1]) {
          return false;
        }
      }

      return true;
    });
  }

  // Get search history
  getHistory(): SearchHistory[] {
    return offlineStorage.get<SearchHistory[]>(this.HISTORY_KEY) || [];
  }

  // Add to search history
  private addToHistory(query: string, filters?: SearchFilters, resultCount: number = 0): void {
    const history = this.getHistory();
    
    const newEntry: SearchHistory = {
      query,
      timestamp: new Date(),
      filters,
      resultCount
    };

    // Remove duplicates
    const filtered = history.filter(h => h.query !== query);
    
    // Add new entry at the beginning
    filtered.unshift(newEntry);
    
    // Keep only last MAX_HISTORY entries
    const trimmed = filtered.slice(0, this.MAX_HISTORY);
    
    offlineStorage.set(this.HISTORY_KEY, trimmed);
  }

  // Clear search history
  clearHistory(): void {
    offlineStorage.set(this.HISTORY_KEY, []);
  }

  // Get popular searches
  getPopularSearches(limit: number = 5): string[] {
    const history = this.getHistory();
    const searchCounts = new Map<string, number>();

    history.forEach(h => {
      searchCounts.set(h.query, (searchCounts.get(h.query) || 0) + 1);
    });

    return Array.from(searchCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  // Get search suggestions
  getSuggestions(query: string, limit: number = 5): string[] {
    const history = this.getHistory();
    const queryLower = query.toLowerCase();

    return history
      .filter(h => h.query.toLowerCase().startsWith(queryLower))
      .map(h => h.query)
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, limit);
  }

  // Highlight matches in text
  highlightMatches(text: string, query: string): string {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

export const searchEngine = new SearchEngine();