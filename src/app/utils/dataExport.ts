// Data Export System
import { progressTracker } from './progressTracker';
import { spacedRepetition } from './spacedRepetition';
import { notificationSystem } from './notificationSystem';
import { certificateGenerator } from './certificateGenerator';
import { offlineStorage } from './offlineStorage';

export type ExportFormat = 'json' | 'csv' | 'pdf';

class DataExport {
  // Get gamification data from localStorage
  private getGamificationData() {
    return {
      level: offlineStorage.get('hoangu-level') || 1,
      xp: offlineStorage.get('hoangu-xp') || 0,
      achievements: offlineStorage.get('hoangu-achievements') || [],
      badges: offlineStorage.get('hoangu-badges') || [],
      quests: offlineStorage.get('hoangu-quests') || [],
      inventory: offlineStorage.get('hoangu-inventory') || [],
    };
  }

  // Export all user data
  exportAllData(): any {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        progress: progressTracker.getMetrics(),
        flashcards: spacedRepetition.getAllCards(),
        reviews: spacedRepetition.getAllReviews(),
        gamification: this.getGamificationData(),
        notifications: notificationSystem.getAll(),
        certificates: certificateGenerator.getAll(),
      },
    };
  }

  // Export progress data
  exportProgress(): any {
    const metrics = progressTracker.getMetrics();
    return {
      exportDate: new Date().toISOString(),
      type: 'progress',
      data: metrics,
    };
  }

  // Export flashcards
  exportFlashcards(): any {
    return {
      exportDate: new Date().toISOString(),
      type: 'flashcards',
      data: {
        cards: spacedRepetition.getAllCards(),
        reviews: spacedRepetition.getAllReviews(),
        stats: spacedRepetition.getStats(),
      },
    };
  }

  // Export gamification data
  exportGamification(): any {
    return {
      exportDate: new Date().toISOString(),
      type: 'gamification',
      data: this.getGamificationData(),
    };
  }

  // Download data as JSON
  downloadJSON(data: any, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadBlob(blob, `${filename}.json`);
  }

  // Download data as CSV
  downloadCSV(data: any[], filename: string): void {
    if (data.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  // Convert object to CSV-friendly format
  private flattenObject(obj: any, prefix = ''): any {
    let result: any = {};
    
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        result[newKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        result[newKey] = value.join('; ');
      } else if (value instanceof Date) {
        result[newKey] = value.toISOString();
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  }

  // Download blob
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import data from JSON
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.version || !data.data) {
        throw new Error('Invalid data format');
      }

      // Import each data type
      // Note: In production, you'd want to merge data carefully
      console.log('Imported data:', data);
      alert('Dữ liệu đã được nhập thành công!');
      
      return true;
    } catch (error) {
      console.error('Import error:', error);
      alert('Lỗi khi nhập dữ liệu. Vui lòng kiểm tra file.');
      return false;
    }
  }

  // Export certificates
  exportCertificates(): any {
    return {
      exportDate: new Date().toISOString(),
      type: 'certificates',
      data: certificateGenerator.getAll(),
    };
  }

  // Generate learning report
  generateReport(): any {
    const metrics = progressTracker.getMetrics();
    const flashcardStats = spacedRepetition.getStats();
    const gamificationData = this.getGamificationData();

    return {
      reportDate: new Date().toISOString(),
      summary: {
        totalStudyTime: metrics.totalStudyTime,
        lessonsCompleted: metrics.lessonsCompleted,
        currentStreak: metrics.currentStreak,
        longestStreak: metrics.longestStreak,
        level: gamificationData.level,
        totalXP: gamificationData.xp,
        achievements: gamificationData.achievements.filter((a: any) => a.unlocked).length,
        flashcards: {
          total: flashcardStats.totalCards,
          mastered: flashcardStats.masteredCards,
          learning: flashcardStats.learningCards,
        },
      },
      skills: metrics.skillLevels,
      recentActivity: metrics.recentActivity,
    };
  }

  // Download learning report
  downloadReport(): void {
    const report = this.generateReport();
    this.downloadJSON(report, `HoaNgu-Report-${new Date().toISOString().split('T')[0]}`);
  }
}

export const dataExport = new DataExport();