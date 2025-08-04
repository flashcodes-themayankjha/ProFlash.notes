import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';

type InfoModalProps = {
  visible: boolean;
  onClose: () => void;
  titleRef: React.RefObject<Text>;
  isLightTheme: boolean;
};

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose, titleRef, isLightTheme }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
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

      // Focus announcement
      if (titleRef.current) {
        const reactTag = findNodeHandle(titleRef.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }
    } else {
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
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, titleRef]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      accessible
      accessibilityViewIsModal
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <Animated.View
            style={[
              styles.modal,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                backgroundColor: isLightTheme ? '#fff' : '#222',
                shadowColor: isLightTheme ? '#000' : '#555',
                ...Platform.select({
                  ios: {
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                  },
                  android: {
                    elevation: 24,
                  },
                }),
              },
            ]}
          >
            <Text
              ref={titleRef}
              style={[styles.title, { color: isLightTheme ? '#157efb' : '#87baff' }]}
              accessibilityRole="header"
            >
              About ProFlash
            </Text>
            <Text style={[styles.content, { color: isLightTheme ? '#222' : '#eee' }]}>
              ProFlash is your ultimate productivity companion. Developed by Mayank Jha, it empowers you to manage tasks, notes, calendar events, and stay focused with a beautiful, intuitive UI.
            </Text>

            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close information popup"
              style={[styles.closeButton, { borderColor: isLightTheme ? '#157efb' : '#5599ff' }]}
            >
              <Text style={[styles.closeText, { color: isLightTheme ? '#157efb' : '#5599ff' }]}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default InfoModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 32,
  },
  modal: {
    borderRadius: 20,
    padding: 24,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  closeButton: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  closeText: {
    fontWeight: '700',
    fontSize: 18,
  },
});

