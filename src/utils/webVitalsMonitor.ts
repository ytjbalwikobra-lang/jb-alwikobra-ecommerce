// Core Web Vitals monitoring and optimization
import React from 'react';

interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

interface PerformanceThresholds {
  CLS: { good: number; poor: number };
  FCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  LCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
}

// Type for web-vitals callback function
type ReportHandler = (metric: WebVitalMetric) => void;

class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private metrics: Map<string, WebVitalMetric> = new Map();
  private listeners: Array<(metric: WebVitalMetric) => void> = [];

  // Performance thresholds (in milliseconds, except CLS which is unitless)
  private static readonly THRESHOLDS: PerformanceThresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 }
  };

  static getInstance(): WebVitalsMonitor {
    if (!this.instance) {
      this.instance = new WebVitalsMonitor();
    }
    return this.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      void this.initializeWebVitals();
    }
  }

  private async initializeWebVitals(): Promise<void> {
    try {
      // Dynamic import of web-vitals library
      const { getCLS, getFCP, getFID, getLCP, getTTFB } = await import('web-vitals');

      // Monitor all Core Web Vitals
      getCLS(this.onMetric.bind(this) as ReportHandler);
      getFCP(this.onMetric.bind(this) as ReportHandler);
      getFID(this.onMetric.bind(this) as ReportHandler);
      getLCP(this.onMetric.bind(this) as ReportHandler);
      getTTFB(this.onMetric.bind(this) as ReportHandler);

      console.log('🔍 Web Vitals monitoring initialized');
    } catch (error) {
      console.warn('Failed to initialize Web Vitals monitoring:', error);
    }
  }

  private onMetric(metric: WebVitalMetric): void {
    // Calculate rating
    const thresholds = WebVitalsMonitor.THRESHOLDS[metric.name];
    metric.rating = metric.value <= thresholds.good 
      ? 'good' 
      : metric.value <= thresholds.poor 
        ? 'needs-improvement' 
        : 'poor';

    // Store metric
    this.metrics.set(metric.name, metric);

    // Notify listeners
    this.listeners.forEach(listener => listener(metric));

    // Log performance data
    this.logMetric(metric);
  }

  // Log metrics with better formatting and warnings
  logMetric(metric: WebVitalMetric): void {
    const value = Math.round(metric.value);
    let status = '';
    
    switch (metric.rating) {
      case 'good':
        status = '✅';
        break;
      case 'needs-improvement':
        status = '⚠️';
        break;
      case 'poor':
        status = '❌';
        break;
    }

    // Don't log poor metrics in development as they're often due to dev server overhead
    if (process.env.NODE_ENV === 'development' && metric.rating === 'poor') {
      if (metric.name === 'FCP' && value > 10000) {
        console.warn('🐛 FCP is slow in development (likely due to dev server overhead)');
        return;
      }
      if (metric.name === 'TTFB' && value > 10000) {
        console.warn('🐛 TTFB is slow in development (likely due to dev server overhead)');
        return;
      }
    }

    console.log(`${status} ${metric.name}: ${value}ms (${metric.rating})`);
  }

  // Add metric listener
  onMetricChange(listener: (metric: WebVitalMetric) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current metrics
  getMetrics(): Map<string, WebVitalMetric> {
    return new Map(this.metrics);
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    const metrics = Array.from(this.metrics.values());
    if (metrics.length === 0) return 0;

    const scores: number[] = metrics.map(metric => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
        default: return 0;
      }
    });

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  // Generate performance report
  generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();
    
    let report = `📊 Performance Report (Score: ${score}/100)\n`;
    report += '━'.repeat(50) + '\n';

    Array.from(metrics.entries()).forEach(([name, metric]) => {
      const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      const unit = name === 'CLS' ? '' : 'ms';
      const threshold = WebVitalsMonitor.THRESHOLDS[name as keyof PerformanceThresholds];
      report += `${emoji} ${name}: ${metric.value.toFixed(2)}${unit} (${metric.rating})\n`;
      report += `   Target: ≤${threshold.good}${unit} (good), ≤${threshold.poor}${unit} (poor)\n`;
    });

    return report;
  }

  // Send metrics to analytics: disabled (we use Vercel Analytics only now)
  sendToAnalytics(): void {
    // no-op
  }

  // Performance optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetrics();

    // LCP recommendations
    const lcp = metrics.get('LCP');
    if (lcp && lcp.rating !== 'good') {
      recommendations.push('🖼️ Optimize images: Use modern formats (WebP/AVIF), responsive images, and lazy loading');
      recommendations.push('🚀 Preload critical resources: Add <link rel="preload"> for hero images');
      recommendations.push('📦 Reduce bundle size: Code splitting and tree shaking');
    }

    // CLS recommendations
    const cls = metrics.get('CLS');
    if (cls && cls.rating !== 'good') {
      recommendations.push('📐 Reserve space for images: Use aspect-ratio CSS or explicit dimensions');
      recommendations.push('🔤 Optimize font loading: Use font-display: swap and preload fonts');
      recommendations.push('📱 Avoid dynamic content insertion above fold');
    }

    // FCP recommendations
    const fcp = metrics.get('FCP');
    if (fcp && fcp.rating !== 'good') {
      recommendations.push('⚡ Optimize critical CSS: Inline critical styles and defer non-critical CSS');
      recommendations.push('🔄 Reduce blocking resources: Defer JavaScript and optimize third-party scripts');
    }

    // FID recommendations
    const fid = metrics.get('FID');
    if (fid && fid.rating !== 'good') {
      recommendations.push('⚙️ Optimize JavaScript: Break up long tasks and use requestIdleCallback');
      recommendations.push('🎯 Debounce user interactions: Prevent rapid consecutive calls');
    }

    return recommendations;
  }
}

// React hook for Web Vitals monitoring
export const useWebVitals = () => {
  const [metrics, setMetrics] = React.useState<Map<string, WebVitalMetric>>(new Map());
  const [score, setScore] = React.useState<number>(0);

  React.useEffect(() => {
    const monitor = WebVitalsMonitor.getInstance();
    
    const unsubscribe = monitor.onMetricChange(() => {
      setMetrics(monitor.getMetrics());
      setScore(monitor.getPerformanceScore());
    });

    return unsubscribe;
  }, []);

  return {
    metrics,
    score,
    generateReport: () => WebVitalsMonitor.getInstance().generateReport(),
    getRecommendations: () => WebVitalsMonitor.getInstance().getOptimizationRecommendations()
  };
};

// Initialize monitoring
export const initWebVitalsMonitoring = () => {
  const monitor = WebVitalsMonitor.getInstance();
  
  // Send metrics to analytics
  monitor.onMetricChange(() => {
    monitor.sendToAnalytics();
  });

  return monitor;
};

export { WebVitalsMonitor };
