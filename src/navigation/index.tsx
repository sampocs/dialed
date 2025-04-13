import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PlayScreen from '../screens/PlayScreen';
import RoundsScreen from '../screens/RoundsScreen';
import MetricsScreen from '../screens/MetricsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#93C757',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          backgroundColor: '#292929',
          borderTopColor: '#3D3D3D',
        },
      }}
    >
      <Tab.Screen
        name="Play"
        component={PlayScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="golf" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Rounds"
        component={RoundsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Metrics"
        component={MetricsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const appTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      primary: '#93C757',
      background: '#292929',
      card: '#292929',
      text: '#FFFFFF',
      border: '#3D3D3D',
      notification: '#93C757',
    },
  };

  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 