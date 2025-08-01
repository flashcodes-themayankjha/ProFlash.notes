
// app/signup.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import SignupForm from '../components/ui/SignupForm';

export default function SignupScreen() {
  const router = useRouter();

  // Called on successful signup, navigate to login or main app as per your flow
  const handleSignupSuccess = () => {
    // For example, navigate to login screen to prompt user to login or verify email
    router.replace('/login');
  };

  // Optional: go back action - goes back to onboarding or previous screen
  const handleBack = () => {
    router.replace('/onboard');
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <SignupForm onSubmitSuccess={handleSignupSuccess} onBack={handleBack} />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
