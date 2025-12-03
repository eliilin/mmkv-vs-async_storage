import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  addNumbers(a: number, b: number): number;
}

export default TurboModuleRegistry.get<Spec>('DataStorage') as Spec | null;
