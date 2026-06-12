// LocalStorage utility for persisting application state
import { api } from "./api";

export const STORAGE_KEYS = {
  SCHEMA: "currentSchema",
  SETTINGS: "appSettings",
  HISTORY: "generationHistory",
  LAST_GENERATED: "lastGeneratedData",
};

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
  }
}

export function clearAllStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

// Generation history management
export interface GenerationRecord {
  id: string;
  name: string;
  tableName: string;
  rows: number;
  format: "csv" | "json" | "sql";
  timestamp: string;
  size: string;
}

export function addGenerationToHistory(record: GenerationRecord): void {
  const history = loadFromStorage<GenerationRecord[]>(STORAGE_KEYS.HISTORY, []);
  history.unshift(record);
  // Keep only last 50 records
  const trimmedHistory = history.slice(0, 50);
  saveToStorage(STORAGE_KEYS.HISTORY, trimmedHistory);

  // Sync with real database via API
  api.saveGeneration(record).catch(err => 
    console.error("Failed to sync history to server:", err)
  );
}

export function getGenerationHistory(): GenerationRecord[] {
  return loadFromStorage<GenerationRecord[]>(STORAGE_KEYS.HISTORY, []);
}

export function deleteGenerationRecord(id: string): void {
  const history = getGenerationHistory();
  const filtered = history.filter((record) => record.id !== id);
  saveToStorage(STORAGE_KEYS.HISTORY, filtered);
}
