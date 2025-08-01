
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

// High-contrast light mode Lottie asset
import joinUsLight from '@/assets/lottie/illustration.json';

const { width } = Dimensions.get('window');
const LOTTIE_SIZE = Math.min(width * 0.92, 384);

type Props = {
  onJoinPress: () => void;
};

const ProFlashTagline = 'Boost your productivity with AI-powered simplicity.';

const OnboardingForm: React.FC<Props> = ({ onJoinPress }) => {
  // Animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-24)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(-12)).current;

  const lottieScale = useRef(new Animated.Value(0.7)).current;
  const lottieOpacity = useRef(new Animated.Value(0)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(lottieScale, {
          toValue: 1,
          friction: 4,
          tension: 130,
          useNativeDriver: true,
        }),
        Animated.timing(lottieOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    titleOpacity,
    titleTranslateY,
    taglineOpacity,
    taglineTranslateY,
    lottieScale,
    lottieOpacity,
    buttonOpacity,
    buttonScale,
  ]);

  // Handler for Join Us button with tactile feedback
  const handleJoinPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.93,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onJoinPress();
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Animated Title */}
        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
          accessibilityRole="header"
        >
          ProFlash
        </Animated.Text>
        {/* Animated Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          {ProFlashTagline}
        </Animated.Text>
        {/* Lottie illustration */}
        <Animated.View
          style={{
            opacity: lottieOpacity,
            transform: [{ scale: lottieScale }],
          }}
        >
          <LottieView
            source={joinUsLight}
            autoPlay
            loop
            resizeMode="contain"
            style={styles.lottie}
            accessibilityRole="image"
          />
        </Animated.View>
        {/* Animated Join Us button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinPress}
            activeOpacity={0.85}
            accessibilityLabel="Join us to get started"
            accessibilityRole="button"
          >
            <Text style={styles.joinButtonText}>Join Us</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 12,
    position: 'relative',
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#222B2B',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 0,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#1570ef',
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.15,
    paddingHorizontal: 8,
  },
  lottie: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
    marginBottom: 32,
    alignSelf: 'center',
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#1570ef',
    borderRadius: 30,
    paddingVertical: 18,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#1570ef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 0.6,
  },
});

export default OnboardingForm;
