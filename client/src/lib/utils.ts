import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Enhanced utility functions for the refactored web application
 */

// Date formatting utilities
export const formatDate = {
  toLocalString: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES');
  },
  
  toISOString: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  },
  
  isValid: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  }
};

// Form validation utilities
export const validators = {
  required: (value: any, fieldName: string = 'Este campo') => 
    !value || (typeof value === 'string' && value.trim() === '') 
      ? `${fieldName} es requerido` : null,
  
  email: (email: string) => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : 'Email inválido';
  },
  
  minLength: (value: string, min: number, fieldName: string = 'Este campo') =>
    value && value.length < min ? `${fieldName} debe tener al menos ${min} caracteres` : null,
  
  maxLength: (value: string, max: number, fieldName: string = 'Este campo') =>
    value && value.length > max ? `${fieldName} no puede exceder ${max} caracteres` : null,
  
  numeric: (value: string, fieldName: string = 'Este campo') => {
    if (!value) return null;
    return isNaN(Number(value)) ? `${fieldName} debe ser un número` : null;
  },
  
  positive: (value: number | string, fieldName: string = 'Este campo') => {
    const num = typeof value === 'string' ? Number(value) : value;
    return num <= 0 ? `${fieldName} debe ser positivo` : null;
  }
};

// String utilities
export const stringUtils = {
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  
  truncate: (str: string, length: number, suffix: string = '...') =>
    str.length <= length ? str : str.substring(0, length) + suffix,
  
  slugify: (str: string) => 
    str.toLowerCase()
       .replace(/[^\w\s-]/g, '')
       .replace(/[\s_-]+/g, '-')
       .replace(/^-+|-+$/g, ''),
  
  extractInitials: (name: string) => 
    name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
};

// Array utilities
export const arrayUtils = {
  groupBy: <T>(array: T[], key: keyof T) => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
  
  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },
  
  unique: <T>(array: T[], key?: keyof T) => {
    if (!key) return [...new Set(array)];
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
};

// Performance utilities
export const performance = {
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },
  
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle: boolean;
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
};

// Local storage utilities with error handling
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return defaultValue || null;
    }
  },
  
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  }
};

// Error handling utilities
export const errorHandling = {
  getErrorMessage: (error: any, fallback: string = 'Ocurrió un error inesperado') => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    return fallback;
  },
  
  logError: (error: any, context?: string) => {
    const errorInfo = {
      error: error.message || error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    console.error('Application Error:', errorInfo);
  }
};