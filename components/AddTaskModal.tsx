
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const PREDEFINED_TAGS = ['Work', 'Personal', 'Urgent', 'Reading', 'Shopping', 'Fitness'];
const REPETITION_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

export default function AddTaskModal({ visible, onClose, onSave }) {
  // --- Form States ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [reminderDate, setReminderDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [repetition, setRepetition] = useState('None');
  const [error, setError] = useState('');

  // --- Picker Dialog States (date/time two-step) ---
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [pendingDueDate, setPendingDueDate] = useState(new Date());
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [pendingReminderDate, setPendingReminderDate] = useState(new Date());

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(null);
    setReminderDate(null);
    setTags([]);
    setRepetition('None');
    setError('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      reminder: reminderDate,
      tags: tags.length ? tags : undefined,
      repetition: repetition !== 'None' ? repetition : undefined,
    });
    resetForm();
    onClose();
  };

  // --- Due Picker: Date → Time, Android-safe ---
  const handleDueDateChange = (_event, selectedDate) => {
    if (_event.type === 'dismissed') return setShowDueDatePicker(false);
    if (selectedDate) {
      setPendingDueDate(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          pendingDueDate.getHours(),
          pendingDueDate.getMinutes()
        )
      );
      setShowDueDatePicker(false);
      setTimeout(() => setShowDueTimePicker(true), 100);
    }
  };
  const handleDueTimeChange = (_event, selectedTime) => {
    if (_event.type === 'dismissed') return setShowDueTimePicker(false);
    if (selectedTime) {
      const base = pendingDueDate || new Date();
      const final = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setDueDate(final);
    }
    setShowDueTimePicker(false);
  };

  // --- Reminder Picker: Date → Time ---
  const handleReminderDateChange = (_event, selectedDate) => {
    if (_event.type === 'dismissed') return setShowReminderDatePicker(false);
    if (selectedDate) {
      setPendingReminderDate(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          pendingReminderDate.getHours(),
          pendingReminderDate.getMinutes()
        )
      );
      setShowReminderDatePicker(false);
      setTimeout(() => setShowReminderTimePicker(true), 100);
    }
  };
  const handleReminderTimeChange = (_event, selectedTime) => {
    if (_event.type === 'dismissed') return setShowReminderTimePicker(false);
    if (selectedTime) {
      const base = pendingReminderDate || new Date();
      const final = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setReminderDate(final);
    }
    setShowReminderTimePicker(false);
  };

  // --- TagSelector (custom + rotate animation) ---
  function TagSelector({ tags, setTags }) {
    const [showInput, setShowInput] = useState(false);
    const [input, setInput] = useState('');
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const toggleInput = () => {
      if (!showInput) {
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 210,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        setShowInput(true);
      } else {
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start();
        setShowInput(false);
        setInput('');
      }
    };

    const handleAdd = () => {
      const trimmed = input.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setInput('');
        setShowInput(false);
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));
    const togglePredef = (tag) =>
      tags.includes(tag)
        ? setTags(tags.filter((t) => t !== tag))
        : setTags([...tags, tag]);

    return (
      <View style={{ marginBottom: 10 }}>
        <Text style={addTagStyles.label}>Tags:</Text>
        <View style={addTagStyles.tagsRow}>
          {/* Predefined Chips */}
          {PREDEFINED_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => togglePredef(tag)}
              style={[addTagStyles.chip, tags.includes(tag) && addTagStyles.chipActive]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: tags.includes(tag) }}
            >
              <Text
                numberOfLines={1}
                style={[addTagStyles.chipText, tags.includes(tag) && addTagStyles.chipTextActive]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
          {/* Custom Chips */}
          {tags.filter(t => !PREDEFINED_TAGS.includes(t)).map((tag) => (
            <View key={tag} style={[addTagStyles.chip, addTagStyles.chipActive, { flexDirection: 'row' }]}>
              <Text style={[addTagStyles.chipText, addTagStyles.chipTextActive]} numberOfLines={1}>{tag}</Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                style={addTagStyles.removeIcon}
                accessibilityRole="button"
                accessibilityLabel={`Remove tag ${tag}`}
                hitSlop={7}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {/* Add Tag Chip - Animate +/cross */}
          <TouchableOpacity
            onPress={toggleInput}
            style={[addTagStyles.chip, addTagStyles.addChip]}
            accessibilityRole="button"
            accessibilityLabel={showInput ? "Cancel custom tag input" : "Add custom tag"}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '135deg'],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="add" size={16} color="#157efb" />
            </Animated.View>
          </TouchableOpacity>
          {/* Inline input appears next to button */}
          {showInput && (
            <TextInput
              style={addTagStyles.tagInput}
              value={input}
              autoFocus
              placeholder="Tag name"
              maxLength={16}
              onChangeText={setInput}
              onBlur={toggleInput}
              onSubmitEditing={handleAdd}
              accessibilityLabel="Enter custom tag"
              returnKeyType="done"
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 16 }}>
              <Text style={styles.title}>Add New Task</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Task Title*"
                value={title}
                onChangeText={text => { setTitle(text); if (error) setError(''); }}
                accessibilityLabel="Task Title"
                autoFocus
                maxLength={80}
                returnKeyType="done"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                accessibilityLabel="Task Description"
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
                returnKeyType="default"
              />

              {/* Due Date & Reminder - Compact Row */}
              <View style={styles.rowCompact}>
                <TouchableOpacity
                  onPress={() => { setPendingDueDate(dueDate || new Date()); setShowDueDatePicker(true); }}
                  style={[styles.chipBtn, dueDate && styles.chipBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel="Select due date"
                >
                  <Ionicons name="calendar-outline" size={18} color={dueDate ? '#157efb' : '#888'} style={{ marginRight: 6 }} />
                  <Text style={[styles.chipBtnText, dueDate && { color: '#157efb' }]}>
                    {dueDate
                      ? dueDate.toLocaleDateString([], { dateStyle: 'short' }) + ', ' + dueDate.toLocaleTimeString([], { timeStyle: 'short' })
                      : 'Due Date'}
                  </Text>
                  {dueDate && (
                    <TouchableOpacity
                      onPress={() => setDueDate(null)}
                      accessibilityRole="button"
                      accessibilityLabel="Clear due date"
                      style={styles.clearIcon}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={18} color="#e44" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setPendingReminderDate(reminderDate || new Date()); setShowReminderDatePicker(true); }}
                  style={[styles.chipBtn, reminderDate && styles.chipBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel="Set reminder date and time"
                >
                  <Ionicons name="alarm-outline" size={18} color={reminderDate ? '#157efb' : '#888'} style={{ marginRight: 6 }} />
                  <Text style={[styles.chipBtnText, reminderDate && { color: '#157efb' }]}>
                    {reminderDate
                      ? reminderDate.toLocaleDateString([], { dateStyle: 'short' }) + ', ' + reminderDate.toLocaleTimeString([], { timeStyle: 'short' })
                      : 'Reminder'}
                  </Text>
                  {reminderDate && (
                    <TouchableOpacity
                      onPress={() => setReminderDate(null)}
                      accessibilityRole="button"
                      accessibilityLabel="Clear reminder"
                      style={styles.clearIcon}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={18} color="#e44" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
              {showDueDatePicker && (
                <DateTimePicker
                  value={pendingDueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDueDateChange}
                  minimumDate={new Date()}
                />
              )}
              {showDueTimePicker && (
                <DateTimePicker
                  value={pendingDueDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDueTimeChange}
                />
              )}
              {showReminderDatePicker && (
                <DateTimePicker
                  value={pendingReminderDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleReminderDateChange}
                  minimumDate={new Date()}
                />
              )}
              {showReminderTimePicker && (
                <DateTimePicker
                  value={pendingReminderDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleReminderTimeChange}
                />
              )}

              {/* Inline Tag Selector */}
              <TagSelector tags={tags} setTags={setTags} />

              <View style={[styles.section, { marginBottom: 0, marginTop: 0 }]}>
                <Text style={styles.label}>Repeat:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.repetitionContainer}>
                  {REPETITION_OPTIONS.map(option => {
                    const selected = option === repetition;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setRepetition(option);
                        }}
                        style={[styles.repetitionOption, selected && styles.repetitionSelected]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`Repeat ${option}`}
                      >
                        <Text style={[styles.repetitionText, selected && styles.repetitionTextSelected]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Save/Cancel Buttons */}
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  onPress={() => { resetForm(); onClose(); }}
                  style={[styles.button, styles.cancelButton]}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel adding task"
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.button, styles.saveButton]}
                  accessibilityRole="button"
                  accessibilityLabel="Save task"
                >
                  <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const CHIP_H = 27;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.33)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    elevation: 14,
    maxHeight: '87%',
    shadowColor: '#157efb',
    shadowOpacity: 0.23,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 13,
    minWidth: 320,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
    color: '#157efb',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#157efb',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
    fontSize: 15,
    marginBottom: 7,
    color: '#232',
  },
  multilineInput: {
    height: 58,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#e44',
  },
  errorText: {
    color: '#e44',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 3,
  },
  rowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 13,
  },
  chipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f6f9fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#d5e5fa',
    minHeight: 33,
    marginRight: 5,
  },
  chipBtnActive: {
    backgroundColor: '#eaf3fe',
    borderColor: '#157efb',
  },
  chipBtnText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    flexShrink: 1,
  },
  clearIcon: {
    marginLeft: 7,
  },
  section: {
    marginBottom: 11,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#157efb',
    marginBottom: 4,
  },
  repetitionContainer: {
    flexDirection: 'row',
    gap: 0,
    alignItems: 'center',
    marginTop: 5,
  },
  repetitionOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.3,
    borderColor: '#157efb',
    marginRight: 7,
    marginTop: 0,
    backgroundColor: '#f7faff',
  },
  repetitionSelected: {
    backgroundColor: '#157efb',
  },
  repetitionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#157efb',
  },
  repetitionTextSelected: {
    color: '#fff',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 6,
  },
  button: {
    flex: 1,
    borderRadius: 40,
    paddingVertical: 11,
    alignItems: 'center',
    marginHorizontal: 0,
    elevation: 3,
    shadowColor: '#157efb',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#eff2f8',
    shadowOpacity: 0,
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#157efb',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

// Tag selector styles
const addTagStyles = StyleSheet.create({
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: '#157efb',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
  },
  chip: {
    backgroundColor: '#f4f8fd',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 13,
    marginRight: 6,
    marginTop: 7,
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
    height: 27,
    borderWidth: 1,
    borderColor: '#e0eafc',
  },
  chipActive: {
    backgroundColor: '#157efb',
    borderColor: '#157efb',
  },
  chipText: {
    color: '#157efb',
    fontWeight: '600',
    fontSize: 13,
    maxWidth: 74,
  },
  chipTextActive: {
    color: '#fff',
  },
  addChip: {
    backgroundColor: '#eaf3fe',
    borderColor: '#b2d0f9',
    marginLeft: 3,
    minWidth: 27,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagInput: {
    minWidth: 68,
    paddingHorizontal: 8,
    fontSize: 13,
    backgroundColor: '#f6faff',
    color: '#222',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#b3ccf5',
    alignSelf: 'center',
    marginLeft: 7,
    height: 27,
    marginTop: 7,
  },
  removeIcon: {
    marginLeft: 6,
    borderRadius: 11,
    backgroundColor: '#157efb',
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
