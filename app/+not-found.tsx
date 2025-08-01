
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LottieView from 'lottie-react-native';
import { useRef } from 'react';
import notFoundAnimation from '@/assets/lottie/Error.json';

export const options = {
  headerShown: false, // Disable default header for this screen
};

export default function NotFoundScreen() {
  const animationRef = useRef<LottieView>(null);

  return (
    <ThemedView style={styles.container}>
      <LottieView
        ref={animationRef}
        source={notFoundAnimation}
        autoPlay
        loop
        style={styles.lottie}
        accessibilityLabel="Error animation"
      />
      <ThemedText type="title" style={styles.title}>
        This screen does not exist yet.
      </ThemedText>
      <ThemedText type="default" style={styles.infoLine}>
        It’s being developed by Mayank Jha.
      </ThemedText>
      <Link href="/" style={styles.link} accessibilityRole="link" accessibilityLabel="Go to home screen">
        <ThemedText type="link" style={styles.linkText}>
          Go to home screen!
        </ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Light background for ProFlash theme
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lottie: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  title: {
    color: '#222', // Darker text for title
    marginBottom: 8,
    textAlign: 'center',
  },
  infoLine: {
    color: '#555', // Softer gray for subtitle/info
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  link: {
    paddingVertical: 15,
  },
  linkText: {
    color: '#157efb', // ProFlash primary blue link
    fontWeight: '700',
    fontSize: 16,
  },
});
