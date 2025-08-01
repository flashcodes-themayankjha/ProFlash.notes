
import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingForm from '../components/OnboardingForm';
import * as SecureStore from 'expo-secure-store';

export default function OnboardScreen() {
  const router = useRouter();

  const handleOnboardingSuccess = async () => {
    await SecureStore.setItemAsync('onboardingComplete', 'true');
    router.replace('/login');
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#23272e"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <OnboardingForm onJoinPress={handleOnboardingSuccess} />
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
