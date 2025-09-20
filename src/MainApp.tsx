import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, FAB, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import DeporteScreen from './screens/DeporteScreen';
import ConfiguracionScreen from './screens/ConfiguracionScreen';
import { useTimerContext } from './hooks/useTimerContext';
import FloatingTimer from './components/FloatingTimer';

const Tab = createBottomTabNavigator();

export default function MainApp() {
  const { state } = useTimerContext();

  return (
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

      {/* Timer flotante si está activo */}
      <Portal>
        {state.isFloating && <FloatingTimer />}
      </Portal>
    </NavigationContainer>
  );
}