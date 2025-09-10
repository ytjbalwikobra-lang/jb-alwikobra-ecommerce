/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */

/**
 * BATCH REQUEST SERVICE
 * 
 * Combines multiple API requests into single batched calls to reduce egress usage:
 * - Collects requests within a time window (50ms) and batches them
 * - Supports different batch strategies for different endpoints
 * - Handles response splitting back to individual requests
 * - Maintains request isolation and error handling
 */

interface BatchRequest {
  id: string;
  endpoint: string;
  params: Record<string, any>;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface BatchResponse {
  success: boolean;
  results: Record<string, any>;
  errors: Record<string, string>;
}

class BatchRequestService {
  private pendingRequests: BatchRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // milliseconds
  private requestCounter = 0;

  /**
   * Add request to batch queue
   */
  async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${++this.requestCounter}_${Date.now()}`;
      
      const batchRequest: BatchRequest = {
        id: requestId,
        endpoint,
        params,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.pendingRequests.push(batchRequest);

      // Schedule batch processing
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          void this.processBatch();
        }, this.BATCH_DELAY);
      }
    });
  }

  /**
   * Process accumulated requests as batches
   */
  private async processBatch(): Promise<void> {
    if (this.pendingRequests.length === 0) {
      this.batchTimer = null;
      return;
    }

    const requests = [...this.pendingRequests];
    this.pendingRequests = [];
    this.batchTimer = null;

    // Group requests by endpoint for batching
    const groups = this.groupRequestsByEndpoint(requests);

    // Process each group
    const groupEntries = Array.from(groups.entries());
    for (const [endpoint, groupRequests] of groupEntries) {
      try {
        if (this.isBatchableEndpoint(endpoint)) {
          await this.processBatchedRequests(endpoint, groupRequests);
        } else {
          // Process individually for non-batchable endpoints
          await this.processIndividualRequests(groupRequests);
        }
      } catch (error) {
        // Reject all requests in group if batch fails
        groupRequests.forEach((req: BatchRequest) => {
          req.reject(error as Error);
        });
      }
    }
  }

  /**
   * Group requests by endpoint
   */
  private groupRequestsByEndpoint(requests: BatchRequest[]): Map<string, BatchRequest[]> {
    const groups = new Map<string, BatchRequest[]>();
    
    for (const request of requests) {
      const existing = groups.get(request.endpoint) || [];
      existing.push(request);
      groups.set(request.endpoint, existing);
    }
    
    return groups;
  }

  /**
   * Check if endpoint supports batching
   */
  private isBatchableEndpoint(endpoint: string): boolean {
    const batchableEndpoints = [
      'products',
      'orders', 
      'users',
      'feed',
      'notifications',
      'dashboard-stats'
    ];
    
    return batchableEndpoints.some(batchable => endpoint.includes(batchable));
  }

  /**
   * Process requests as a batch
   */
  private async processBatchedRequests(endpoint: string, requests: BatchRequest[]): Promise<void> {
    if (requests.length === 1) {
      // Single request, no need to batch
      await this.processIndividualRequests(requests);
      return;
    }

    try {
      // Create batch payload
      const batchPayload = {
        requests: requests.map(req => ({
          id: req.id,
          endpoint: req.endpoint,
          params: req.params
        }))
      };

      // Send batch request
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        },
        body: JSON.stringify(batchPayload)
      });

      if (!response.ok) {
        throw new Error(`Batch request failed: ${response.status}`);
      }

      const batchResponse: BatchResponse = await response.json();

      // Distribute results to individual requests
      requests.forEach(req => {
        if (batchResponse.results[req.id]) {
          req.resolve(batchResponse.results[req.id]);
        } else if (batchResponse.errors[req.id]) {
          req.reject(new Error(batchResponse.errors[req.id]));
        } else {
          req.reject(new Error('No response received for request'));
        }
      });

    } catch (error) {
      // Fallback to individual requests if batch fails
      console.warn('Batch request failed, falling back to individual requests:', error);
      await this.processIndividualRequests(requests);
    }
  }

  /**
   * Process requests individually
   */
  private async processIndividualRequests(requests: BatchRequest[]): Promise<void> {
    // Process in parallel with concurrency limit
    const concurrencyLimit = 5;
    const chunks = this.chunkArray(requests, concurrencyLimit);
    
    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(req => this.processSingleRequest(req))
      );
    }
  }

  /**
   * Process a single request
   */
  private async processSingleRequest(request: BatchRequest): Promise<void> {
    try {
      const url = new URL('/api/admin', window.location.origin);
      url.searchParams.append('action', request.endpoint);
      
      Object.entries(request.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      request.resolve(data);
    } catch (error) {
      request.reject(error as Error);
    }
  }

  /**
   * Utility: Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Force immediate processing of pending requests
   */
  flush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    if (this.pendingRequests.length > 0) {
      void this.processBatch();
    }
  }

  /**
   * Get pending request count
   */
  getPendingCount(): number {
    return this.pendingRequests.length;
  }
}

// Export singleton instance
export const batchRequestService = new BatchRequestService();

/**
 * Hook for batched API requests
 */
export const useBatchedRequest = () => {
  return {
    request: <T>(endpoint: string, params?: Record<string, any>) => 
      batchRequestService.request<T>(endpoint, params),
    flush: () => batchRequestService.flush(),
    pendingCount: batchRequestService.getPendingCount()
  };
};

export default batchRequestService;
