import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WardrobeStackParamList } from '../types';
import WardrobeScreen from '../screens/WardrobeScreen';
import AddClothingScreen from '../screens/AddClothingScreen';

const Stack = createNativeStackNavigator<WardrobeStackParamList>();

export default function WardrobeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WardrobeList" component={WardrobeScreen} />
      <Stack.Screen
        name="AddClothing"
        component={AddClothingScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
