import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { TimerProvider } from './src/hooks/useTimerContext';
import { SyncProvider } from './src/hooks/useSyncManager';
import DeporteScreen from './src/screens/DeporteScreen';
import ConfiguracionScreen from './src/screens/ConfiguracionScreen';

const Tab = createBottomTabNavigator();

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

export default function ExpoApp() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SyncProvider>
          <TimerProvider>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof MaterialIcons.glyphMap;

                    if (route.name === 'Deporte') {
                      iconName = 'fitness-center';
                    } else if (route.name === 'Configuracion') {
                      iconName = 'settings';
                    } else {
                      iconName = 'help';
                    }

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                  },
                  tabBarActiveTintColor: '#283750',
                  tabBarInactiveTintColor: 'gray',
                  headerStyle: {
                    backgroundColor: '#283750',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                })}
              >
                <Tab.Screen
                  name="Deporte"
                  component={DeporteScreen}
                  options={{
                    title: 'Entrenamiento',
                  }}
                />
                <Tab.Screen
                  name="Configuracion"
                  component={ConfiguracionScreen}
                  options={{
                    title: 'Configuración',
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
          </TimerProvider>
        </SyncProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}