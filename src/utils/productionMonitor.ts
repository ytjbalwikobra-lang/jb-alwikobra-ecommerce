// Production environment validation and monitoring
export class ProductionMonitor {
  private static instance: ProductionMonitor;
  private errors: Array<{ type: string; message: string; timestamp: number }> = [];

  static getInstance(): ProductionMonitor {
    if (!this.instance) {
      this.instance = new ProductionMonitor();
    }
    return this.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeErrorHandling();
      this.validateEnvironment();
    }
  }

  private initializeErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      const errorMessage = (event.error && typeof event.error === 'object' && 'message' in event.error) 
        ? String((event.error as { message: unknown }).message) 
        : event.message;
      this.logError('JavaScript Error', errorMessage);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const reasonMessage = (event.reason && typeof event.reason === 'object' && 'message' in event.reason) 
        ? String((event.reason as { message: unknown }).message) 
        : String(event.reason);
      this.logError('Unhandled Promise Rejection', reasonMessage);
    });

    // Resource loading error handler
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'LINK' && target.getAttribute('rel') === 'preload') {
          // Handle font preload errors silently
          this.logError('Resource Preload Failed', `Failed to preload: ${target.getAttribute('href')}`);
          // Remove failed preload to prevent repeated attempts
          target.remove();
        }
      }
    }, true);
  }

  private validateEnvironment(): void {
    // Check for required environment variables (client-side safe checks)
    const requiredEnvVars = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Missing environment variables:', missing);
    }

    // Skip API endpoint validation to prevent 404 errors in console
    // this.validateApiEndpoints();
  }

  private async validateApiEndpoints(): Promise<void> {
    const endpoints: string[] = [
      // Note: Add endpoints you want to validate with OPTIONS here.
      // '/api/health'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { 
          method: 'OPTIONS',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        if (!response.ok && response.status !== 405) { // 405 is acceptable for OPTIONS
          console.warn(`⚠️ API endpoint issue: ${endpoint} returned ${response.status}`);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`📍 API endpoint unavailable: ${endpoint}`);
        }
      }
    }
  }

  private logError(type: string, message: string): void {
    const error = {
      type,
      message,
      timestamp: Date.now()
    };

    this.errors.push(error);

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 ${type}:`, message);
    }
  }

  // Public method to get current errors
  getErrors(): Array<{ type: string; message: string; timestamp: number }> {
    return [...this.errors];
  }

  // Public method to clear errors
  clearErrors(): void {
    this.errors = [];
  }

  // Check if the app is running in production
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  // Get environment info
  getEnvironmentInfo(): object {
    return {
      nodeEnv: process.env.NODE_ENV,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      errors: this.errors.length
    };
  }
}

// Initialize production monitor
export const productionMonitor = ProductionMonitor.getInstance();
