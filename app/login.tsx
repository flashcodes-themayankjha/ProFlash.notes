import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import JoinForm from '../components/ui/JoinForm';

export default function LoginScreen() {
  const router = useRouter();

  // Callback after successful login/sign-up
  const handleLoginSuccess = () => {
    // Navigate to main app screen after login
    router.replace('/');
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <JoinForm onSubmitSuccess={handleLoginSuccess} />
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

