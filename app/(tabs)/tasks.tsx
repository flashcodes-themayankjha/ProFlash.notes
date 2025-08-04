import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Vibration,
  TextInput,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import AddTaskModal from "../../components/AddTaskModal";
import EditTaskModal from "../../components/EditTaskModal";
import { useUser } from "../../lib/supabase"; // or your auth hook

import { useTasks, Task } from "../../lib/supabaseTasks";

import emptyTasksLottie from "@/assets/lottie/Empty.json";

const PRIMARY = "#157efb";

export default function TasksScreen() {
  const user = useUser();
  const { tasks, loading, error, refresh, addTask, updateTaskById, deleteTaskById } = useTasks(user?.id || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mainFilter, setMainFilter] = useState('today');
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"due_date" | "title">("due_date");

  // Handle adding task: save to Supabase then update state
  const handleSaveTask = async (task: Omit<Task, "id" | "user_id">) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await addTask(task);
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert("Failed to add task", error.message);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleTagFilter = (tag: string) => {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getUniqueTags = () => {
    const allTags = tasks.flatMap((task) => task.tags || []);
    return [...new Set(allTags)];
  };
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks;

    if (mainFilter === "today") {
      const today = new Date().toISOString().slice(0, 10);
      filteredTasks = filteredTasks.filter(
        (task) => task.due_date && task.due_date.slice(0, 10) === today
      );
    }

    if (searchQuery) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTagFilters.length > 0) {
      filteredTasks = filteredTasks.filter((task) =>
        activeTagFilters.every((filter) => task.tags?.includes(filter))
      );
    }

    return filteredTasks.sort((a, b) => {
      if (sortOrder === "due_date") {
        return new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  };

  // Toggle task completed (example extension)
  const toggleComplete = async (task: Task) => {
    try {
      if (task.repetition && !task.completed) {
        const newDueDate = new Date(task.due_date || Date.now());
        switch (task.repetition) {
          case "Daily":
            newDueDate.setDate(newDueDate.getDate() + 1);
            break;
          case "Weekly":
            newDueDate.setDate(newDueDate.getDate() + 7);
            break;
          case "Monthly":
            newDueDate.setMonth(newDueDate.getMonth() + 1);
            break;
        }

        const newTask: Omit<Task, "id" | "user_id"> = {
          title: task.title,
          description: task.description,
          due_date: newDueDate.toISOString(),
          reminder: task.reminder,
          tags: task.tags,
          repetition: task.repetition,
          completed: false,
        };

        await addTask(newTask);
      }

      await updateTaskById(task.id, { completed: !task.completed });
    } catch (e: any) {
      Alert.alert("Failed to update task", e.message);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTaskById(id);
          } catch (e: any) {
            Alert.alert("Failed to delete task", e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => toggleComplete(item)}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Vibration.vibrate(20);
        setSelectedTask(item);
        setEditModalVisible(true);
      }}
      style={styles.taskItem}
    >
      <Ionicons
        name={item.completed ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={item.completed ? "#21bf73" : "#bac3d6"}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.taskTitle,
            item.completed && { textDecorationLine: "line-through", color: "#79969c" },
          ]}
        >
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.taskDesc}>{item.description}</Text>
        ) : null}
        {item.due_date ? (
          <Text style={styles.taskDueDate}>
            Due: {new Date(item.due_date).toLocaleDateString()}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={{ paddingHorizontal: 8 }}>
        <Ionicons name="trash-outline" size={22} color="#d23d3d" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          accessibilityLabel="Add Task"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setModalVisible(true);
          }}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for tasks..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tags Filter */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Filter by Tags</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getUniqueTags().map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterChip, activeTagFilters.includes(tag) && styles.activeFilter]}
              onPress={() => toggleTagFilter(tag)}
            >
              <Text style={[styles.filterText, activeTagFilters.includes(tag) && styles.activeFilterText]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Filter */}
      <View style={styles.mainFilterHeader}>
        <TouchableOpacity style={styles.mainFilterButton} onPress={() => setMainFilter('today')}>
          <Text style={[styles.mainFilterHeaderText, mainFilter === 'today' && styles.activeMainFilterText]}>
            Today's Tasks
          </Text>
          {mainFilter === 'today' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainFilterButton} onPress={() => setMainFilter('all')}>
          <Text style={[styles.mainFilterHeaderText, mainFilter === 'all' && styles.activeMainFilterText]}>
            All Tasks
          </Text>
          {mainFilter === 'all' && <View style={styles.underline} />}
        </TouchableOpacity>
      </View>

      {/* Tasks or Empty */}
      <View style={styles.content}>
        {!loading && !tasks.length ? (
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
            <Text style={styles.emptyDesc}>You haven’t added any tasks. Tap “Add Task” to get started.</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredAndSortedTasks()}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshing={loading}
            onRefresh={refresh}
          />
        )}
      </View>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
      />

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSave={async (updatedTask) => {
            await updateTaskById(updatedTask.id, updatedTask);
            setEditModalVisible(false);
            setSelectedTask(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fbff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 44,
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eceff5",
    elevation: 6,
    shadowColor: "#d0dbf8",
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#222",
  },
  addButton: {
    backgroundColor: PRIMARY,
    borderRadius: 24,
    padding: 12,
    elevation: 2,
    shadowColor: PRIMARY,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 210,
    height: 210,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#646a70",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 15,
    color: "#95a0ab",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 22,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 13,
    marginVertical: 7,
    padding: 14,
    elevation: 3,
    shadowColor: "#acc1e0",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#232b3b",
  },
  taskDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  taskDueDate: {
    fontSize: 12,
    color: PRIMARY,
    marginTop: 4,
    fontWeight: "600",
  },
  mainFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: '#f8fbff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6f1',
  },
  mainFilterButton: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  mainFilterHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
  },
  activeMainFilterText: {
    color: PRIMARY,
  },
  underline: {
    height: 3,
    width: '100%',
    backgroundColor: PRIMARY,
    marginTop: 8,
  },
  activeFilterText: {
    color: '#fff',
  },
  searchSection: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#f8fbff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e6f1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#222',
  },
  filtersContainer: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contentHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  filtersScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e0e6f1",
  },
  activeFilter: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterText: {
    color: "#000",
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
});
