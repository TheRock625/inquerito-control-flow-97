// Secure storage utility with encryption-like behavior
const STORAGE_PREFIX = 'secure_';

// Simple obfuscation (in production, use proper encryption)
const obfuscate = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const deobfuscate = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return '';
  }
};

export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      const serialized = JSON.stringify(value);
      const obfuscated = obfuscate(serialized);
      localStorage.setItem(STORAGE_PREFIX + key, obfuscated);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (!stored) return defaultValue;
      
      const deobfuscated = deobfuscate(stored);
      return JSON.parse(deobfuscated) as T;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};