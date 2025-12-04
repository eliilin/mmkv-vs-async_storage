import type { HybridObject } from 'react-native-nitro-modules';

/**
 * A high-performance data storage module using Nitro for direct native access.
 * Internal interface - uses direct object passing without JSON serialization
 */
export interface NitroDataStorageNative
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Set a value for the given key (as object).
   */
  setItem(key: string, value: Record<string, any>): void;

  /**
   * Get the value for the given key (as object), or undefined if it does not exist.
   */
  getItem(key: string): Record<string, any> | undefined;

  /**
   * Remove the value for the given key.
   */
  removeItem(key: string): boolean;

  /**
   * Get all keys stored in this instance.
   */
  getAllKeys(): string[];

  /**
   * Clear all key-value pairs from storage.
   */
  clear(): void;

  /**
   * Check if a key exists in storage.
   */
  contains(key: string): boolean;

  /**
   * Get the total number of items in storage.
   */
  readonly count: number;
}

/**
 * Public API with object serialization
 */
export interface NitroDataStorage {
  setItem(key: string, value: Record<string, any>): void;
  getItem(key: string): Record<string, any> | undefined;
  removeItem(key: string): boolean;
  getAllKeys(): string[];
  clear(): void;
  contains(key: string): boolean;
  readonly count: number;
}
