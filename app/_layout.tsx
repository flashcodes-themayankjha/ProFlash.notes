
import React, { useEffect, useState } from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase'; // Your properly configured Supabase client

function Splash() {
  // Simple splash/loading screen while checking session & onboarding
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color="#1570ef" />
      <Text style={styles.splashText}>Loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // Allow free navigation on /onboard, /login, and /signup
      if (pathname === '/onboard' || pathname === '/login' || pathname === '/signup') {
        setReady(true);
        return;
      }

      // 1. Check onboarding completion
      const onboardingDone = await SecureStore.getItemAsync('onboardingComplete');
      if (!onboardingDone) {
        router.replace('/onboard');
        return;
      }

      // 2. Check authenticated user session via Supabase
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/login');
        return;
      }

      // User authenticated -> allow access to main app
      setReady(true);
    })();
  }, [pathname, router]);

  // Prevent render of child routes until ready
  return ready ? <Slot /> : <Splash />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    marginTop: 12,
    color: '#1570ef',
    fontSize: 18,
  },
});
