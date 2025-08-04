import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../lib/supabaseTasks';
import * as Haptics from 'expo-haptics';
import TagSelector from './TagSelector';

const REPETITION_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

type EditTaskModalProps = {
  visible: boolean;
  onClose: () => void;
  task: Task;
  onSave: (updatedTask: Task) => void;
};

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  onClose,
  task,
  onSave,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    task.reminder ? new Date(task.reminder) : undefined
  );
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [repetition, setRepetition] = useState<
    "None" | "Daily" | "Weekly" | "Monthly"
  >(task.repetition as any || "None");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setReminderDate(task.reminder ? new Date(task.reminder) : undefined);
    setTags(task.tags || []);
    setRepetition((task.repetition as any) || "None");
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title cannot be empty.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const updatedTask: Task = {
      ...task,
      title,
      description: description || null,
      due_date: dueDate ? dueDate.toISOString() : null,
      reminder: reminderDate ? reminderDate.toISOString() : null,
      tags: tags.length ? tags : null,
      repetition: repetition === "None" ? null : repetition,
    };
    onSave(updatedTask);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const onReminderDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || reminderDate;
    setShowReminderDatePicker(Platform.OS === "ios");
    setReminderDate(currentDate);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Task Title"
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Task Description"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Due Date (Optional)</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerButtonText}>
                {dueDate ? dueDate.toLocaleDateString() : 'Select Date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#157efb" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <Text style={styles.label}>Reminder (Optional)</Text>
            <TouchableOpacity
              onPress={() => setShowReminderDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerButtonText}>
                {reminderDate ? reminderDate.toLocaleDateString() : 'Select Date'}
              </Text>
              <Ionicons name="alarm-outline" size={20} color="#157efb" />
            </TouchableOpacity>

            {showReminderDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={reminderDate || new Date()}
                mode="date"
                display="default"
                onChange={onReminderDateChange}
              />
            )}

            <TagSelector tags={tags} setTags={setTags} />

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
                        style={[styles.chip, repetition === r ? styles.chipActive : null]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{r}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#157efb',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 14,
  },
  repetitionContainer: {
    flexDirection: 'row',
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
});

export default EditTaskModal;
