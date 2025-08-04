import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const PREDEFINED_TAGS = ['Work', 'Personal', 'Urgent', 'Reading', 'Shopping', 'Fitness'];

type TagSelectorProps = {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function TagSelector({ tags, setTags }: TagSelectorProps) {
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleInput = () => {
    if (showInput) {
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
      setShowInput(false);
      setInput('');
    } else {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      setShowInput(true);
    }
  };

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInput('');
      toggleInput();
      Haptics.selectionAsync();
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    Haptics.selectionAsync();
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) removeTag(tag);
    else {
      setTags([...tags, tag]);
      Haptics.selectionAsync();
    }
  };

  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagsRow}>
        {PREDEFINED_TAGS.map((tag) => {
          const selected = tags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[styles.chip, selected && styles.chipActive]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextActive : null]} numberOfLines={1}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
        {tags
          .filter((t) => !PREDEFINED_TAGS.includes(t))
          .map((tag) => (
            <View key={tag} style={[styles.chip, styles.chipActive, { flexDirection: 'row' }]}>
              <Text style={[styles.chipText, styles.chipTextActive]} numberOfLines={1}>
                {tag}
              </Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                style={styles.removeIcon}
                accessibilityLabel={`Remove tag ${tag}`}
                accessibilityRole="button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        <TouchableOpacity
          onPress={toggleInput}
          style={[styles.chip, styles.addChip]}
          accessibilityLabel={showInput ? 'Cancel add tag' : 'Add new tag'}
          accessibilityRole="button"
        >
          <Animated.View
            style={{
              transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '135deg'] }) }],
            }}
          >
            <Ionicons name="add" size={16} color="#157efb" />
          </Animated.View>
        </TouchableOpacity>
        {showInput && (
          <TextInput
            style={styles.tagInput}
            value={input}
            onChangeText={setInput}
            placeholder="Tag name"
            maxLength={16}
            autoFocus
            onBlur={toggleInput}
            onSubmitEditing={addTag}
            returnKeyType="done"
            accessibilityLabel="Input new tag"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
    color: '#157efb',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d0d6ea',
    backgroundColor: '#f6faff',
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: {
    backgroundColor: '#157efb',
    borderColor: '#157efb',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#157efb',
  },
  chipTextActive: {
    color: '#fff',
  },
  addChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#8db1fb',
    backgroundColor: '#cde1ff',
  },
  tagInput: {
    minWidth: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b3c7fb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 14,
    color: '#111',
    marginLeft: 10,
    height: 34,
  },
  removeIcon: {
    marginLeft: 12,
    backgroundColor: '#157efb',
    borderRadius: 14,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
