/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { ProductFormData } from '../types/admin';
import { mapProductFormToDbPayload } from '../utils/adminHelpers';
import { adminService } from '../services/adminService';

// API Response types for better type safety
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _apiResponseType: ApiResponse = { success: true };

interface UseAdminApiOptions {
  endpoint: string;
  initialData?: unknown;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAdminApi<T = unknown>({ endpoint, initialData = null }: UseAdminApiOptions) {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData as T | null,
    loading: false,
    error: null});

  const { push } = useToast();

  const fetchData = useCallback(async (params?: Record<string, string | number | boolean>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const urlParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            urlParams.append(key, String(value));
          }
        });
      }

      const url = params && Object.keys(params).length > 0 
        ? `${endpoint}?${urlParams.toString()}`
        : endpoint;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'}});

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const result: unknown = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format');
      }

      const apiResponse = result as ApiResponse<T>;

      if (!apiResponse.success) {
        const errorMsg = apiResponse.error || 'API request failed';
        throw new Error(errorMsg);
      }

      setState({
        data: apiResponse.data,
        loading: false,
        error: null});

      return apiResponse.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage});

      push(`Request failed: ${errorMessage}`, 'error');
      throw error;
    }
  }, [endpoint, push]);

  const reset = useCallback(() => {
    setState({
      data: initialData as T | null,
      loading: false,
      error: null});
  }, [initialData]);

  return {
    ...state,
    fetchData,
    reset};
}

// Product-specific hook for save operations
export function useProductSave() {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProduct = useCallback(async (formData: ProductFormData, editingProductId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const productData = mapProductFormToDbPayload(formData);
      let result;

      if (editingProductId) {
        result = await adminService.updateProduct(editingProductId, productData);
        push('Produk berhasil diperbarui', 'success');
      } else {
        result = await adminService.createProduct(productData);
        push('Produk berhasil dibuat', 'success');
      }

      if (result && typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'object' && result.error !== null && 'message' in result.error && typeof result.error.message === 'string') {
        throw new Error(result.error.message);
      }

      if (result && typeof result === 'object' && result !== null && 'data' in result && result.data !== undefined) {
        return result.data;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      push(`Gagal menyimpan produk: ${message}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [push]);

  return { loading, error, saveProduct };
}

// Hook for user operations
export function useUserApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const updateUserRole = useCallback(async (id: string, isAdmin: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin?action=users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'},
        body: JSON.stringify({ id, isAdmin })});

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: unknown = await response.json();

      if (result && typeof result === 'object' && 'success' in result && !result.success) {
        const errorMsg = (result as { error?: string }).error || 'Failed to update user role';
        throw new Error(errorMsg);
      }

      push('Peran diperbarui', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      push(`Gagal memperbarui peran: ${message}`, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [push]);

  return { loading, error, updateUserRole };
}
