import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { TimerProvider } from './src/hooks/useTimerContext';
import { SyncProvider } from './src/hooks/useSyncManager';
import MainApp from './src/MainApp';

// Tema personalizado que coincide con los colores actuales
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#283750',
    secondary: '#6B7280',
    tertiary: '#10B981',
    error: '#EF4444',
    surface: '#FFFFFF',
    surfaceVariant: '#F9FAFB',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SyncProvider>
          <TimerProvider>
            <View style={styles.container}>
              <MainApp />
              <StatusBar style="auto" />
            </View>
          </TimerProvider>
        </SyncProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});