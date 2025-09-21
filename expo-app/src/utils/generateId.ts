/**
 * Generates a unique ID for entries using timestamp and random string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};