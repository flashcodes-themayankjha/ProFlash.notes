
import React from 'react';
import { Stack } from 'expo-router';
import NavigationBar from '../../components/NavigationBar';

// No "options" export is needed here; use screenOptions prop on Stack.

export default function TabsLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // remove all headers for every screen in stack
        }}
      />
      <NavigationBar />
    </>
  );
}
