/**
 * Storage service for frontend-game (web only)
 * Uses localStorage directly (no Capacitor/native storage)
 */

export const storageSync = {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};

export default storageSync;
