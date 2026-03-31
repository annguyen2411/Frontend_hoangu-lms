// Cache Management System for PWA
export interface CacheInfo {
  name: string;
  size: number;
  itemCount: number;
  lastUpdated: Date;
}

class CacheManager {
  private readonly CACHE_NAMES = {
    static: 'hoangu-static-v1',
    dynamic: 'hoangu-dynamic-v1',
    images: 'hoangu-images-v1',
    api: 'hoangu-api-v1',
  };

  // Get cache info - optimized to avoid memory issues
  async getCacheInfo(): Promise<CacheInfo[]> {
    if (!('caches' in window)) return [];

    const cacheNames = await caches.keys();
    const info: CacheInfo[] = [];

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      let totalSize = 0;
      let processedCount = 0;
      const maxItemsToScan = 100; // Limit scanning to avoid memory issues

      for (const request of keys) {
        if (processedCount >= maxItemsToScan) break;
        
        const response = await cache.match(request);
        if (response) {
          // Use content-length header instead of reading blob
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            totalSize += parseInt(contentLength, 10);
          } else {
            // Fallback: sample first 10 items only
            if (processedCount < 10) {
              try {
                const blob = await response.blob();
                totalSize += blob.size;
              } catch {
                // Skip if can't read
              }
            }
          }
          processedCount++;
        }
      }

      info.push({
        name,
        size: totalSize,
        itemCount: keys.length,
        lastUpdated: new Date()
      });
    }

    return info;
  }

  // Get total cache size
  async getTotalCacheSize(): Promise<number> {
    const info = await this.getCacheInfo();
    return info.reduce((total, cache) => total + cache.size, 0);
  }

  // Clear specific cache
  async clearCache(cacheName: string): Promise<boolean> {
    if (!('caches' in window)) return false;
    return await caches.delete(cacheName);
  }

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }

  // Preload essential content for offline
  async preloadEssentialContent(): Promise<void> {
    if (!('caches' in window)) return;

    const cache = await caches.open(this.CACHE_NAMES.static);
    
    const essentialUrls = [
      '/',
      '/courses',
      '/dashboard',
      '/auth',
      '/manifest.json',
    ];

    await cache.addAll(essentialUrls.filter(url => !url.includes('undefined')));
  }

  // Download course for offline
  async downloadCourseOffline(courseId: string, lessons: string[]): Promise<void> {
    if (!('caches' in window)) return;

    const cache = await caches.open(`hoangu-course-${courseId}`);
    
    // Cache course content
    await Promise.all(
      lessons.map(async (lessonUrl) => {
        try {
          const response = await fetch(lessonUrl);
          if (response.ok) {
            await cache.put(lessonUrl, response);
          }
        } catch (error) {
          console.error('Failed to cache lesson:', lessonUrl, error);
        }
      })
    );
  }

  // Check if course is available offline
  async isCourseAvailableOffline(courseId: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    const cacheNames = await caches.keys();
    return cacheNames.some(name => name === `hoangu-course-${courseId}`);
  }

  // Get offline courses
  async getOfflineCourses(): Promise<string[]> {
    if (!('caches' in window)) return [];

    const cacheNames = await caches.keys();
    return cacheNames
      .filter(name => name.startsWith('hoangu-course-'))
      .map(name => name.replace('hoangu-course-', ''));
  }

  // Delete offline course
  async deleteOfflineCourse(courseId: string): Promise<boolean> {
    if (!('caches' in window)) return false;
    return await caches.delete(`hoangu-course-${courseId}`);
  }

  // Format bytes to readable size
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const cacheManager = new CacheManager();
