/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  runWriteTests,
  runReadTests,
  clearAllTestData,
  checkDataExists,
  WriteTestResults,
  ReadTestResults,
} from './performanceTest';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent isDarkMode={isDarkMode} />
    </SafeAreaProvider>
  );
}

function AppContent({ isDarkMode }: { isDarkMode: boolean }) {
  const safeAreaInsets = useSafeAreaInsets();
  const [writeResults, setWriteResults] = useState<WriteTestResults | null>(
    null,
  );
  const [readResults, setReadResults] = useState<ReadTestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testType, setTestType] = useState<'write' | 'read' | null>(null);
  const [selectedCount, setSelectedCount] = useState(1000);

  const runWriteTest = async () => {
    setIsRunning(true);
    setTestType('write');
    setWriteResults(null);

    try {
      const results = await runWriteTests(selectedCount);
      setWriteResults(results);
    } catch (error) {
      console.error('Write test error:', error);
      Alert.alert('Error', 'Failed to run write test');
    } finally {
      setIsRunning(false);
      setTestType(null);
    }
  };

  const runReadTest = async () => {
    // Check if data exists
    const dataInfo = checkDataExists();

    if (!dataInfo.exists) {
      Alert.alert(
        'No Data Found',
        'Please run "Test Write" first to create test data.',
      );
      return;
    }

    setIsRunning(true);
    setTestType('read');
    setReadResults(null);

    try {
      const results = await runReadTests();
      setReadResults(results);
    } catch (error) {
      console.error('Read test error:', error);
      Alert.alert('Error', 'Failed to run read test');
    } finally {
      setIsRunning(false);
      setTestType(null);
    }
  };

  const clearTests = async () => {
    Alert.alert(
      'Clear Test Data',
      'Are you sure you want to delete all test data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllTestData();
              setWriteResults(null);
              setReadResults(null);
              Alert.alert('Success', 'All test data has been cleared');
            } catch (error) {
              console.error('Clear error:', error);
              Alert.alert('Error', 'Failed to clear test data');
            }
          },
        },
      ],
    );
  };

  const testPresets = [
    { label: '100', count: 100 },
    { label: '500', count: 500 },
    { label: '1K', count: 1000 },
    { label: '5K', count: 5000 },
  ];

  const backgroundColor = isDarkMode ? '#000' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#000';
  const cardBg = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const selectedBg = isDarkMode ? '#2a2a2a' : '#e0e0e0';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: safeAreaInsets.top + 20 },
        ]}
      >
        <Text style={[styles.title, { color: textColor }]}>
          Storage Performance Test
        </Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          MMKV vs AsyncStorage
        </Text>

        {/* Item Count Selector */}
        <View style={styles.selectorContainer}>
          <Text style={[styles.selectorLabel, { color: textColor }]}>
            Items to test:
          </Text>
          <View style={styles.presetButtons}>
            {testPresets.map(preset => (
              <TouchableOpacity
                key={preset.count}
                style={[
                  styles.presetButton,
                  { backgroundColor: cardBg },
                  selectedCount === preset.count && {
                    backgroundColor: selectedBg,
                  },
                ]}
                onPress={() => setSelectedCount(preset.count)}
                disabled={isRunning}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    { color: textColor },
                    selectedCount === preset.count && styles.selectedText,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.writeButton]}
            onPress={runWriteTest}
            disabled={isRunning}
          >
            <Text style={styles.actionButtonText}>Test Write</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.readButton]}
            onPress={runReadTest}
            disabled={isRunning}
          >
            <Text style={styles.actionButtonText}>Test Read</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearTests}
            disabled={isRunning}
          >
            <Text style={styles.actionButtonText}>Clear Tests</Text>
          </TouchableOpacity>
        </View>

        {isRunning && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={[styles.loadingText, { color: textColor }]}>
              {testType === 'write' ? 'Writing data...' : 'Reading data...'}
            </Text>
          </View>
        )}

        {/* Write Results */}
        {writeResults && !isRunning && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: textColor }]}>
              Write Test Results ({writeResults.dataCount} items)
            </Text>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, styles.mmkvColor]}>MMKV</Text>
              <View style={styles.metric}>
                <Text style={[styles.metricLabel, { color: textColor }]}>
                  Write Time:
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {writeResults.mmkv.writeTime}ms
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, styles.asyncColor]}>
                AsyncStorage
              </Text>
              <View style={styles.metric}>
                <Text style={[styles.metricLabel, { color: textColor }]}>
                  Write Time:
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {writeResults.asyncStorage.writeTime}ms
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, styles.comparisonColor]}>
                Comparison
              </Text>
              <View style={styles.metric}>
                <Text style={[styles.metricLabel, { color: textColor }]}>
                  Write Speed:
                </Text>
              </View>
              <Text style={[styles.metricValue, styles.betterColor]}>
                {writeResults.mmkv.writeTime <
                writeResults.asyncStorage.writeTime
                  ? `MMKV is ${(
                      writeResults.asyncStorage.writeTime /
                      writeResults.mmkv.writeTime
                    ).toFixed(2)}x faster`
                  : `AsyncStorage is ${(
                      writeResults.mmkv.writeTime /
                      writeResults.asyncStorage.writeTime
                    ).toFixed(2)}x faster`}
              </Text>
            </View>
          </View>
        )}

        {/* Read Results */}
        {readResults && !isRunning && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: textColor }]}>
              Read Test Results ({readResults.dataCount} items)
            </Text>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, styles.mmkvColor]}>MMKV</Text>
              <View style={styles.metric}>
                <Text style={[styles.metricLabel, { color: textColor }]}>
                  Read Time:
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {readResults.mmkv.readTime}ms
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, styles.asyncColor]}>
                AsyncStorage
              </Text>
              <View style={styles.metric}>
                <Text style={[styles.metricLabel, { color: textColor }]}>
                  Read Time:
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {readResults.asyncStorage.readTime}ms
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, styles.comparisonColor]}>
                Comparison
              </Text>
              <View style={styles.metric}>
                <Text style={[styles.metricLabel, { color: textColor }]}>
                  Read Speed:
                </Text>
              </View>
              <Text style={[styles.metricValue, styles.betterColor]}>
                {readResults.mmkv.readTime < readResults.asyncStorage.readTime
                  ? `MMKV is ${(
                      readResults.asyncStorage.readTime /
                      readResults.mmkv.readTime
                    ).toFixed(2)}x faster`
                  : `AsyncStorage is ${(
                      readResults.mmkv.readTime /
                      readResults.asyncStorage.readTime
                    ).toFixed(2)}x faster`}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  presetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
  },
  presetButtonText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: 'bold',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  writeButton: {
    backgroundColor: '#4CAF50',
  },
  readButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mmkvColor: {
    color: '#4CAF50',
  },
  asyncColor: {
    color: '#FF9800',
  },
  comparisonColor: {
    color: '#2196F3',
  },
  betterColor: {
    color: '#4CAF50',
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 15,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
});

export default App;
