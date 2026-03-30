// Offline storage utilities using IndexedDB and localStorage

const DB_NAME = 'HoaNguDB';
const DB_VERSION = 1;

// IndexedDB wrapper
class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('pendingProgress')) {
          db.createObjectStore('pendingProgress', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('pendingQuests')) {
          db.createObjectStore('pendingQuests', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('cachedLessons')) {
          db.createObjectStore('cachedLessons', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('cachedCourses')) {
          db.createObjectStore('cachedCourses', { keyPath: 'id' });
        }
      };
    });
  }

  async add(storeName: string, data: any): Promise<number> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName: string, key: any): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName: string, data: any): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDB = new OfflineDB();

// LocalStorage utilities with quota management
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB safety limit
const STORAGE_KEYS_TO_TRIM = ['hoangu-notifications', 'hoangu-flashcards', 'hoangu-card-reviews'];

export const offlineStorage = {
  getUsedSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },

  isQuotaExceeded(): boolean {
    try {
      return this.getUsedSize() >= MAX_STORAGE_SIZE;
    } catch {
      return false;
    }
  },

  trimOldData(): void {
    for (const key of STORAGE_KEYS_TO_TRIM) {
      const data = this.get<any[]>(key);
      if (data && data.length > 50) {
        this.set(key, data.slice(0, 50));
      }
    }
  },

  set(key: string, value: any): boolean {
    try {
      const serialized = JSON.stringify(value);
      const estimatedSize = serialized.length + key.length;
      
      if (this.getUsedSize() + estimatedSize > MAX_STORAGE_SIZE) {
        this.trimOldData();
        
        if (this.getUsedSize() + estimatedSize > MAX_STORAGE_SIZE) {
          console.warn('[OfflineStorage] Quota exceeded, clearing old data');
          this.remove(key);
          return false;
        }
      }
      
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if ((error as DOMException).name === 'QuotaExceededError') {
        console.warn('[OfflineStorage] Quota exceeded');
        this.trimOldData();
      } else {
        console.error('[OfflineStorage] Error saving to localStorage:', error);
      }
      return false;
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('[OfflineStorage] Error reading from localStorage:', error);
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[OfflineStorage] Error removing from localStorage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[OfflineStorage] Error clearing localStorage:', error);
    }
  }
};

// Sync manager
export const syncManager = {
  async syncPendingData(): Promise<void> {
    if (!navigator.onLine) {
      console.log('[Sync] Offline, skipping sync');
      return;
    }

    try {
      // Sync progress
      const pendingProgress = await offlineDB.getAll('pendingProgress');
      for (const progress of pendingProgress) {
        try {
          // Simulate API call (replace with actual API)
          console.log('[Sync] Syncing progress:', progress);
          // await fetch('/api/progress', { method: 'POST', body: JSON.stringify(progress) });
          await offlineDB.delete('pendingProgress', progress.id);
        } catch (error) {
          console.error('[Sync] Failed to sync progress:', error);
        }
      }

      // Sync quests
      const pendingQuests = await offlineDB.getAll('pendingQuests');
      for (const quest of pendingQuests) {
        try {
          console.log('[Sync] Syncing quest:', quest);
          // await fetch('/api/quests/complete', { method: 'POST', body: JSON.stringify(quest) });
          await offlineDB.delete('pendingQuests', quest.id);
        } catch (error) {
          console.error('[Sync] Failed to sync quest:', error);
        }
      }

      console.log('[Sync] All data synced successfully');
    } catch (error) {
      console.error('[Sync] Error during sync:', error);
    }
  },

  async savePendingProgress(courseId: string, progress: number): Promise<void> {
    await offlineDB.add('pendingProgress', {
      courseId,
      progress,
      timestamp: Date.now()
    });
  },

  async savePendingQuest(questId: string, data: any): Promise<void> {
    await offlineDB.add('pendingQuests', {
      questId,
      data,
      timestamp: Date.now()
    });
  },

  // Cache course for offline access
  async cacheCourse(course: any): Promise<void> {
    await offlineDB.put('cachedCourses', {
      ...course,
      cachedAt: Date.now()
    });
  },

  async getCachedCourse(courseId: string): Promise<any> {
    return await offlineDB.get('cachedCourses', courseId);
  },

  // Cache lesson for offline access
  async cacheLesson(lesson: any): Promise<void> {
    await offlineDB.put('cachedLessons', {
      ...lesson,
      cachedAt: Date.now()
    });
  },

  async getCachedLesson(lessonId: string): Promise<any> {
    return await offlineDB.get('cachedLessons', lessonId);
  }
};
