import NativeDataStorage from './NativeDataStorage';

if (NativeDataStorage == null) {
  console.error('ReactNativeDataStorage: Native module is null.');
  throw new Error(
    'ReactNativeDataStorage: Native module not found. ' +
      'Ensure the iOS build includes ReactNativeDataStorage and the app uses the new architecture.',
  );
}

export const ReactNativeDataStorage = NativeDataStorage;
