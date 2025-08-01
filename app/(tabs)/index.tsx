
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  TextInput,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Easing,
  Pressable,
  Modal,
  Dimensions,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const DEFAULT_PROFILE_PIC =
  'https://ui-avatars.com/api/?background=157efb&color=fff&size=256&name=User';

export default function ProfileScreen() {
  const router = useRouter();

  // Profile states
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [name, setName] = useState('Mayank Jha');
  const [focusMode, setFocusMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Working on ProFlash UI/UX');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Info Popup State & Animation Refs
  const [infoVisible, setInfoVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleRef = useRef<Text>(null);

  // Request media library permission on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'Permission to access gallery is needed to change your profile picture.'
          );
        }
      }
    })();
  }, []);

  // Accessibility focus on info popup title when shown
  useEffect(() => {
    if (infoVisible && titleRef.current) {
      const reactTag = findNodeHandle(titleRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  }, [infoVisible]);

  // Open Info popup with animation
  const openInfo = () => {
    setInfoVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close Info popup with animation
  const closeInfo = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setInfoVisible(false));
  };

  // Launch Image Picker for profile
  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.cancelled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setProfilePic(result.uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Toggle Focus Mode
  const toggleFocusMode = () => {
    Haptics.selectionAsync();
    setFocusMode((prev) => !prev);
  };

  // Toggle Theme (local toggle - replace with your app theme logic)
  const toggleTheme = () => {
    Haptics.selectionAsync();
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Handle Save button press (mock)
  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Profile Saved', 'Your profile details have been saved successfully.');
    // Add persistent save logic here
  };

  // Logout action
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.replace('/onboard') },
    ]);
  };

  // Theme based dynamic styles
  const isLight = theme === 'light';
  const backgroundColor = isLight ? '#fff' : '#121212';
  const textColor = isLight ? '#222' : '#eee';
  const inputBgColor = isLight ? '#f6faff' : '#1f1f1f';
  const borderColor = isLight ? '#157efb' : '#5599ff';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar
        barStyle={isLight ? 'dark-content' : 'light-content'}
        backgroundColor={backgroundColor}
      />

      {/* Info button (top-left) */}
      <TouchableOpacity
        style={[
          styles.infoButton,
          { backgroundColor: isLight ? 'rgba(21,126,251,0.15)' : 'rgba(85,153,255,0.2)' },
        ]}
        onPress={openInfo}
        accessibilityRole="button"
        accessibilityLabel="Information"
        accessibilityHint="Shows details about this app"
      >
        <Ionicons
          name="information-circle-outline"
          size={28}
          color={isLight ? '#157efb' : '#5599ff'}
        />
      </TouchableOpacity>

      {/* Logout button (top-right) */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        accessibilityHint="Logs you out and redirects to onboarding form"
      >
        <Ionicons
          name="log-out-outline"
          size={28}
          color={isLight ? '#157efb' : '#5599ff'}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Profile Picture Section */}
        <TouchableOpacity
          onPress={pickProfileImage}
          accessibilityRole="imagebutton"
          accessibilityLabel="Change profile picture"
          style={styles.profilePicContainer}
        >
          <Image
            source={{ uri: profilePic || DEFAULT_PROFILE_PIC }}
            style={[styles.profilePic, { borderColor }]}
            accessibilityIgnoresInvertColors
          />
          <View style={[styles.editIconContainer, { borderColor }]}>
            <Ionicons name="camera" size={20} color="#157efb" />
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.label, { color: textColor }]}>Name</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: inputBgColor, borderColor, color: textColor },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={isLight ? '#999' : '#bbb'}
            autoCapitalize="words"
            returnKeyType="done"
            accessible
            accessibilityLabel="Name input"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.label, { color: textColor }]}>Focus Mode</Text>
          <TouchableOpacity
            style={[
              styles.focusButton,
              focusMode && styles.focusButtonActive,
              { borderColor, backgroundColor: focusMode ? borderColor : 'transparent' },
            ]}
            onPress={toggleFocusMode}
            accessibilityRole="switch"
            accessibilityState={{ checked: focusMode }}
            accessibilityLabel="Focus mode toggle"
            accessibilityHint="Enables or disables focus mode"
          >
            <Ionicons
              name={focusMode ? 'eye-off' : 'eye'}
              size={22}
              color={focusMode ? '#fff' : borderColor}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.focusButtonText,
                focusMode && { color: '#fff' },
                { color: borderColor },
              ]}
            >
              {focusMode ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.label, { color: textColor }]}>Status Message</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: inputBgColor,
                borderColor,
                color: textColor,
                height: 80,
                textAlignVertical: 'top',
              },
            ]}
            value={statusMessage}
            onChangeText={setStatusMessage}
            placeholder="What are you working on?"
            placeholderTextColor={isLight ? '#999' : '#bbb'}
            multiline
            numberOfLines={3}
            accessible
            accessibilityLabel="Status message input"
          />
        </View>

        {/* Save & Theme Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: borderColor }]}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save profile changes"
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeButton, { borderColor }]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
          >
            <Ionicons
              name={theme === 'light' ? 'moon' : 'sunny'}
              size={20}
              color={borderColor}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.themeButtonText, { color: borderColor }]}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Info Popup Modal */}
      <Modal
        transparent
        visible={infoVisible}
        animationType="none"
        onRequestClose={closeInfo}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeInfo} accessible={false}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                backgroundColor: isLight ? '#fff' : '#222',
                shadowColor: '#157efb',
                shadowOpacity: 0.22,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 4 },
                elevation: 24,
              },
            ]}
          >
            <Text
              ref={titleRef}
              style={[styles.modalTitle, { color: textColor }]}
              accessibilityRole="header"
              accessibilityLiveRegion="polite"
            >
              About ProFlash
            </Text>
            <Text style={[styles.modalText, { color: textColor }]}>
              ProFlash is your ultimate productivity companion. Developed by Mayank Jha, it empowers you to manage tasks, notes, calendar events, and stay focused with a beautiful, intuitive UI.
            </Text>

            <TouchableOpacity
              onPress={closeInfo}
              style={[styles.modalCloseButton, { borderColor }]}
              accessibilityRole="button"
              accessibilityLabel="Close information popup"
            >
              <Text style={[styles.modalCloseText, { color: borderColor }]}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoButton: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 30, default: 40 }),
    left: 24,
    padding: 10,
    borderRadius: 30,
    zIndex: 15,
  },
  logoutButton: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 30, default: 40 }),
    right: 24,
    backgroundColor: 'rgba(21,126,251,0.15)',
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  profilePicContainer: {
    marginTop: 40,
    marginBottom: 24,
    position: 'relative',
  },
  profilePic: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    borderWidth: 1.5,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  focusButtonActive: {},
  focusButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  buttonsRow: {
    width: '100%',
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#157efb',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  themeButton: {
    flexDirection: 'row',
    borderRadius: 40,
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 32,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 12,
    fontWeight: '700',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 22,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
