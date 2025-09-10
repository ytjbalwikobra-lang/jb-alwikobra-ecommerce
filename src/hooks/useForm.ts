/**
 * Generic form management hook with validation support
 * Provides state management, validation, and submission handling
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
import { useState, useCallback, useMemo } from 'react';
import { FieldState, createFieldState, updateFieldState, touchField } from '../utils/validation';

interface UseFormOptions<T extends Record<string, string>> {
  initialValues: T;
  validators?: Partial<Record<keyof T, (value: string) => string | null>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormResult<T extends Record<string, string>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  
  // Field operations
  setValue: (field: keyof T, value: string) => void;
  setError: (field: keyof T, error: string | null) => void;
  touchField: (field: keyof T) => void;
  
  // Form operations
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  setValues: (values: Partial<T>) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, string>>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  const { initialValues, validators = {} as Partial<Record<keyof T, (value: string) => string | null>>, onSubmit } = options;
  
  // Initialize field states
  const [fieldStates, setFieldStates] = useState<Record<keyof T, FieldState>>(() => {
    const states = {} as Record<keyof T, FieldState>;
    for (const key in initialValues) {
      states[key] = createFieldState(initialValues[key]);
    }
    return states;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed values
  const values = useMemo(() => {
    const vals = {} as T;
    for (const key in fieldStates) {
      vals[key] = fieldStates[key].value as T[Extract<keyof T, string>];
    }
    return vals;
  }, [fieldStates]);

  const errors = useMemo(() => {
    const errs = {} as Partial<Record<keyof T, string>>;
    for (const key in fieldStates) {
      if (fieldStates[key].error) {
        errs[key] = fieldStates[key].error;
      }
    }
    return errs;
  }, [fieldStates]);

  const touched = useMemo(() => {
    const touchedFields = {} as Partial<Record<keyof T, boolean>>;
    for (const key in fieldStates) {
      touchedFields[key] = fieldStates[key].touched;
    }
    return touchedFields;
  }, [fieldStates]);

  const isValid = useMemo(() => {
    return Object.values(fieldStates).every(field => !field.error);
  }, [fieldStates]);

  const isDirty = useMemo(() => {
    return Object.values(fieldStates).some(field => field.dirty);
  }, [fieldStates]);

  // Field operations
  const setValue = useCallback((field: keyof T, value: string) => {
    const validator = (validators as Record<keyof T, (value: string) => string | null>)[field];
    setFieldStates(prev => ({
      ...prev,
      [field]: updateFieldState(
        prev[field],
        value,
        typeof validator === 'function' ? validator : undefined
      )
    }));
  }, [validators]);

  const setError = useCallback((field: keyof T, error: string | null) => {
    setFieldStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error
      }
    }));
  }, []);

  const touchFieldHandler = useCallback((field: keyof T) => {
    setFieldStates(prev => ({
      ...prev,
      [field]: touchField(prev[field])
    }));
  }, []);

  const validateField = useCallback((field: keyof T) => {
    const validator = (validators as Record<keyof T, (value: string) => string | null>)[field];
    if (validator && typeof validator === 'function') {
      const error = validator(fieldStates[field].value);
      setError(field, error);
    }
  }, [validators, fieldStates, setError]);

  const validateForm = useCallback(() => {
    let isFormValid = true;
    
    for (const field in validators) {
      const validator = validators[field];
      if (validator && typeof validator === 'function') {
        const error = validator(fieldStates[field].value);
        setError(field, error);
        if (error) {
          isFormValid = false;
        }
      }
    }
    
    return isFormValid;
  }, [validators, fieldStates, setError]);

  // Form operations
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Touch all fields
    for (const field in fieldStates) {
      touchFieldHandler(field);
    }

    // Validate all fields
    const isFormValid = validateForm();

    if (!isFormValid || !onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      // You could set a global form error here
    } finally {
      setIsSubmitting(false);
    }
  }, [fieldStates, touchFieldHandler, validateForm, onSubmit, values]);

  const reset = useCallback(() => {
    const states = {} as Record<keyof T, FieldState>;
    for (const key in initialValues) {
      states[key] = createFieldState(initialValues[key]);
    }
    setFieldStates(states);
    setIsSubmitting(false);
  }, [initialValues]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setFieldStates(prev => {
      const updated = { ...prev };
      for (const key in newValues) {
        if (newValues[key] !== undefined) {
          updated[key] = updateFieldState(
            prev[key],
            newValues[key] as string,
            validators[key]
          );
        }
      }
      return updated;
    });
  }, [validators]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    setValue,
    setError,
    touchField: touchFieldHandler,
    handleSubmit,
    reset,
    setValues,
    validateField,
    validateForm
  };
}

/**
 * Simplified form hook for basic use cases
 */
export function useSimpleForm<T extends Record<string, string>>(
  initialValues: T,
  onSubmit?: (values: T) => Promise<void> | void
) {
  return useForm({
    initialValues,
    onSubmit
  });
}
