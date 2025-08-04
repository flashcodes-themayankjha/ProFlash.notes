
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import TagSelector from './TagSelector'; // Make sure this works or inline your TagSelector

const REPETITION_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

type AddTaskModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function AddTaskModal({ visible, onClose, onSaved }: AddTaskModalProps) {
  const user = useUser();
  const supabase = useSupabaseClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [repetition, setRepetition] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>('None');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Picker control state
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

  async function saveTaskToSupabase() {
    if (!user || !user.id) {
      setError('You must be signed in to save tasks.');
      return false;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('tasks').insert([
        {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate?.toISOString() || null,
          reminder: reminderDate?.toISOString() || null,
          tags: tags.length ? tags : null,
          repetition: repetition === 'None' ? null : repetition,
          completed: false,
        },
      ]);
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await saveTaskToSupabase();
    if (success) {
      resetForm();
      onClose();
      if (onSaved) onSaved();
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    resetForm();
    onClose();
  };

  // Date/time pickers unchanged...
  const onDueDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDueDatePicker(false);
      return;
    }
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
      setTimeout(() => setShowDueTimePicker(true), 120);
    }
  };
  const onDueTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'dismissed') {
      setShowDueTimePicker(false);
      return;
    }
    if (selectedTime) {
      setDueDate(
        new Date(
          pendingDueDate.getFullYear(),
          pendingDueDate.getMonth(),
          pendingDueDate.getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes()
        )
      );
    }
    setShowDueTimePicker(false);
  };
  const onReminderDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowReminderDatePicker(false);
      return;
    }
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
      setTimeout(() => setShowReminderTimePicker(true), 120);
    }
  };
  const onReminderTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'dismissed') {
      setShowReminderTimePicker(false);
      return;
    }
    if (selectedTime) {
      setReminderDate(
        new Date(
          pendingReminderDate.getFullYear(),
          pendingReminderDate.getMonth(),
          pendingReminderDate.getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes()
        )
      );
    }
    setShowReminderTimePicker(false);
  };

  // UI ------------------------

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 16 }}>
              <Text style={styles.title}>Add New Task</Text>
              <TextInput
                style={[styles.input, error ? styles.errorInput : null]}
                value={title}
                placeholder="Task Title*"
                onChangeText={setTitle}
                autoFocus
                maxLength={80}
                returnKeyType="done"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={description}
                placeholder="Description (optional)"
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                returnKeyType="default"
                textAlignVertical="top"
              />

              <View style={styles.rowCompact}>
                {/* Due Date */}
                <TouchableOpacity
                  onPress={() => {
                    setPendingDueDate(dueDate ?? new Date());
                    setShowDueDatePicker(true);
                  }}
                  style={[styles.chip, dueDate ? styles.chipActive : null]}
                  accessibilityRole="button"
                  accessibilityLabel="Select due date"
                  onPressOut={() => Haptics.selectionAsync()}
                >
                  <Ionicons name="calendar-outline" size={18} color={dueDate ? '#fff' : '#157efb'} style={{ marginRight: 6 }} />
                  <Text style={[styles.chipText, dueDate ? { color: '#fff' } : { color: '#157efb' }]} numberOfLines={1}>
                    {dueDate ? dueDate.toLocaleDateString() + ', ' + dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Due Date'}
                  </Text>
                  {dueDate && (
                    <TouchableOpacity onPress={() => { setDueDate(null); Haptics.selectionAsync(); }} style={styles.clearIcon} accessibilityLabel="Clear due date" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                {/* Reminder */}
                <TouchableOpacity
                  onPress={() => {
                    setPendingReminderDate(reminderDate ?? new Date());
                    setShowReminderDatePicker(true);
                  }}
                  style={[styles.chip, reminderDate ? styles.chipActive : null]}
                  accessibilityRole="button"
                  accessibilityLabel="Select reminder"
                  onPressOut={() => Haptics.selectionAsync()}
                >
                  <Ionicons name="alarm-outline" size={18} color={reminderDate ? '#fff' : '#157efb'} style={{ marginRight: 6 }} />
                  <Text style={[styles.chipText, reminderDate ? { color: '#fff' } : { color: '#157efb' }]} numberOfLines={1}>
                    {reminderDate ? reminderDate.toLocaleDateString() + ', ' + reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reminder'}
                  </Text>
                  {reminderDate && (
                    <TouchableOpacity onPress={() => { setReminderDate(null); Haptics.selectionAsync(); }} style={styles.clearIcon} accessibilityLabel="Clear reminder" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>

              {showDueDatePicker && (
                <DateTimePicker value={pendingDueDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={new Date()} onChange={onDueDateChange} />
              )}
              {showDueTimePicker && (
                <DateTimePicker value={pendingDueDate} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDueTimeChange} />
              )}
              {showReminderDatePicker && (
                <DateTimePicker value={pendingReminderDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={new Date()} onChange={onReminderDateChange} />
              )}
              {showReminderTimePicker && (
                <DateTimePicker value={pendingReminderDate} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onReminderTimeChange} />
              )}

              <TagSelector tags={tags} setTags={setTags} />

              {/* Repetition */}
              <View style={styles.section}>
                <Text style={styles.label}>Repeat</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.repetitionContainer}>
                  {REPETITION_OPTIONS.map((r) => {
                    const active = repetition === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        onPress={() => {
                          setRepetition(r as any);
                          Haptics.selectionAsync();
                        }}
                        style={[styles.chip, active && styles.chipActive]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active ? styles.chipTextActive : null,
                          ]}
                        >
                          {r}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Save and Cancel buttons */}
              <View style={styles.buttonsRow}>
                <TouchableOpacity onPress={handleCancel} style={[styles.button, styles.cancelButton]}>
                  <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]} disabled={loading}>
                  {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={[styles.buttonText, styles.saveText]}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const CHIP_HEIGHT = 28;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.37)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    maxHeight: '85%',
    elevation: 14,
    shadowColor: '#157efb',
    shadowOpacity: 0.23,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 4 },
    minWidth: 320,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#157efb',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#157efb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f6faff',
    color: '#111',
    marginBottom: 6,
  },
  multilineInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#d23d3d',
  },
  errorText: {
    color: '#d23d3d',
    fontSize: 13,
    marginBottom: 6,
  },
  rowCompact: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d9ef',
    backgroundColor: '#f6faff',
    minHeight: CHIP_HEIGHT,
  },
  chipActive: {
    backgroundColor: '#157efb',
    borderColor: '#157efb',
  },
  chipText: {
    color: '#157efb',
    fontWeight: '600',
    fontSize: 15,
    flexShrink: 1,
  },
  chipTextActive: {
    color: '#fff',
  },
  clearIcon: {
    marginLeft: 10,
  },
  section: {
    marginVertical: 14,
  },
  label: {
    fontWeight: '600',
    color: '#157efb',
    fontSize: 15,
    marginBottom: 6,
  },
  repetitionContainer: {
    flexDirection: 'row',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  button: {
    flex: 1,
    borderRadius: 40,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#157efb',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cancelButton: {
    backgroundColor: '#f0f4ff',
  },
  saveButton: {
    backgroundColor: '#157efb',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  cancelText: {
    color: '#157efb',
  },
  saveText: {
    color: '#fff',
  },
});
