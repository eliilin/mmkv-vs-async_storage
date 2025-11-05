import { createMMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate random string
const generateRandomString = (length: number): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random number
const generateRandomNumber = (): number => {
  return Math.floor(Math.random() * 1000000);
};

// Generate test data as an object with nested keys
// This simulates how redux-persist stores state:
// Instead of 1000 separate keys, it stores one root object with N nested properties
// Example: { "key_0": "value", "key_1": 123, ... "key_999": "data" }
export const generateTestData = (
  count: number,
): Record<string, string | number> => {
  const data: Record<string, string | number> = {};

  for (let i = 0; i < count; i++) {
    const isString = Math.random() > 0.5;
    data[`key_${i}`] = isString
      ? generateRandomString(50)
      : generateRandomNumber();
  }

  return data;
};

// Root key for storing the entire object
// Similar to redux-persist which uses 'persist:root' or similar key
const ROOT_KEY = 'root';

// MMKV Performance Tests
// This approach mimics how redux-persist works:
// 1. Serializes entire state object to JSON string
// 2. Stores under single key
// 3. No multiSet/multiGet - just one setItem/getItem operation
export const testMmkvWrite = async (data: Record<string, string | number>) => {
  // Initialize MMKV instance
  const mmkvStorage = createMMKV();
  const startTime = Date.now();

  // Write entire object as JSON string to a single key
  // This is exactly how redux-persist stores: JSON.stringify(state)
  mmkvStorage.set(ROOT_KEY, JSON.stringify(data));

  const totalTime = Date.now() - startTime;

  return {
    totalTime,
  };
};

export const testMmkvRead = async () => {
  const startTime = Date.now();

  const mmkvStorage = createMMKV();
  const jsonStr = mmkvStorage.getString(ROOT_KEY);

  let itemsRead = 0;
  if (jsonStr) {
    // Parse JSON back to object - same as redux-persist does
    const data = JSON.parse(jsonStr);
    itemsRead = Object.keys(data).length;
  }

  const readTime = Date.now() - startTime;

  return {
    readTime,
    itemsRead,
  };
};

export const clearMmkv = () => {
  const mmkvStorage = createMMKV();
  mmkvStorage.clearAll();
};

// AsyncStorage Performance Tests
// Uses the same pattern as MMKV - single key with serialized object
// This is the standard approach for redux-persist and most state management
export const testAsyncStorageWrite = async (
  data: Record<string, string | number>,
) => {
  const startTime = Date.now();

  try {
    // Write entire object as JSON string to a single key
    // NOT using multiSet - just setItem like redux-persist does
    await AsyncStorage.setItem(ROOT_KEY, JSON.stringify(data));
    const totalTime = Date.now() - startTime;

    return {
      totalTime,
    };
  } catch (error) {
    console.error('AsyncStorage write error:', error);
    throw error;
  }
};

export const testAsyncStorageRead = async () => {
  const startTime = Date.now();

  try {
    // Read single key and deserialize
    // NOT using multiGet - just getItem like redux-persist does
    const jsonStr = await AsyncStorage.getItem(ROOT_KEY);

    let itemsRead = 0;
    if (jsonStr) {
      const data = JSON.parse(jsonStr);
      itemsRead = Object.keys(data).length;
    }

    const readTime = Date.now() - startTime;

    return {
      readTime,
      itemsRead,
    };
  } catch (error) {
    console.error('AsyncStorage read error:', error);
    throw error;
  }
};

export const clearAsyncStorage = async () => {
  await AsyncStorage.clear();
};

// Metadata key to track if data exists
const METADATA_KEY = '__test_metadata__';

// Save metadata about written data
export const saveMetadata = (itemCount: number) => {
  const mmkvStorage = createMMKV();
  mmkvStorage.set(
    METADATA_KEY,
    JSON.stringify({
      itemCount,
      timestamp: Date.now(),
    }),
  );
};

// Check if test data exists
export const checkDataExists = (): {
  exists: boolean;
  itemCount: number;
  timestamp: number;
} => {
  const mmkvStorage = createMMKV();
  const metadataStr = mmkvStorage.getString(METADATA_KEY);

  if (!metadataStr) {
    return { exists: false, itemCount: 0, timestamp: 0 };
  }

  try {
    const metadata = JSON.parse(metadataStr);
    return { exists: true, ...metadata };
  } catch {
    return { exists: false, itemCount: 0, timestamp: 0 };
  }
};

// Write test results
export interface WriteTestResults {
  mmkv: {
    writeTime: number;
  };
  asyncStorage: {
    writeTime: number;
  };
  dataCount: number;
}

// Read test results
export interface ReadTestResults {
  mmkv: {
    readTime: number;
    itemsRead: number;
  };
  asyncStorage: {
    readTime: number;
    itemsRead: number;
  };
  dataCount: number;
}

// Run only write tests
export const runWriteTests = async (
  itemCount: number,
): Promise<WriteTestResults> => {
  // Generate test data
  console.log(`Generating ${itemCount} test items...`);
  const testData = generateTestData(itemCount);

  // Test MMKV Write
  console.log('Testing MMKV write...');
  const mmkvWriteResult = await testMmkvWrite(testData);

  // Test AsyncStorage Write
  console.log('Testing AsyncStorage write...');
  const asyncStorageWriteResult = await testAsyncStorageWrite(testData);

  // Save metadata
  saveMetadata(itemCount);

  return {
    mmkv: {
      writeTime: mmkvWriteResult.totalTime,
    },
    asyncStorage: {
      writeTime: asyncStorageWriteResult.totalTime,
    },
    dataCount: itemCount,
  };
};

// Run only read tests
export const runReadTests = async (): Promise<ReadTestResults> => {
  // Test MMKV Read
  console.log('Testing MMKV read...');
  const mmkvReadResult = await testMmkvRead();

  // Test AsyncStorage Read
  console.log('Testing AsyncStorage read...');
  const asyncStorageReadResult = await testAsyncStorageRead();

  return {
    mmkv: {
      readTime: mmkvReadResult.readTime,
      itemsRead: mmkvReadResult.itemsRead,
    },
    asyncStorage: {
      readTime: asyncStorageReadResult.readTime,
      itemsRead: asyncStorageReadResult.itemsRead,
    },
    dataCount: mmkvReadResult.itemsRead,
  };
};

// Clear all test data
export const clearAllTestData = async () => {
  await clearAsyncStorage();
  clearMmkv();
};
