# MMKV vs AsyncStorage Performance Test

This is a [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli), that compares the performance of MMKV and AsyncStorage for read/write operations.

![Performance Test Results](assets/screenshot.png)

## Performance Test Results (5000 items)

### Write Performance

- **MMKV**: 2ms
- **AsyncStorage**: 3ms
- **Result**: MMKV is **1.50x faster** for write operations

### Read Performance

- **MMKV**: 3ms
- **AsyncStorage**: 2ms
- **Result**: MMKV is **0.67x faster** (AsyncStorage is slightly faster for reads)

### Summary

The performance tests show that:

- MMKV excels at **write operations**, being 1.5x faster than AsyncStorage
- AsyncStorage performs slightly better at **read operations**
- Both libraries handle 5000 items in just a few milliseconds, demonstrating excellent performance

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Prerequisites

- **Node.js**: v20.12.0 or higher (required for React Native 0.82+)
  - Check your version: `node --version`
  - If you need to upgrade, use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 --latest-npm`
- Make sure you have completed the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment).

### Installation

1. Install dependencies:

```sh
npm install
# or
yarn install
```

2. Install iOS dependencies:

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
cd ios
bundle exec pod install
cd ..
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

### Running the App

#### Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

#### Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

**Android:**

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

**iOS:**

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

#### Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## About MMKV

MMKV is an efficient, small mobile key-value storage framework developed by WeChat. It provides:

- Fast read/write operations
- Small memory footprint
- Support for multiple data types
- Encryption support

## About AsyncStorage

AsyncStorage is an asynchronous, persistent, key-value storage system that is:

- Part of React Native core
- Simple to use
- Suitable for small to medium amounts of data

## Troubleshooting

### Node.js Version Error

If you encounter the error `(0 , _util.styleText) is not a function` when running `npm start`, this means your Node.js version is too old. React Native 0.82+ requires Node.js v20.12.0 or higher.

**Solution:**
1. Check your Node.js version: `node --version`
2. If you're using nvm, upgrade to the latest Node.js 20: `nvm install 20 --latest-npm`
3. If you're not using nvm, download and install Node.js v20.12.0+ from [nodejs.org](https://nodejs.org/)

For other issues, see the [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## Learn More

- [MMKV GitHub](https://github.com/Tencent/MMKV)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Native Documentation](https://reactnative.dev)

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

## Congratulations! 🎉

You've successfully run and modified your React Native App. 🎊
