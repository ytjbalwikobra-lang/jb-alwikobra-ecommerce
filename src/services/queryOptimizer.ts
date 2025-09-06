// Query performance monitoring and optimization suggestions
export class QueryOptimizer {
  private static queryStats = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    lastUsed: number;
  }>();

  static trackQuery(queryKey: string, executionTime: number): void {
    const existing = this.queryStats.get(queryKey);
    
    if (existing) {
      existing.count++;
      existing.totalTime += executionTime;
      existing.avgTime = existing.totalTime / existing.count;
      existing.lastUsed = Date.now();
    } else {
      this.queryStats.set(queryKey, {
        count: 1,
        totalTime: executionTime,
        avgTime: executionTime,
        lastUsed: Date.now()
      });
    }
  }

  static async executeTrackedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      this.trackQuery(queryKey, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.trackQuery(`${queryKey}:error`, endTime - startTime);
      throw error;
    }
  }

  static getQueryStats(): Array<{
    query: string;
    count: number;
    avgTime: number;
    lastUsed: number;
  }> {
    return Array.from(this.queryStats.entries()).map(([query, stats]) => ({
      query,
      ...stats
    })).sort((a, b) => b.count - a.count); // Sort by usage frequency
  }

  static getSuggestedOptimizations(): string[] {
    const suggestions: string[] = [];
    const stats = this.getQueryStats();
    
    // Suggest caching for frequently used queries
    stats.forEach(stat => {
      if (stat.count > 10 && stat.avgTime > 100) {
        suggestions.push(`Consider caching query "${stat.query}" (used ${stat.count} times, avg ${stat.avgTime.toFixed(2)}ms)`);
      }
      
      if (stat.avgTime > 500) {
        suggestions.push(`Query "${stat.query}" is slow (${stat.avgTime.toFixed(2)}ms avg) - consider optimization or indexing`);
      }
    });
    
    return suggestions;
  }

  static clearStats(): void {
    this.queryStats.clear();
  }
}

// Performance monitoring wrapper
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  queryName: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    return QueryOptimizer.executeTrackedQuery(
      `${queryName}:${JSON.stringify(args)}`,
      () => fn(...args)
    );
  }) as T;
}
