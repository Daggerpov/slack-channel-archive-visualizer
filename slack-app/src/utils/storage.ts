import { SlackExport } from '../types/slack';

const STORAGE_KEY = 'slack_archive_data';
const AUTH_KEY = 'slack_archive_auth';

export interface StoredAuth {
  role: 'guest' | 'club' | 'admin';
  timestamp: number;
}

export class StorageManager {
  // Authentication storage
  static saveAuth(role: 'guest' | 'club' | 'admin'): void {
    const authData: StoredAuth = {
      role,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  }

  static getAuth(): StoredAuth | null {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (!stored) return null;
      
      const authData: StoredAuth = JSON.parse(stored);
      
      // Check if auth is expired (24 hours)
      const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        localStorage.removeItem(AUTH_KEY);
        return null;
      }
      
      return authData;
    } catch (error) {
      console.error('Error reading auth from storage:', error);
      return null;
    }
  }

  static clearAuth(): void {
    localStorage.removeItem(AUTH_KEY);
  }

  // Data storage
  static saveSlackData(data: SlackExport): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Error saving Slack data to storage:', error);
      // If localStorage is full, try to clear old data and retry
      this.clearSlackData();
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (retryError) {
        console.error('Failed to save data even after clearing storage:', retryError);
        throw new Error('Unable to save data - storage may be full');
      }
    }
  }

  static getSlackData(): SlackExport | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      return JSON.parse(stored) as SlackExport;
    } catch (error) {
      console.error('Error reading Slack data from storage:', error);
      // Clear corrupted data
      this.clearSlackData();
      return null;
    }
  }

  static clearSlackData(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static hasStoredData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    let available = 0;
    
    try {
      // Calculate used space
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Estimate available space (most browsers limit to ~5-10MB)
      const testKey = 'test_storage_limit';
      let testSize = 1024; // Start with 1KB
      
      try {
        while (testSize < 10 * 1024 * 1024) { // Up to 10MB
          localStorage.setItem(testKey, 'x'.repeat(testSize));
          localStorage.removeItem(testKey);
          testSize *= 2;
        }
        available = testSize / 2;
      } catch {
        available = testSize / 2;
      }
      
      localStorage.removeItem(testKey);
    } catch (error) {
      console.warn('Could not calculate storage info:', error);
    }
    
    const total = used + available;
    const percentage = total > 0 ? (used / total) * 100 : 0;
    
    return { used, available, percentage };
  }
}
