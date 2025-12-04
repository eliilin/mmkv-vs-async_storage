import { createMMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataStorage from './react-native-data-storage/js/index';
import { NitroDataStorage } from './react-native-nitro-data-storage/src/index';

// Use global performance API (available in React Native)
declare const performance: { now: () => number };

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
// const generateRandomNumber = (): number => {
//   return Math.floor(Math.random() * 1000000);
// };

// Generate random boolean
const generateRandomBoolean = (): boolean => {
  return Math.random() > 0.5;
};

// Generate a user object (Redux-like entity)
const generateUser = (id: number) => ({
  id,
  name: `User ${id}`,
  email: `user${id}@example.com`,
  age: Math.floor(Math.random() * 50) + 18,
  isActive: generateRandomBoolean(),
  balance: parseFloat((Math.random() * 10000).toFixed(2)),
  registeredAt: Date.now() - Math.floor(Math.random() * 31536000000), // Random time in last year
});

// Generate a product object
const generateProduct = (id: number) => ({
  id,
  name: `Product ${id}`,
  sku: generateRandomString(10),
  price: parseFloat((Math.random() * 1000).toFixed(2)),
  inStock: generateRandomBoolean(),
  quantity: Math.floor(Math.random() * 100),
  category: ['electronics', 'clothing', 'food', 'books', 'toys'][
    Math.floor(Math.random() * 5)
  ],
});

// Generate an order object
const generateOrder = (id: number) => ({
  id,
  orderId: `ORD-${generateRandomString(8)}`,
  userId: Math.floor(Math.random() * 100),
  total: parseFloat((Math.random() * 500).toFixed(2)),
  status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][
    Math.floor(Math.random() * 5)
  ],
  items: Math.floor(Math.random() * 10) + 1,
  createdAt: Date.now() - Math.floor(Math.random() * 7776000000), // Random time in last 90 days
  isPaid: generateRandomBoolean(),
});

// Generate test data as a Redux-like state tree
// This simulates how redux-persist stores state with nested entities
// Example structure:
// {
//   users: { byId: { '1': {...}, '2': {...} }, allIds: [1, 2, ...] },
//   products: { byId: { '1': {...}, '2': {...} }, allIds: [1, 2, ...] },
//   orders: { byId: { '1': {...}, '2': {...} }, allIds: [1, 2, ...] },
//   ui: { theme: 'dark', language: 'en', ... },
//   session: { isAuthenticated: true, token: '...', ... }
// }
export const generateTestData = (count: number): Record<string, any> => {
  // Distribute count across different entity types
  const usersCount = Math.floor(count * 0.3);
  const productsCount = Math.floor(count * 0.4);
  const ordersCount = Math.floor(count * 0.3);

  // Generate users in Redux normalized format
  const users: Record<string, any> = {
    byId: {},
    allIds: [],
  };
  for (let i = 0; i < usersCount; i++) {
    const user = generateUser(i);
    users.byId[i] = user;
    users.allIds.push(i);
  }

  // Generate products in Redux normalized format
  const products: Record<string, any> = {
    byId: {},
    allIds: [],
  };
  for (let i = 0; i < productsCount; i++) {
    const product = generateProduct(i);
    products.byId[i] = product;
    products.allIds.push(i);
  }

  // Generate orders in Redux normalized format
  const orders: Record<string, any> = {
    byId: {},
    allIds: [],
  };
  for (let i = 0; i < ordersCount; i++) {
    const order = generateOrder(i);
    orders.byId[i] = order;
    orders.allIds.push(i);
  }

  // Generate UI state
  const ui = {
    theme: ['light', 'dark', 'auto'][Math.floor(Math.random() * 3)],
    language: ['en', 'es', 'fr', 'de', 'zh'][Math.floor(Math.random() * 5)],
    sidebarOpen: generateRandomBoolean(),
    notifications: Math.floor(Math.random() * 20),
    lastRoute: `/page/${Math.floor(Math.random() * 10)}`,
    fontSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
  };

  // Generate session state
  const session = {
    isAuthenticated: generateRandomBoolean(),
    token: generateRandomString(64),
    refreshToken: generateRandomString(64),
    userId: Math.floor(Math.random() * usersCount),
    expiresAt: Date.now() + 3600000, // 1 hour from now
    permissions: ['read', 'write', 'delete'].filter(() =>
      generateRandomBoolean(),
    ),
  };

  // Generate app settings
  const settings = {
    version: '1.0.0',
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retryAttempts: 3,
    enableAnalytics: generateRandomBoolean(),
    enableCrashReporting: generateRandomBoolean(),
    debugMode: generateRandomBoolean(),
    maxCacheSize: Math.floor(Math.random() * 1000) + 100,
  };

  // Combine into Redux-like state tree
  return {
    users,
    products,
    orders,
    ui,
    session,
    settings,
    _metadata: {
      lastUpdated: Date.now(),
      version: '1.0.0',
      totalEntities: usersCount + productsCount + ordersCount,
    },
  };
};

// Root key for storing the entire object
// Similar to redux-persist which uses 'persist:root' or similar key
const ROOT_KEY = 'root';

// Reusable MMKV instance (created once, reused for all operations)
let reusableMmkvInstance: ReturnType<typeof createMMKV> | null = null;

const getReusableMmkvInstance = () => {
  if (!reusableMmkvInstance) {
    reusableMmkvInstance = createMMKV();
  }
  return reusableMmkvInstance;
};

// MMKV Performance Tests
// This approach mimics how redux-persist works:
// 1. Serializes entire state object to JSON string
// 2. Stores under single key
// 3. No multiSet/multiGet - just one setItem/getItem operation
export const testMmkvWrite = async (data: Record<string, string | number>) => {
  // Test with new instance each time
  const mmkvStorage = createMMKV();
  const startTime = performance.now();
  mmkvStorage.set(ROOT_KEY, JSON.stringify(data));
  const totalTime = Math.round((performance.now() - startTime) * 100) / 100;

  // Test with reusable instance
  const reusableInstance = getReusableMmkvInstance();
  const reusableStartTime = performance.now();
  reusableInstance.set(ROOT_KEY, JSON.stringify(data));
  const reusableTime =
    Math.round((performance.now() - reusableStartTime) * 100) / 100;

  return {
    totalTime,
    reusableTime,
  };
};

export const testMmkvRead = async () => {
  // Test with new instance each time
  const startTime = performance.now();
  const mmkvStorage = createMMKV();
  const jsonStr = mmkvStorage.getString(ROOT_KEY);

  let itemsRead = 0;
  if (jsonStr) {
    const data = JSON.parse(jsonStr);
    itemsRead = Object.keys(data).length;
  }
  const readTime = Math.round((performance.now() - startTime) * 100) / 100;

  // Test with reusable instance
  const reusableInstance = getReusableMmkvInstance();
  const reusableStartTime = performance.now();
  const reusableJsonStr = reusableInstance.getString(ROOT_KEY);

  if (reusableJsonStr) {
    JSON.parse(reusableJsonStr);
  }
  const reusableReadTime =
    Math.round((performance.now() - reusableStartTime) * 100) / 100;

  return {
    readTime,
    reusableReadTime,
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
  const startTime = performance.now();

  try {
    // Write entire object as JSON string to a single key
    // NOT using multiSet - just setItem like redux-persist does
    await AsyncStorage.setItem(ROOT_KEY, JSON.stringify(data));
    const totalTime = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      totalTime,
    };
  } catch (error) {
    console.error('AsyncStorage write error:', error);
    throw error;
  }
};

export const testAsyncStorageRead = async () => {
  const startTime = performance.now();

  try {
    // Read single key and deserialize
    // NOT using multiGet - just getItem like redux-persist does
    const jsonStr = await AsyncStorage.getItem(ROOT_KEY);

    let itemsRead = 0;
    if (jsonStr) {
      const data = JSON.parse(jsonStr);
      itemsRead = Object.keys(data).length;
    }

    const readTime = Math.round((performance.now() - startTime) * 100) / 100;

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

// DataStorage Performance Tests
// DataStorage stores objects directly without JSON serialization
// This is a key advantage - no need to stringify/parse
export const testDataStorageWrite = async (
  data: Record<string, string | number>,
) => {
  const startTime = performance.now();

  try {
    // DataStorage expects objects, so we wrap the entire data in an object
    await DataStorage.setItem(ROOT_KEY, data);
    const totalTime = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      totalTime,
    };
  } catch (error) {
    console.error('DataStorage write error:', error);
    throw error;
  }
};

export const testDataStorageRead = async () => {
  const startTime = performance.now();

  try {
    // Read the object directly - no JSON parsing needed
    const data = await DataStorage.getItem(ROOT_KEY);

    let itemsRead = 0;
    if (data && typeof data === 'object') {
      itemsRead = Object.keys(data).length;
    }

    const readTime = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      readTime,
      itemsRead,
    };
  } catch (error) {
    console.error('DataStorage read error:', error);
    throw error;
  }
};

export const clearDataStorage = async () => {
  await DataStorage.clear();
};

// NitroDataStorage Performance Tests
// Uses Nitro Modules for direct native access - no bridge overhead!
// Stores objects directly like DataStorage but with synchronous operations
export const testNitroDataStorageWrite = (
  data: Record<string, string | number>,
) => {
  const startTime = performance.now();

  try {
    // NitroDataStorage is synchronous - no await needed!
    NitroDataStorage.setItem(ROOT_KEY, data);
    const totalTime = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      totalTime,
    };
  } catch (error) {
    console.error('NitroDataStorage write error:', error);
    throw error;
  }
};

export const testNitroDataStorageRead = () => {
  const startTime = performance.now();

  try {
    // Synchronous read - no await!
    const data = NitroDataStorage.getItem(ROOT_KEY);

    let itemsRead = 0;
    if (data && typeof data === 'object') {
      itemsRead = Object.keys(data).length;
    }

    const readTime = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      readTime,
      itemsRead,
    };
  } catch (error) {
    console.error('NitroDataStorage read error:', error);
    throw error;
  }
};

export const clearNitroDataStorage = () => {
  NitroDataStorage.clear();
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
    reusableWriteTime: number;
  };
  asyncStorage: {
    writeTime: number;
  };
  dataStorage: {
    writeTime: number;
  };
  nitroDataStorage: {
    writeTime: number;
  };
  dataCount: number;
}

// Read test results
export interface ReadTestResults {
  mmkv: {
    readTime: number;
    reusableReadTime: number;
    itemsRead: number;
  };
  asyncStorage: {
    readTime: number;
    itemsRead: number;
  };
  dataStorage: {
    readTime: number;
    itemsRead: number;
  };
  nitroDataStorage: {
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

  // Test DataStorage Write
  console.log('Testing DataStorage write...');
  const dataStorageWriteResult = await testDataStorageWrite(testData);

  // Test NitroDataStorage Write
  console.log('Testing NitroDataStorage write...');
  const nitroDataStorageWriteResult = testNitroDataStorageWrite(testData);

  // Save metadata
  saveMetadata(itemCount);

  return {
    mmkv: {
      writeTime: mmkvWriteResult.totalTime,
      reusableWriteTime: mmkvWriteResult.reusableTime,
    },
    asyncStorage: {
      writeTime: asyncStorageWriteResult.totalTime,
    },
    dataStorage: {
      writeTime: dataStorageWriteResult.totalTime,
    },
    nitroDataStorage: {
      writeTime: nitroDataStorageWriteResult.totalTime,
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

  // Test DataStorage Read
  console.log('Testing DataStorage read...');
  const dataStorageReadResult = await testDataStorageRead();

  // Test NitroDataStorage Read
  console.log('Testing NitroDataStorage read...');
  const nitroDataStorageReadResult = testNitroDataStorageRead();

  return {
    mmkv: {
      readTime: mmkvReadResult.readTime,
      reusableReadTime: mmkvReadResult.reusableReadTime,
      itemsRead: mmkvReadResult.itemsRead,
    },
    asyncStorage: {
      readTime: asyncStorageReadResult.readTime,
      itemsRead: asyncStorageReadResult.itemsRead,
    },
    dataStorage: {
      readTime: dataStorageReadResult.readTime,
      itemsRead: dataStorageReadResult.itemsRead,
    },
    nitroDataStorage: {
      readTime: nitroDataStorageReadResult.readTime,
      itemsRead: nitroDataStorageReadResult.itemsRead,
    },
    dataCount: mmkvReadResult.itemsRead,
  };
};

// Clear all test data
export const clearAllTestData = async () => {
  await clearAsyncStorage();
  clearMmkv();
  await clearDataStorage();
  clearNitroDataStorage();
};
