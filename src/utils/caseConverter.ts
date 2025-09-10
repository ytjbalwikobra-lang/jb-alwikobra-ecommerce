// Generic type to convert a string from camelCase to snake_case
export type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Uppercase<T> ? `_${Lowercase<T>}` : T}${SnakeCase<U>}`
  : S;

// Generic type to convert a string from snake_case to camelCase
export type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;

// Generic type to convert object keys from camelCase to snake_case, handling arrays and primitives.
export type ObjectToSnakeCase<T> = T extends (infer U)[]
  ? ObjectToSnakeCase<U>[]
  : T extends Date | File | ((...args: any[]) => any)
  ? T
  : T extends object ? {
  [K in keyof T as SnakeCase<K & string>]: ObjectToSnakeCase<T[K]>;
} : T;

// Generic type to convert object keys from snake_case to camelCase, handling arrays and primitives.
export type ObjectToCamelCase<T> = T extends (infer U)[]
  ? ObjectToCamelCase<U>[]
  : T extends Date | File | ((...args: any[]) => any)
  ? T
  : T extends object ? {
  [K in keyof T as CamelCase<K & string>]: ObjectToCamelCase<T[K]>;
} : T;

// Function to convert a string to snake_case
function toSnakeCaseString(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Function to convert a string to camelCase
function toCamelCaseString(str: string): string {
  return str.replace(/_([a-z])/g, g => g[1].toUpperCase());
}

// Function to convert object keys to snake_case recursively
export function toSnakeCase<T>(obj: T): ObjectToSnakeCase<T> {
  if (Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return obj.map(v => toSnakeCase(v)) as unknown as ObjectToSnakeCase<T>;
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof File) && typeof obj !== 'function') {
    const newObj: { [key: string]: unknown } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as Record<string, unknown>)[key];
        newObj[toSnakeCaseString(key)] = toSnakeCase(value);
      }
    }
    return newObj as ObjectToSnakeCase<T>;
  }
  return obj as ObjectToSnakeCase<T>;
}

// Function to convert object keys to camelCase recursively
export function toCamelCase<T>(obj: T): ObjectToCamelCase<T> {
  if (Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return obj.map(v => toCamelCase(v)) as unknown as ObjectToCamelCase<T>;
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof File) && typeof obj !== 'function') {
    const newObj: { [key: string]: unknown } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as Record<string, unknown>)[key];
        newObj[toCamelCaseString(key)] = toCamelCase(value);
      }
    }
    return newObj as ObjectToCamelCase<T>;
  }
  return obj as ObjectToCamelCase<T>;
}
