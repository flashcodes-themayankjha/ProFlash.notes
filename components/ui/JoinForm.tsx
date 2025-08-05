
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  ToastAndroid,
  AccessibilityInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase'; // Your Supabase client
import joinLottie from '@/assets/lottie/Login.json';
import * as Linking from 'expo-linking';

interface LoginFormData {
  email: string;
  password: string;
  keepSignedIn: boolean;
}

const Login = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', keepSignedIn: true },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError('');
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Supabase signInWithPassword supports session persistence via options:
      // But Expo SDK for Supabase may differ; adapt if needed.
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setFormError(error.message);
        // Optionally, mark fields as error for accessibility
        setError('password', { type: 'manual', message: error.message });
        return;
      }

      // On success, route to main app
      router.replace('/');
    } catch {
      setFormError('Unexpected error. Please try again.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'apple') => {
    if (Platform.OS !== 'web') await Haptics.selectionAsync();

    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });
      if (error) {
        setFormError(error.message);
      } else {
        router.replace('/');
      }
    } catch (error: any) {
      setFormError(`Authentication error: ${error.message}`);
    }
  };

  const inputStyle = (fieldName: keyof LoginFormData) => [
    styles.input,
    errors[fieldName] && styles.inputError,
    focusedInput === fieldName && styles.inputFocused,
  ];

  // Accessibility announcement when toggling password visibility
  const togglePasswordVisibility = useCallback(async () => {
    setPasswordVisible((prev) => {
      const newValue = !prev;
      const announcement = newValue ? 'Password visible' : 'Password hidden';
      AccessibilityInfo.announceForAccessibility(announcement);
      return newValue;
    });
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
      >
        <View style={styles.container}>
          <View style={styles.lottieContainer}>
            <LottieView source={joinLottie} autoPlay loop style={styles.lottie} />
          </View>

          <Animated.View style={[styles.formContainer, { opacity, transform: [{ translateY }] }]}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to ProFlash to continue</Text>

            {formError ? <Text style={styles.formErrorText} accessibilityLiveRegion="polite">{formError}</Text> : null}

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={inputStyle('email')}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  importantForAutofill="yes"
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[inputStyle('password'), { flex: 1 }]}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                    textContentType="password"
                    autoComplete="password"
                    importantForAutofill="yes"
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={styles.eyeIcon}
                    accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                    accessibilityHint="Toggles password visibility"
                    accessible={true}
                  >
                    <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={22} color="#999" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              accessibilityHint="Navigate to forgot password screen"
            >
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>

            <Controller
              control={control}
              name="keepSignedIn"
              render={({ field: { value, onChange } }) => (
                <View style={styles.checkboxRow}>
                  <Checkbox 
                    value={value} 
                    onValueChange={onChange} 
                    color="#157efb" 
                    accessibilityLabel="Keep me signed in"
                    accessibilityHint="Toggle whether to keep signed in"
                  />
                  <Text style={styles.checkboxLabel}>Keep me signed in</Text>
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Login button"
              accessibilityState={{ busy: isSubmitting }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.orText}>or continue with</Text>

            <View style={styles.socialRow}>
              <TouchableOpacity
                onPress={() => handleSocialLogin('google')}
                style={styles.socialButton}
                accessibilityLabel="Login with Google"
                accessibilityRole="button"
              >
                <AntDesign name="google" size={28} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialLogin('github')}
                style={styles.socialButton}
                accessibilityLabel="Login with GitHub"
                accessibilityRole="button"
              >
                <AntDesign name="github" size={28} color="#000" />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => handleSocialLogin('apple')}
                  style={styles.socialButton}
                  accessibilityLabel="Login with Apple"
                  accessibilityRole="button"
                >
                  <FontAwesome name="apple" size={28} color="#000" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.signupPrompt}>
              <Text>
                Don&apos;t have an account?{' '}
                <Text
                  style={styles.signupLink}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push('/signup');
                  }}
                  accessibilityRole="button"
                  accessibilityHint="Navigate to sign up screen"
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  lottieContainer: { alignItems: 'center', marginTop: 36 },
  lottie: { width: joinLottie ? 200 : 0, height: joinLottie ? 200 : 0 },
  formContainer: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 8, color: '#222' },
  subtitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 20, color: '#157efb' },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#f6faff',
  },
  inputFocused: { borderColor: '#157efb', borderWidth: 2, backgroundColor: '#eef7ff' },
  inputError: { borderColor: '#e44', backgroundColor: '#ffeeee' },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeIcon: { padding: 8 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  linkText: { color: '#157efb', textDecorationLine: 'underline', fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkboxLabel: { marginLeft: 8, fontSize: 15 },
  loginButton: {
    backgroundColor: '#157efb',
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  orText: { textAlign: 'center', color: '#777', marginBottom: 20 },
  socialRow: { flexDirection: 'row', justifyContent: 'center' },
  socialButton: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 40,
    padding: 12,
    elevation: 3,
  },
  signupPrompt: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  signupLink: { color: '#157efb', fontWeight: '700' },
  errorText: { color: '#e44', marginBottom: 8, fontSize: 14 },
  formErrorText: { color: '#e44', fontSize: 16, fontWeight: '600', marginBottom: 12 },
});

export default Login;
