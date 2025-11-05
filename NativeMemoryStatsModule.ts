import { NativeModules } from 'react-native';

interface MemoryStatsModuleInterface {
  getMemoryUsageMB(): Promise<number>;
}

const { MemoryStatsModule } = NativeModules;

export default MemoryStatsModule as MemoryStatsModuleInterface;
