// Offline Sync Queue System
import { offlineStorage } from './offlineStorage';

export interface SyncTask {
  id: string;
  type: 'post' | 'comment' | 'lesson_progress' | 'study_session' | 'achievement';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

class SyncQueue {
  private readonly QUEUE_KEY = 'hoangu-sync-queue';
  private readonly MAX_RETRIES = 3;
  private isSyncing = false;

  // Add task to queue
  enqueue(task: Omit<SyncTask, 'id' | 'timestamp' | 'retries' | 'status'>): void {
    const newTask: SyncTask = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      retries: 0,
      status: 'pending'
    };

    const queue = this.getQueue();
    queue.push(newTask);
    offlineStorage.set(this.QUEUE_KEY, queue);

    // Auto-sync if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Get all tasks in queue
  getQueue(): SyncTask[] {
    return offlineStorage.get<SyncTask[]>(this.QUEUE_KEY) || [];
  }

  // Get pending tasks count
  getPendingCount(): number {
    return this.getQueue().filter(t => t.status === 'pending').length;
  }

  // Process all pending tasks
  async processQueue(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    const queue = this.getQueue();
    const pendingTasks = queue.filter(t => t.status === 'pending');

    for (const task of pendingTasks) {
      await this.processTask(task);
    }

    this.isSyncing = false;
  }

  // Process single task
  private async processTask(task: SyncTask): Promise<void> {
    try {
      // Update status to syncing
      this.updateTaskStatus(task.id, 'syncing');

      // Simulate API call (replace with real API)
      await this.simulateSync(task);

      // Mark as completed
      this.updateTaskStatus(task.id, 'completed');

      // Remove completed tasks after 24 hours
      this.cleanupCompleted();
    } catch (error) {
      console.error('Sync failed for task:', task.id, error);
      
      if (task.retries < this.MAX_RETRIES) {
        this.retryTask(task.id);
      } else {
        this.updateTaskStatus(task.id, 'failed');
      }
    }
  }

  // Simulate sync (replace with real API calls)
  private async simulateSync(task: SyncTask): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Synced task:', task.type, task.action, task.data);
        resolve();
      }, 1000);
    });
  }

  // Update task status
  private updateTaskStatus(taskId: string, status: SyncTask['status']): void {
    const queue = this.getQueue();
    const task = queue.find(t => t.id === taskId);
    
    if (task) {
      task.status = status;
      offlineStorage.set(this.QUEUE_KEY, queue);
    }
  }

  // Retry failed task
  private retryTask(taskId: string): void {
    const queue = this.getQueue();
    const task = queue.find(t => t.id === taskId);
    
    if (task) {
      task.retries++;
      task.status = 'pending';
      offlineStorage.set(this.QUEUE_KEY, queue);
    }
  }

  // Cleanup completed tasks older than 24 hours
  private cleanupCompleted(): void {
    const queue = this.getQueue();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const filtered = queue.filter(t => {
      if (t.status === 'completed') {
        return new Date(t.timestamp) > oneDayAgo;
      }
      return true;
    });

    offlineStorage.set(this.QUEUE_KEY, filtered);
  }

  // Clear all tasks
  clearAll(): void {
    offlineStorage.set(this.QUEUE_KEY, []);
  }

  // Get failed tasks
  getFailedTasks(): SyncTask[] {
    return this.getQueue().filter(t => t.status === 'failed');
  }

  // Retry all failed tasks
  retryAllFailed(): void {
    const queue = this.getQueue();
    queue.forEach(task => {
      if (task.status === 'failed') {
        task.status = 'pending';
        task.retries = 0;
      }
    });
    offlineStorage.set(this.QUEUE_KEY, queue);
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }
}

export const syncQueue = new SyncQueue();

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network restored, processing sync queue...');
    syncQueue.processQueue();
  });
}
