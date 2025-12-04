import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getItem(key: string): Promise<any | null>;
  setItem(key: string, value: Object): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  clear(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('DataStorage') as Spec | null;
