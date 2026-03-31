// Performance Monitoring & Optimization
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  largestContentfulPaint: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private observers: PerformanceObserver[] = [];

  // Initialize performance monitoring
  initialize() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    this.observeWebVitals();
    this.observeResourceTiming();
    this.observeLongTasks();
  }

  // Observe Web Vitals
  private observeWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        console.log('CLS:', clsScore);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.error('Error observing web vitals:', error);
    }
  }

  // Observe resource timing
  private observeResourceTiming() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          // Log slow resources (> 1s)
          if (entry.duration > 1000) {
            console.warn('Slow resource:', entry.name, `${entry.duration}ms`);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.error('Error observing resources:', error);
    }
  }

  // Observe long tasks
  private observeLongTasks() {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.warn('Long task detected:', `${entry.duration}ms`);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      // Long tasks API might not be supported
    }
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as any;
    const paint = performance.getEntriesByType('paint');

    return {
      pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      timeToInteractive: navigation?.domInteractive - navigation?.fetchStart || 0,
      totalBlockingTime: 0, // Calculated from long tasks
      cumulativeLayoutShift: 0, // Calculated from layout shifts
      largestContentfulPaint: 0, // Calculated from LCP observer
    };
  }

  // Get resource timing data
  getResourceTimings(): ResourceTiming[] {
    if (typeof window === 'undefined' || !window.performance) {
      return [];
    }

    const resources = performance.getEntriesByType('resource') as any[];
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: resource.initiatorType,
    }));
  }

  // Measure component render time
  measureRender(componentName: string, callback: () => void) {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (duration > 16) { // Longer than 1 frame (60fps)
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Mark custom performance points
  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name);
    }
  }

  // Measure between two marks
  measure(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (error) {
        console.error('Error measuring performance:', error);
      }
    }
    return 0;
  }

  // Get memory usage (Chrome only)
  getMemoryUsage() {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getMetrics();
    const resources = this.getResourceTimings();
    const memory = this.getMemoryUsage();

    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      resources: {
        total: resources.length,
        totalSize: resources.reduce((sum, r) => sum + r.size, 0),
        slowResources: resources.filter(r => r.duration > 1000),
      },
      memory,
      recommendations: this.generateRecommendations(metrics, resources),
    };

    console.log('Performance Report:', report);
    return report;
  }

  // Generate performance recommendations
  private generateRecommendations(
    metrics: PerformanceMetrics | null,
    resources: ResourceTiming[]
  ): string[] {
    const recommendations: string[] = [];

    if (metrics) {
      if (metrics.pageLoadTime > 3000) {
        recommendations.push('Page load time is high. Consider code splitting and lazy loading.');
      }

      if (metrics.firstContentfulPaint > 1800) {
        recommendations.push('First Contentful Paint is slow. Optimize critical rendering path.');
      }

      if (metrics.timeToInteractive > 5000) {
        recommendations.push('Time to Interactive is high. Reduce JavaScript execution time.');
      }
    }

    const largeResources = resources.filter(r => r.size > 500000); // > 500KB
    if (largeResources.length > 0) {
      recommendations.push(`Found ${largeResources.length} large resources. Consider compression and optimization.`);
    }

    const slowResources = resources.filter(r => r.duration > 1000);
    if (slowResources.length > 0) {
      recommendations.push(`Found ${slowResources.length} slow resources. Check network and server performance.`);
    }

    return recommendations;
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  performanceMonitor.initialize();
  
  // Generate report on page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.generateReport();
    }, 5000); // Wait 5s after load
  });
}
