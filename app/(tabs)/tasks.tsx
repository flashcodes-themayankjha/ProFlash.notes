
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import AddTaskModal from '../../components/AddTaskModal';  // Make sure to create this file as below

import emptyTasksLottie from '@/assets/lottie/Empty.json';

const PRIMARY = '#157efb';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<
    Array<{ id: string; title: string; description?: string; dueDate?: Date | null }>
  >([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTaskPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleSaveTask = (newTask: { title: string; description?: string; dueDate?: Date | null }) => {
    const taskWithId = { ...newTask, id: Date.now().toString() };
    setTasks((prev) => [taskWithId, ...prev]);
    setModalVisible(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyWrapper}>
      <LottieView
        source={emptyTasksLottie}
        autoPlay
        loop
        style={styles.lottie}
        resizeMode="cover"
        accessibilityLabel="No tasks animation"
      />
      <Text style={styles.emptyTitle}>No tasks yet</Text>
      <Text style={styles.emptyDesc}>You haven’t added any tasks. Tap “Add Task” to get started!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add Task"
          onPress={handleAddTaskPress}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Task List or Empty State */}
      <View style={styles.content}>
        {tasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
                {item.dueDate ? (
                  <Text style={styles.taskDueDate}>
                    Due: {item.dueDate.toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fbff' },
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
  headerTitle: { fontSize: 27, fontWeight: 'bold', color: '#222' },
  addButton: {
    backgroundColor: PRIMARY,
    borderRadius: 24,
    padding: 12,
    elevation: 2,
    shadowColor: PRIMARY,
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
  },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  emptyWrapper: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  lottie: { width: 210, height: 210, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#646a70', marginBottom: 6 },
  emptyDesc: { fontSize: 15, color: '#95a0ab', textAlign: 'center', maxWidth: 260, lineHeight: 22 },
  taskItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 13,
    marginVertical: 7,
    marginHorizontal: 2,
    shadowColor: '#d0e6fb',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#232b3b' },
  taskDesc: { fontSize: 14, color: '#555', marginTop: 4 },
  taskDueDate: { fontSize: 13, color: '#157efb', marginTop: 6, fontWeight: '600' },
});
