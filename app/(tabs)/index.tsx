
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabase'; // Your supabase client instance
import ProfileScreen from '../ProfileScreen';

// Optional: You can wrap this into a component to use inside SessionContextProvider
const MainApp = () => {

  // Optionally show a loading or login screen if user == null
  // but here we just render ProfileScreen for demo

  return (
    <ProfileScreen />
  );
};

export default function Root() {
  return (
    <SessionContextProvider
      supabaseClient={supabase}
      // For mobile apps, initialSession is usually undefined; handled internally
      initialSession={null}
      // optional: set default session event handlers here
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar
          barStyle={'dark-content'}
          backgroundColor={'#fff'}
          translucent={false}
        />
        <MainApp />
      </SafeAreaView>
    </SessionContextProvider>
  );
}
