
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import AddEventPopup, {
  AddEventPayload,
} from "../../components/ui/AddEventPopup"; // Adjust the path as needed
import { Colors } from "../../constants/Colors";

const C = Colors.calendar;

// Constants
const CORNER = 36;
const STATUS_COLORS = {
  Done: C.done,
  "In Progress": C.inProgress,
};

// Example avatar list
const AVATAR_IMAGES = [
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/men/3.jpg",
];

const DEFAULT_EVENTS: AddEventPayload[] = [
  {
    id: "1",
    title: "UI Design for Uber",
    note: "",
    date: "2025-08-06",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    color: C.done,
    status: "Done",
    alarm: false,
    repeat: "None",
  },
  {
    id: "2",
    title: "Design review",
    note: "",
    date: "2025-08-06",
    startTime: "12:00 PM",
    endTime: "02:00 PM",
    color: C.inProgress,
    status: "In Progress",
    alarm: false,
    repeat: "None",
  },
  {
    id: "3",
    title: "Brainstorming",
    note: "",
    date: "2025-08-06",
    startTime: "02:05 PM",
    endTime: "04:00 PM",
    color: C.inProgress,
    status: "In Progress",
    alarm: false,
    repeat: "None",
  },
];

const NEXT_TASKS = [
  {
    id: "a",
    title: "UI Design for Behance",
    description: "Start a scenario with the triggering event and describe the ...",
    date: "27 Aug 2025",
    assignees: AVATAR_IMAGES,
  },
  {
    id: "b",
    title: "Design In Progress",
    description: "Start a scenario with the triggering event and describe the ...",
    date: "27 Aug 2025",
    assignees: AVATAR_IMAGES,
  },
];

const STATUS_CYCLE = ["Planning", "In Progress", "Done"];

const CalendarScreen: React.FC = () => {
  const [events, setEvents] = useState<AddEventPayload[]>(DEFAULT_EVENTS);
  const [showAdd, setShowAdd] = useState(false);

  // Add a new event to timeline
  const handleAddEvent = (event: AddEventPayload) => {
    setEvents((prev) => [event, ...prev]);
  };

  const handleUpdateStatus = (id: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === id) {
          const currentStatusIndex = STATUS_CYCLE.indexOf(event.status as string);
          const nextStatus = STATUS_CYCLE[(currentStatusIndex + 1) % STATUS_CYCLE.length];
          return { ...event, status: nextStatus as any };
        }
        return event;
      })
    );
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setEvents((prev) => prev.filter((event) => event.id !== id)),
      },
    ]);
  };

  const renderAvatars = (arr: string[]) => (
    <View style={{ flexDirection: "row", marginTop: 8 }}>
      {arr.map((uri, idx) =>
        uri && uri.startsWith("http") ? (
          <Image
            key={idx}
            source={{ uri }}
            style={styles.avatarImage}
            resizeMode="cover"
            accessibilityLabel="User avatar"
          />
        ) : (
          <Text style={styles.avatarEmoji} key={idx}>
            🙂
          </Text>
        )
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Blue Section (Top with timeline) */}
        <View style={styles.blueSection}>
          <View style={styles.header}>
            <Text style={styles.todayText}>Today</Text>
            <View style={styles.profile}>
              <Image
                source={{ uri: AVATAR_IMAGES[0] }}
                style={styles.profileImage}
                resizeMode="cover"
                accessibilityLabel="User profile avatar"
              />
            </View>
          </View>
          <View style={{ marginTop: 18 }}>
            {events.length === 0 ? (
              <View style={styles.emptyContainer}>
                <LottieView
                  source={require("../../assets/lottie/Empty.json")}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
                <Text style={styles.emptyText}>No events yet. Add one!</Text>
              </View>
            ) : (
              events.map((event, idx) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => handleUpdateStatus(event.id)}
                  onLongPress={() => handleDeleteEvent(event.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.timelineRow}>
                    <View style={styles.timelineCol}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor:
                              event.status === "Done" ? STATUS_COLORS.Done : C.white,
                            borderColor: STATUS_COLORS[event.status] || "#ddd",
                          },
                        ]}
                      />
                      {idx < events.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                    <View style={styles.timelineEventCard}>
                      <Text style={styles.timelineEventTitle}>{event.title}</Text>
                      <Text style={styles.timelineEventTime}>
                        {event.startTime} - {event.endTime}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: STATUS_COLORS[event.status] || "#eee",
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{event.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* White Section (Next Task cards) */}
        <View style={styles.whiteSection}>
          <View style={styles.nextTaskHeader}>
            <Text style={styles.nextTaskTitle}>Next Task</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllBtn}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={NEXT_TASKS}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <Text style={styles.taskCardTitle}>{item.title}</Text>
                <Text style={styles.taskCardDesc}>{item.description}</Text>
                <Text style={styles.taskCardDate}>{item.date}</Text>
                {renderAvatars(item.assignees)}
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        </View>
      </ScrollView>

      {/* Floating FAB at bottom right */}
      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
        accessibilityLabel="Add new event"
      >
        <Feather name="plus" size={30} color={C.white} />
      </TouchableOpacity>

      {/* Add Event Popup */}
      <AddEventPopup
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAddEvent}
      />
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background, position: "relative" },

  blueSection: {
    backgroundColor: C.blue,
    borderBottomRightRadius: CORNER,
    borderBottomLeftRadius: CORNER,
    minHeight: 315,
    paddingBottom: 44,
    paddingTop: 16,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 2,
  },
  todayText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 28,
    letterSpacing: 0.5,
  },
  profile: {
    width: 38,
    height: 38,
    backgroundColor: C.white,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  // Timeline
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    marginLeft: 6,
  },
  timelineCol: { alignItems: "center", marginRight: 16 },
  timelineDot: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 4,
    marginTop: 0,
    marginBottom: 0,
  },
  timelineLine: {
    width: 3,
    height: 46,
    backgroundColor: C.separator,
    marginTop: 2,
    borderRadius: 8,
  },
  timelineEventCard: {
    backgroundColor: C.blue,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 19,
    flex: 1,
    minWidth: 120,
    marginRight: 16,
    shadowColor: "#444",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  timelineEventTitle: {
    color: C.white,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 2,
  },
  timelineEventTime: {
    color: "#bac8e7",
    fontSize: 13,
    fontWeight: "600",
  },
  statusPill: {
    borderRadius: 16,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 18,
    minWidth: 85,
    backgroundColor: "#eee",
  },
  statusText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },

  // White Section (Next Task)
  whiteSection: {
    backgroundColor: C.white,
    borderTopLeftRadius: CORNER,
    borderTopRightRadius: CORNER,
    marginTop: -18,
    paddingTop: 32,
    paddingHorizontal: 19,
  },
  nextTaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nextTaskTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  viewAllBtn: {
    backgroundColor: "#ffe1c5",
    color: C.highlight,
    fontWeight: "700",
    borderRadius: 9,
    fontSize: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  taskCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 17,
    width: 200,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 12,
  },
  taskCardTitle: {
    color: C.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 7,
  },
  taskCardDesc: { color: C.subtext, fontSize: 13, marginBottom: 6 },
  taskCardDate: { color: C.highlight, fontWeight: "600", fontSize: 13, marginTop: 5 },

  avatarImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: -8,
    borderWidth: 2,
    borderColor: C.white,
    backgroundColor: "#eee",
  },
  avatarEmoji: {
    fontSize: 22,
    marginRight: -8,
    backgroundColor: C.white,
    borderRadius: 15,
    width: 26,
    height: 26,
    textAlign: "center",
  },

  // FAB Add Button
  fabBtn: {
    position: "absolute",
    bottom: 30,
    right: 34,
    backgroundColor: C.coral,
    borderRadius: 22,
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#d48b7b",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 7 },
    elevation: 30,
    zIndex: 99,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    color: C.subtext,
  },
});
