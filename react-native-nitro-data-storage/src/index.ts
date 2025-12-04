import { NitroModules } from 'react-native-nitro-modules';
import type {
  NitroDataStorageNative,
  NitroDataStorage as NitroDataStorageType,
} from './specs/NitroDataStorage.nitro';

/**
 * Wrapper class - now passes objects directly without JSON serialization!
 */
class NitroDataStorageWrapper implements NitroDataStorageType {
  private native: NitroDataStorageNative;

  constructor() {
    this.native =
      NitroModules.createHybridObject<NitroDataStorageNative>(
        'NitroDataStorage',
      );
  }

  setItem(key: string, value: Record<string, any>): void {
    // Pass object directly - no JSON.stringify!
    this.native.setItem(key, value);
  }

  getItem(key: string): Record<string, any> | undefined {
    // Get object directly - no JSON.parse!
    return this.native.getItem(key);
  }

  removeItem(key: string): boolean {
    return this.native.removeItem(key);
  }

  getAllKeys(): string[] {
    return this.native.getAllKeys();
  }

  clear(): void {
    this.native.clear();
  }

  contains(key: string): boolean {
    return this.native.contains(key);
  }

  get count(): number {
    return this.native.count;
  }
}

/**
 * The default NitroDataStorage instance.
 */
export const NitroDataStorage = new NitroDataStorageWrapper();

export type { NitroDataStorage as NitroDataStorageType } from './specs/NitroDataStorage.nitro';
