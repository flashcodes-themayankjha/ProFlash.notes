
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// --- Types ---
type EventStatus = "In Progress" | "Done" | "Review";

interface AddEventPopupProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: {
    id: string;
    title: string;
    note: string;
    date: string;
    startTime: string;
    endTime: string;
    color: string;
    status: EventStatus;
    alarm: boolean;
  }) => void;
}

const PROFILE_AVATAR =
  "https://randomuser.me/api/portraits/men/12.jpg"; // Replace with real user's avatar if needed
const COLOR_OPTIONS = ["#50e4a6", "#fe95a0", "#e5ad8f"];

// --- Component ---
const AddEventPopup: React.FC<AddEventPopupProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  // State
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [alarm, setAlarm] = useState(false);

  // Handlers
  function handleSave() {
    if (title.trim()) {
      onSave({
        id: Date.now().toString(),
        title,
        note,
        date,
        startTime,
        endTime,
        color,
        status: "In Progress",
        alarm,
      });
      setTitle("");
      setNote("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setColor(COLOR_OPTIONS[0]);
      setAlarm(false);
      onClose();
    }
  }

  // --- UI ---
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalMask}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centered}
        >
          <View style={styles.card}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <Pressable onPress={onClose} hitSlop={16}>
                <Feather name="x" size={26} color="#fff" />
              </Pressable>
              <Text style={styles.headerTitle}>Title</Text>
              <Image
                source={{ uri: PROFILE_AVATAR }}
                style={styles.avatar}
                accessibilityLabel="User avatar"
              />
            </View>
            {/* Title Field */}
            <TextInput
              style={styles.inputTitle}
              placeholder="UI Design for Dribbble"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#b7d3ef"
              autoFocus
              selectionColor="#157efb"
            />
            {/* Date/Time Row */}
            <View style={styles.dateTimeRow}>
              <TextInput
                style={styles.inputDate}
                placeholder="06"
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#bbc7e7"
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.labelDate}>/</Text>
              <TextInput
                style={styles.inputDate}
                placeholder="09"
                value=""
                editable={false}
                placeholderTextColor="#bbc7e7"
              />
              <Text style={styles.labelDate}>/</Text>
              <Text style={[styles.inputDate, { color: "#bfccea" }]}>2025</Text>
              <View style={{ width: 18 }} />
              {/* Time */}
              <TextInput
                style={styles.inputTime}
                placeholder="10"
                value={startTime}
                onChangeText={setStartTime}
                placeholderTextColor="#bbc7e7"
                maxLength={2}
                keyboardType="number-pad"
              />
              <Text style={styles.labelDate}>:</Text>
              <TextInput
                style={styles.inputTime}
                placeholder="43"
                value={endTime}
                onChangeText={setEndTime}
                placeholderTextColor="#bbc7e7"
                maxLength={2}
                keyboardType="number-pad"
              />
              <Text style={styles.labelAMPM}>AM</Text>
            </View>
            {/* Note Field */}
            <TextInput
              style={styles.inputNote}
              placeholder="Write your important note"
              placeholderTextColor="#b7d3ef"
              value={note}
              onChangeText={setNote}
              multiline
            />
            {/* Color and Alarm */}
            <View style={styles.colorAlarmRow}>
              {/* Colors */}
              <Text style={styles.colorLabel}>Color</Text>
              {COLOR_OPTIONS.map((clr) => (
                <TouchableOpacity
                  key={clr}
                  style={[
                    styles.colorDot,
                    { backgroundColor: clr, borderWidth: clr === color ? 2 : 0 },
                  ]}
                  onPress={() => setColor(clr)}
                />
              ))}
              <View style={{ flex: 1 }} />
              {/* Alarm */}
              <Text style={styles.colorLabel}>Alarm</Text>
              <Switch
                value={alarm}
                onValueChange={setAlarm}
                thumbColor={alarm ? "#fe95a0" : "#eee"}
                ios_backgroundColor="#eee"
                trackColor={{ false: "#e7eaf3", true: "#fdc8d3" }}
              />
            </View>
            {/* Save Button */}
            <View style={styles.saveBtnWrap}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                accessibilityLabel="Save event"
                activeOpacity={0.92}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddEventPopup;

// --- Styles ---
const BLUR = "#f9fbfe";
const BLUE = "#157efb";

const styles = StyleSheet.create({
  modalMask: {
    flex: 1,
    backgroundColor: "rgba(35,48,75,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  centered: { width: "100%", alignItems: "center" },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 0,
    shadowColor: "#314b85",
    shadowOpacity: 0.11,
    shadowRadius: 26,
    shadowOffset: { width: 2, height: 6 },
    elevation: 14,
    overflow: "hidden",
  },
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#d1e6fc",
    marginLeft: 12,
  },
  // Title input
  inputTitle: {
    backgroundColor: BLUR,
    marginHorizontal: 24,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    borderWidth: 1.25,
    borderColor: "#e5eaf5",
  },
  // Date/time
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginHorizontal: 24,
  },
  inputDate: {
    fontWeight: "bold",
    fontSize: 17,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#f8fafd",
    borderRadius: 7,
    minWidth: 40,
    color: "#157efb",
    borderWidth: 1.1,
    borderColor: "#e3eaf5",
    textAlign: "center",
    marginHorizontal: 2,
  },
  inputTime: {
    backgroundColor: "#f8fafd",
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 16,
    color: "#365fe9",
    fontWeight: "600",
    minWidth: 35,
    textAlign: "center",
    borderWidth: 1.1,
    borderColor: "#e3eaf5",
    marginHorizontal: 2,
  },
  labelDate: { color: "#bfccea", fontSize: 20, marginHorizontal: 1, fontWeight: "600" },
  labelAMPM: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#157efb",
    fontSize: 17,
    backgroundColor: "#eef3fe",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  // Note input
  inputNote: {
    backgroundColor: "#f2f6fc",
    marginHorizontal: 24,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 28,
    fontSize: 15,
    color: "#414753",
    marginBottom: 19,
    borderWidth: 1,
    borderColor: "#ebeff9",
    height: 58,
    textAlignVertical: "top",
  },
  // Color & alarm row
  colorAlarmRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 18,
  },
  colorLabel: {
    color: "#6d7691",
    fontWeight: "600",
    fontSize: 15,
    marginRight: 9,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginHorizontal: 3,
    borderColor: "#157efb",
  },
  // Save button
  saveBtnWrap: {
    alignItems: "center",
    marginBottom: 6,
  },
  saveBtn: {
    width: 140,
    backgroundColor: "#fe95a0",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 13,
    shadowColor: "#fdbaae",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 18, letterSpacing: 0.6 },
});

