import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { TimerProvider } from './src/hooks/useTimerContext';
import { SyncProvider } from './src/hooks/useSyncManager';
import InicioScreen from './src/screens/InicioScreen';
import DeporteScreen from './src/screens/DeporteScreen';
import ConfiguracionScreen from './src/screens/ConfiguracionScreen';
import MentalCheckScreen from './src/screens/MentalCheckScreen';
import CheckinRapidoScreen from './src/screens/CheckinRapidoScreen';
import TecnicasRespiracionScreen from './src/screens/TecnicasRespiracionScreen';
import ManejoCrisisScreen from './src/screens/ManejoCrisisScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator para la sección Inicio (incluye MentalCheck)
function InicioStack() {
  return (
    <Stack.Navigator id="InicioStack">
      <Stack.Screen
        name="InicioHome"
        component={InicioScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MentalCheck"
        component={MentalCheckScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CheckinRapido"
        component={CheckinRapidoScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TecnicasRespiracion"
        component={TecnicasRespiracionScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ManejoCrisis"
        component={ManejoCrisisScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator para la sección Deporte
function DeporteStack() {
  return (
    <Stack.Navigator id="DeporteStack">
      <Stack.Screen
        name="DeporteHome"
        component={DeporteScreen}
        options={{
          title: 'Entrenamiento',
          headerStyle: { backgroundColor: '#283750' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator para la sección Configuración
function ConfiguracionStack() {
  return (
    <Stack.Navigator id="ConfiguracionStack">
      <Stack.Screen
        name="ConfiguracionHome"
        component={ConfiguracionScreen}
        options={{
          title: 'Configuración',
          headerStyle: { backgroundColor: '#283750' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}

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
                id="MainTabNavigator"
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof MaterialIcons.glyphMap;

                    if (route.name === 'Inicio') {
                      iconName = 'home';
                    } else if (route.name === 'Deporte') {
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
                  name="Inicio"
                  component={InicioStack}
                  options={{
                    title: 'Inicio',
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name="Deporte"
                  component={DeporteStack}
                  options={{
                    title: 'Entrenamiento',
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name="Configuracion"
                  component={ConfiguracionStack}
                  options={{
                    title: 'Configuración',
                    headerShown: false,
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