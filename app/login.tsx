
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@supabase/auth-helpers-react'; // use official hook for auth state
import JoinForm from '../components/ui/JoinForm';

export default function LoginScreen() {
  const router = useRouter();
  const user = useUser();

  // Monitor login state: redirect if user is signed in
  useEffect(() => {
    if (user) {
      // User just signed in, navigate away from login screen
      router.replace('/');
    }
  }, [user, router]);

  // Optionally, you can display a loading indicator while checking auth state
  if (user === undefined) {
    // User is still loading (depends on your auth provider implementation)
    return (
      <View style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color="#157efb" />
      </View>
    );
  }

  // If no user, show login form
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <JoinForm 
          onSubmitSuccess={() => {
            // on successful login, the 'user' state updates, triggering redirect
            // So you usually do not need to handle navigation here manually
          }}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
