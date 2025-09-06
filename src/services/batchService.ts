// Batch operations utility to reduce API calls
import { supabase } from '../services/supabase.ts';

interface BatchOperation {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  data?: any;
  filter?: any;
  select?: string;
  resolve?: (value: any) => void;
  reject?: (reason?: any) => void;
}

export class BatchService {
  private static operations: BatchOperation[] = [];
  private static timeout: NodeJS.Timeout | null = null;
  private static readonly BATCH_DELAY = 100; // 100ms delay for batching

  // Add operation to batch
  static addOperation(operation: BatchOperation): Promise<any> {
    return new Promise((resolve, reject) => {
      this.operations.push({ ...operation, resolve, reject } as any);
      
      // Clear existing timeout
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      
      // Set new timeout to execute batch
      this.timeout = setTimeout(() => {
        this.executeBatch();
      }, this.BATCH_DELAY);
    });
  }

  // Execute all batched operations
  private static async executeBatch(): Promise<void> {
    if (this.operations.length === 0) return;

    const operations = [...this.operations];
    this.operations = [];
    this.timeout = null;

    // Group operations by table and type
    const grouped = operations.reduce((acc, op) => {
      const key = `${op.table}:${op.operation}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(op);
      return acc;
    }, {} as Record<string, any[]>);

    // Execute grouped operations
    for (const [key, ops] of Object.entries(grouped)) {
      try {
        const [table, operation] = key.split(':');
        
        if (operation === 'select') {
          // Batch select operations
          await this.executeBatchSelect(table, ops);
        } else if (operation === 'insert') {
          // Batch insert operations
          await this.executeBatchInsert(table, ops);
        } else if (operation === 'update') {
          // Execute updates individually (they usually have different filters)
          for (const op of ops) {
            await this.executeSingleUpdate(table, op);
          }
        }
      } catch (error) {
        // Reject all operations in this group
        ops.forEach(op => op.reject?.(error));
      }
    }
  }

  private static async executeBatchSelect(table: string, operations: any[]): Promise<void> {
    // For select operations, we can potentially combine filters or execute separately
    for (const op of operations) {
      try {
        if (!supabase) throw new Error('Supabase not available');
        
        let query = supabase.from(table).select(op.select || '*');
        
        if (op.filter) {
          Object.entries(op.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        op.resolve?.(data);
      } catch (error) {
        op.reject?.(error);
      }
    }
  }

  private static async executeBatchInsert(table: string, operations: any[]): Promise<void> {
    if (!supabase) throw new Error('Supabase not available');
    
    // Combine all insert data
    const allData = operations.map(op => op.data);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(allData)
        .select();
      
      if (error) throw error;
      
      // Resolve all operations with their respective data
      operations.forEach((op, index) => {
        op.resolve?.(data?.[index]);
      });
    } catch (error) {
      operations.forEach(op => op.reject?.(error));
    }
  }

  private static async executeSingleUpdate(table: string, operation: any): Promise<void> {
    try {
      if (!supabase) throw new Error('Supabase not available');
      
      let query = supabase.from(table).update(operation.data);
      
      if (operation.filter) {
        Object.entries(operation.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query.select();
      
      if (error) throw error;
      operation.resolve?.(data);
    } catch (error) {
      operation.reject?.(error);
    }
  }

  // Clear all pending operations
  static clearBatch(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    // Reject all pending operations
    this.operations.forEach(op => {
      op.reject?.(new Error('Batch cleared'));
    });
    
    this.operations = [];
  }
}
