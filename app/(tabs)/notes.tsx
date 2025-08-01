import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

// Replace with your actual Lottie asset for empty notes state
import emptyNotesLottie from '@/assets/lottie/Empty.json';

const PRIMARY = '#157efb';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]); // Empty list shows empty state

  const handleAddNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to add note screen or show modal
    alert('Add note functionality coming soon!');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyWrapper}>
      <LottieView
        source={emptyNotesLottie}
        autoPlay
        loop
        style={styles.lottie}
        resizeMode="cover"
        accessibilityLabel="No notes animation"
      />
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptyDesc}>
        You haven't added any notes. Tap "Add Note" to get started!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes</Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add Note"
          onPress={handleAddNote}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Notes list or Empty State */}
      <View style={styles.content}>
        {notes.length === 0 ? (
          renderEmptyState()
        ) : (
          // Placeholder for notes list
          <Text style={styles.infoText}>Your notes will show here.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eceff5',
    elevation: 6,
    shadowColor: '#d0e6fb',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#222',
  },
  addButton: {
    backgroundColor: PRIMARY,
    borderRadius: 24,
    padding: 12,
    elevation: 2,
    shadowColor: PRIMARY,
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  lottie: {
    width: 210,
    height: 210,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#646a70',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 15,
    color: '#95a0ab',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },
  infoText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 17,
    color: '#789',
  },
});

