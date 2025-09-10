/**
 * Common validation utilities for form inputs and data
 */

export const validation = {
  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number (Indonesian format)
   */
  phone: (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  /**
   * Validate password strength
   */
  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password minimal 8 karakter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf besar');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password harus mengandung angka');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate required field
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Validate minimum length
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Validate maximum length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Validate URL format
   */
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate Indonesian currency format
   */
  currency: (value: string): boolean => {
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue.length > 0 && parseInt(numericValue) >= 0;
  }
};

/**
 * Form field state management utilities
 */
export interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export const createFieldState = (initialValue = ''): FieldState => ({
  value: initialValue,
  error: null,
  touched: false,
  dirty: false
});

export const updateFieldState = (
  current: FieldState,
  value: string,
  validator?: (value: string) => string | null
): FieldState => ({
  ...current,
  value,
  dirty: value !== current.value,
  error: validator ? validator(value) : null
});

export const touchField = (current: FieldState): FieldState => ({
  ...current,
  touched: true
});

/**
 * Common form validators
 */
export const validators = {
  required: (message = 'Field ini wajib diisi') => (value: string) => 
    validation.required(value) ? null : message,
  
  email: (message = 'Format email tidak valid') => (value: string) =>
    !value || validation.email(value) ? null : message,
  
  phone: (message = 'Format nomor telepon tidak valid') => (value: string) =>
    !value || validation.phone(value) ? null : message,
  
  minLength: (min: number, message?: string) => (value: string) =>
    validation.minLength(value, min) ? null : message || `Minimal ${min} karakter`,
  
  maxLength: (max: number, message?: string) => (value: string) =>
    validation.maxLength(value, max) ? null : message || `Maksimal ${max} karakter`,
  
  url: (message = 'Format URL tidak valid') => (value: string) =>
    !value || validation.url(value) ? null : message,
  
  currency: (message = 'Format mata uang tidak valid') => (value: string) =>
    !value || validation.currency(value) ? null : message,
  
  combine: (...validators: Array<(value: string) => string | null>) => (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  }
};
