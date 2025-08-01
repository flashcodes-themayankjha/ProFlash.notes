
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { Checkbox } from 'expo-checkbox';
import { useForm, Controller } from 'react-hook-form';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import joinLottie from '@/assets/lottie/Signup.json';

const MAX_INPUT_WIDTH = 320;
const BACKGROUND_COLOR = '#fff';

type SignupFormData = {
  fullName: string;
  email: string;
  password: string;
  keepSignedIn: boolean;
};

type Props = {
  onSubmitSuccess?: () => void;
  onBack?: () => void;
};

const AnimatedPressable: React.FC<{
  onPress: () => void;
  accessibilityLabel?: string;
  style?: any;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onPress, accessibilityLabel, style, disabled, children }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!disabled) {
      onPress();
    }
  };

  return (
    <Pressable
      onPressIn={animateIn}
      onPressOut={animateOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
      disabled={disabled}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
};

const SignupForm: React.FC<Props> = ({ onSubmitSuccess, onBack }) => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      keepSignedIn: true,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.signUp(
        { email: data.email, password: data.password },
        { data: { full_name: data.fullName } }
      );
      if (error) {
        setError('email', { type: 'manual', message: error.message });
        return;
      }
      alert('Account created successfully! Please verify your email before logging in.');
      onSubmitSuccess?.();
      router.replace('/login');
    } catch (err: any) {
      setError('email', { type: 'manual', message: err.message || 'An unexpected error occurred.' });
    }
  });

  const inputStyle = (field: string) => [
    styles.input,
    focusedInput === field && styles.inputFocused,
    errors[field as keyof SignupFormData] && styles.inputError,
  ];

  const onBackPress = () => {
    if (onBack) onBack();
    else router.replace('/onboard');
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'github') => {
    if (Platform.OS !== 'web') await Haptics.selectionAsync();
    alert(`Social login via ${provider} not implemented`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back Arrow */}
      <AnimatedPressable onPress={onBackPress} accessibilityLabel="Go back to onboarding" style={styles.backButton}>
        <AntDesign name="arrowleft" size={28} color="#222B2B" />
      </AnimatedPressable>
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20} // adjust offset to your header/status bar height
>
  <ScrollView
    contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: 120 }]} 
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >

          <Animated.View style={[styles.formBody, { opacity, transform: [{ translateY }] }]}>
            <View style={styles.lottieContainer}>
              <LottieView source={joinLottie} autoPlay loop resizeMode="contain" style={styles.lottie} accessibilityRole="image" />
            </View>

            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join ProFlash and boost your productivity</Text>

            <Animated.View style={{ opacity }}>
              <Controller
                control={control}
                name="fullName"
                rules={{ required: 'Full name is required.' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={inputStyle('fullName')}
                    placeholder="Full Name"
                    placeholderTextColor="#93a1b0"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedInput('fullName')}
                    onBlur={() => setFocusedInput(null)}
                    accessible
                    accessibilityLabel="Full name input"
                  />
                )}
              />
              {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}
            </Animated.View>

            <Animated.View style={{ opacity }}>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required.',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address.' },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={inputStyle('email')}
                    placeholder="Email"
                    placeholderTextColor="#93a1b0"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    accessible
                    accessibilityLabel="Email input"
                  />
                )}
              />
              {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            </Animated.View>

            <Animated.View style={{ opacity }}>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password is required.',
                  minLength: { value: 6, message: 'Please enter at least 6 characters.' },
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[inputStyle('password'), styles.inputPassword]}
                      placeholder="Password"
                      placeholderTextColor="#93a1b0"
                      autoCapitalize="none"
                      secureTextEntry={!passwordVisible}
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      accessible
                      accessibilityLabel="Password input"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setPasswordVisible(v => !v)}
                      accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={22} color="#999" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
            </Animated.View>

            <Animated.View style={{ opacity }}>
              <View style={styles.checkboxRow}>
                <Controller
                  control={control}
                  name="keepSignedIn"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <Checkbox
                        value={value}
                        onValueChange={onChange}
                        color="#1570ef"
                        style={styles.checkbox}
                        accessibilityLabel="Keep me signed in"
                        accessible
                      />
                      <Text style={styles.checkboxLabel}>Keep me signed in</Text>
                    </>
                  )}
                />
              </View>
            </Animated.View>

            <AnimatedPressable onPress={onSubmit} style={styles.joinButton} accessibilityLabel="Create account" disabled={isSubmitting}>
              <Text style={styles.joinButtonText}>{isSubmitting ? 'Signing up...' : 'Sign Up'}</Text>
            </AnimatedPressable>

            <Text style={styles.socialSeparator}>or continue with</Text>

            <Animated.View style={{ opacity }}>
              <View style={styles.socialRow}>
                <AnimatedPressable onPress={() => handleSocialLogin('google')} accessibilityLabel="Sign up with Google" style={styles.socialButton}>
                  <AntDesign name="google" size={28} color="#EA4335" />
                </AnimatedPressable>
                <AnimatedPressable onPress={() => handleSocialLogin('github')} accessibilityLabel="Sign up with GitHub" style={styles.socialButton}>
                  <AntDesign name="github" size={28} color="#171515" />
                </AnimatedPressable>
                {Platform.OS === 'ios' && (
                  <AnimatedPressable onPress={() => handleSocialLogin('apple')} accessibilityLabel="Sign up with Apple" style={styles.socialButton}>
                    <FontAwesome name="apple" size={28} color="#000" />
                  </AnimatedPressable>
                )}
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 52,
    left: 14,
    zIndex: 99,
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 22,
    padding: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24, 
    paddingHorizontal: 18,
         paddingBottom: 120,
    justifyContent: 'flex-start',
  },
  formBody: {
    width: '100%',
    alignItems: 'center',
  },
  lottieContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  lottie: {
    width: MAX_INPUT_WIDTH,
    height: MAX_INPUT_WIDTH,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222B2B',
    letterSpacing: 1,
    marginBottom: 5,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1570ef',
    marginBottom: 18,
    letterSpacing: 0.13,
    textAlign: 'center',
  },
  input: {
    width: MAX_INPUT_WIDTH,
    borderWidth: 1.2,
    borderColor: '#d4dbe4',
    borderRadius: 9,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 9,
    backgroundColor: '#f6faff',
    color: '#11181a',
  },
  inputFocused: {
    borderColor: '#1570ef',
    borderWidth: 2,
    backgroundColor: '#e6f0ff',
  },
  inputError: {
    borderColor: '#e53935',
    backgroundColor: '#fff2f2',
  },
  passwordRow: {
    width: MAX_INPUT_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  inputPassword: {
    flex: 1,
    marginRight: 8,
  },
  eyeIcon: {
    padding: 6,
  },
  checkboxRow: {
    width: '100%',
    maxWidth: MAX_INPUT_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  checkbox: {
    marginRight: 8,
    width: 20,
    height: 20,
    borderRadius: 4,
    borderColor: '#a0aec0',
    borderWidth: 1,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#222B2B',
    fontWeight: '600',
    lineHeight: 20,
  },
  joinButton: {
    width: '100%',
    maxWidth: MAX_INPUT_WIDTH,
    alignSelf: 'center',
    backgroundColor: '#1570ef',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1570ef',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 7,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  socialSeparator: {
    color: '#b3b6bc',
    fontWeight: '500',
    fontSize: 13.5,
    marginTop: 10,
    marginBottom: 14,
    letterSpacing: 0.08,
    textAlign: 'center',
  },
  socialRow: {
    width: '100%',
    maxWidth: MAX_INPUT_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  socialButton: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 999,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1.1,
    borderColor: BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#e53935',
    marginBottom: 4,
    fontSize: 13,
    marginLeft: 4,
    alignSelf: 'flex-start',
    maxWidth: MAX_INPUT_WIDTH,
  },
});

export default SignupForm;
