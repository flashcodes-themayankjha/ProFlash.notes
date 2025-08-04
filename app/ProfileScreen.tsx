
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import InfoModal from '../components/ui/InfoModal';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

const DEFAULT_PROFILE_PIC =
  'https://ui-avatars.com/api/?background=157efb&color=fff&size=256&name=User';

const ProfileScreen = () => {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();

  /** States **/
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [name, setName] = useState('Mayank Jha');
  const [statusMessage, setStatusMessage] = useState('Working on ProFlash UI/UX');
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [infoVisible, setInfoVisible] = useState(false);

  const titleRef = useRef<Text>(null);

  /** Request permissions on mount **/
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

  /** Accessibility: Focus title when info popup opens **/
  useEffect(() => {
    if (infoVisible && titleRef.current) {
      const reactTag = findNodeHandle(titleRef.current);
      if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }, [infoVisible]);

  /** Select image handler **/
  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setProfilePic(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  /** Toggle focus mode **/
  const toggleFocusMode = () => {
    Haptics.selectionAsync();
    setFocusMode((prev) => !prev);
  };

  

  /** Save profile handler (mock, extend as needed) **/
  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Profile Saved', 'Your profile details have been saved successfully.');
    // TODO: Integrate persistent save logic (e.g., update user profile in backend)
  };

  /** Logout handler **/
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            router.replace('/onboard');
          } catch {
            Alert.alert('Logout failed', 'Please try again.');
          }
        } 
      },
    ]);
  };

  /** Computed styles based on theme **/
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
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />

      {/* Info and Logout Buttons */}
      <TouchableOpacity
        style={[styles.infoButton, { backgroundColor: isLight ? 'rgba(21,126,251,0.15)' : 'rgba(85,153,255,0.2)' }]}
        onPress={() => setInfoVisible(true)}
        accessibilityLabel="Information"
        accessibilityHint="Shows details about this app"
      >
        <Ionicons name="information-circle-outline" size={28} color={isLight ? '#157efb' : '#5599ff'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityLabel="Logout"
        accessibilityHint="Logs you out and redirects to onboarding"
      >
        <Ionicons name="log-out-outline" size={28} color={isLight ? '#157efb' : '#5599ff'} />
      </TouchableOpacity>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          accessible
        >
          {/* Profile Picture */}
          <TouchableOpacity
            onPress={pickProfileImage}
            accessibilityLabel="Change profile picture"
            accessibilityRole="imagebutton"
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

          {/* Name Input + Sign-in Status */}
          <View style={styles.infoContainer}>
            <Text style={[styles.label, { color: textColor }]}>Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={isLight ? '#999' : '#bbb'}
              autoCapitalize="words"
              returnKeyType="done"
              accessible
              accessibilityLabel="Name"
            />
            <Text
              style={[styles.signInStatus, { color: user ? '#21bf73' : '#d23d3d' }]}
              accessibilityLiveRegion="polite"
            >
              {user ? `Signed in as ${user.email}` : 'Not signed in'}
            </Text>
          </View>

          {/* Focus Mode Toggle */}
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
              accessibilityLabel="Focus Mode"
              accessibilityHint="Enables or disables focus mode"
            >
              <Ionicons name={focusMode ? 'eye-off' : 'eye'} size={22} color={focusMode ? '#fff' : borderColor} style={{ marginRight: 8 }} />
              <Text style={[styles.focusButtonText, focusMode ? { color: '#fff' } : { color: borderColor }]}>
                {focusMode ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Message Input */}
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
              accessibilityLabel="Status message"
            />
          </View>

          {/* Save and Toggle Theme Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: borderColor }]}
              onPress={handleSave}
              accessibilityLabel="Save profile"
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeButton, { borderColor }]}
              onPress={() => {
                Haptics.selectionAsync();
                setTheme(isLight ? 'dark' : 'light');
              }}
              accessibilityRole="button"
              accessibilityLabel="Toggle theme"
            >
              <Ionicons name={theme === 'light' ? 'moon' : 'sunny'} size={20} color={borderColor} style={{ marginRight: 8 }} />
              <Text style={[styles.themeButtonText, { color: borderColor }]}>
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Info Modal */}
      <InfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
        titleRef={titleRef}
        isLightTheme={isLight}
      />
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 24,
    padding: 10,
    borderRadius: 30,
    zIndex: 15,
  },
  logoutButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 24,
    backgroundColor: 'rgba(85,153,255,0.2)',
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
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 18,
  },
  signInStatus: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  focusButton: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 40,
    paddingHorizontal: 25,
    paddingVertical: 8,
    alignItems: 'center',
  },
  focusButtonActive: {
    // Optional additional styles for active state
  },
  focusButtonText: {
    fontWeight: '700',
    fontSize: 18,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 48,
    gap: 15,
  },
  saveButton: {
    flex: 1,
    borderRadius: 40,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#157efb',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { height: 6, width: 0 },
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  themeButton: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 2,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  themeButtonText: {
    fontWeight: '700',
    fontSize: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 32,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    maxWidth: '90%',
    alignSelf: 'center',
    elevation: 24,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalCloseButton: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  modalCloseText: {
    fontWeight: '700',
    fontSize: 18,
  },
});
