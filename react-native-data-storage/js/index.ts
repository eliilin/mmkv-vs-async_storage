import NativeDataStorage from './NativeDataStorage';

if (NativeDataStorage == null) {
  console.error('ReactNativeDataStorage: Native module is null.');
  throw new Error(
    'ReactNativeDataStorage: Native module not found. ' +
      'Ensure the iOS build includes ReactNativeDataStorage and the app uses the new architecture.',
  );
}

export interface Storage {
  getItem(key: string, ...args: Array<any>): any;
  setItem(key: string, value: any, ...args: Array<any>): any;
  removeItem(key: string, ...args: Array<any>): any;
  keys?: Array<string>;
  getAllKeys(cb?: any): any;
}

class DataStorageAdapter implements Storage {
  async getItem(key: string): Promise<any | null> {
    return NativeDataStorage!.getItem(key);
  }

  async setItem(key: string, value: any): Promise<void> {
    if (typeof value !== 'object' || value === null) {
      throw new Error('DataStorage: value must be a non-null object');
    }
    return NativeDataStorage!.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return NativeDataStorage!.removeItem(key);
  }

  async getAllKeys(
    cb?: (error?: Error, keys?: string[]) => void,
  ): Promise<string[]> {
    try {
      const keys = await NativeDataStorage!.getAllKeys();
      if (cb) {
        cb(undefined, keys);
      }
      return keys;
    } catch (error) {
      if (cb) {
        cb(error as Error);
      }
      throw error;
    }
  }

  async clear(): Promise<void> {
    return NativeDataStorage!.clear();
  }

  get keys(): Array<string> {
    console.warn(
      'DataStorage: synchronous "keys" property is not supported. Use getAllKeys() instead.',
    );
    return [];
  }
}

export const DataStorage = new DataStorageAdapter();
export default DataStorage;
