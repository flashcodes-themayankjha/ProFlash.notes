

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/Colors";

const C = Colors.calendar;

type EventStatus = "In Progress" | "Done" | "Review";

export interface AddEventPayload {
  id: string;
  title: string;
  note: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  status: EventStatus;
  alarm: boolean;
  repeat: string;
  meetingLink?: string;
  meetingApp?: "Google Meet" | "Zoom" | "MS Teams";
}

interface AddEventPopupProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: AddEventPayload) => void;
}

const COLOR_OPTIONS = [C.done, C.coral, "#e5ad8f"];

const MEETING_APPS = [
  {
    label: "Google Meet",
    icon: require("../../assets/icons/meet.png"),
  },
  {
    label: "Zoom",
    icon: require("../../assets/icons/zoom.png"),
  },
  {
    label: "MS Teams",
    icon: require("../../assets/icons/ms-team.png"),
  },
];

const REPEATS = ["None", "Daily", "Weekly", "Monthly", "Custom..."];
const PROFILE_AVATAR = "https://randomuser.me/api/portraits/men/12.jpg";

const AddEventPopup: React.FC<AddEventPopupProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  // Main state
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dateObj, setDateObj] = useState<Date>(new Date());
  const [pickerMode, setPickerMode] = useState<null | "date" | "start" | "end">(
    null
  );
  const [startTimeObj, setStartTimeObj] = useState<Date>(new Date());
  const [endTimeObj, setEndTimeObj] = useState<Date>(
    new Date(new Date().getTime() + 30 * 60 * 1000)
  );
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [alarm, setAlarm] = useState(false);
  const [repeat, setRepeat] = useState(REPEATS[0]);
  const [showMore, setShowMore] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingApp, setMeetingApp] = useState<
    "Google Meet" | "Zoom" | "MS Teams" | undefined
  >();

  // Handle native pickers
  const openPicker = (type: "date" | "start" | "end") => setPickerMode(type);
  const closePicker = () => setPickerMode(null);

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed" || !selected) return closePicker();
    if (pickerMode === "date") setDateObj(selected);
    if (pickerMode === "start") setStartTimeObj(selected);
    if (pickerMode === "end") setEndTimeObj(selected);
    closePicker();
  };

  // Save event
  const handleSave = () => {
    if (title.trim()) {
      onSave({
        id: Date.now().toString(),
        title,
        note,
        date: dateObj.toISOString().slice(0, 10),
        startTime: startTimeObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: endTimeObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        color,
        status: "In Progress",
        alarm,
        repeat,
        meetingLink: meetingLink || undefined,
        meetingApp: meetingApp || undefined,
      });
      resetFields();
      onClose();
    }
  };

  // Reset all
  function resetFields() {
    setTitle("");
    setNote("");
    setDateObj(new Date());
    setStartTimeObj(new Date());
    setEndTimeObj(new Date(new Date().getTime() + 30 * 60 * 1000));
    setColor(COLOR_OPTIONS[0]);
    setAlarm(false);
    setRepeat(REPEATS[0]);
    setMeetingLink("");
    setMeetingApp(undefined);
    setShowMore(false);
  }

  // Mobile scroll/overflow fix for long options
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
          style={{ flex: 1, width: "100%", justifyContent: "center" }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.headerRow}>
                <Pressable onPress={onClose} hitSlop={16}>
                  <Feather name="x" size={26} color={C.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Add Event</Text>
                <Image
                  source={{ uri: PROFILE_AVATAR }}
                  style={styles.avatar}
                  accessibilityLabel="User avatar"
                />
              </View>
              {/* Title field */}
              <TextInput
                style={styles.inputTitle}
                placeholder="UI Design for Dribbble"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#b7d3ef"
                autoFocus
                selectionColor={C.blue}
                returnKeyType="next"
              />
              {/* Date and time pickers */}
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  onPress={() => openPicker("date")}
                  style={styles.inputDate}
                  activeOpacity={0.87}
                >
                  <Text style={styles.dateText}>
                    {dateObj.getDate().toString().padStart(2, "0")}/
                    {(dateObj.getMonth() + 1).toString().padStart(2, "0")}/
                    {dateObj.getFullYear()}
                  </Text>
                </TouchableOpacity>
                <View style={{ width: 14 }} />
                <TouchableOpacity
                  onPress={() => openPicker("start")}
                  style={styles.inputTime}
                  activeOpacity={0.87}
                >
                  <Text style={styles.timeText}>
                    {startTimeObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontWeight: "900",
                    fontSize: 18,
                    color: "#bfccea",
                    marginHorizontal: 5,
                  }}
                >
                  -
                </Text>
                <TouchableOpacity
                  onPress={() => openPicker("end")}
                  style={styles.inputTime}
                  activeOpacity={0.87}
                >
                  <Text style={styles.timeText}>
                    {endTimeObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Native pickers */}
              {pickerMode === "date" && (
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="default"
                  onChange={onPickerChange}
                  style={styles.nativePicker}
                />
              )}
              {pickerMode === "start" && (
                <DateTimePicker
                  value={startTimeObj}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onPickerChange}
                  style={styles.nativePicker}
                />
              )}
              {pickerMode === "end" && (
                <DateTimePicker
                  value={endTimeObj}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onPickerChange}
                  style={styles.nativePicker}
                />
              )}

              {/* Repeat options */}
              <View style={styles.repeatRow}>
                <Text style={styles.colorLabel}>Repeat</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {REPEATS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.repeatChip,
                        repeat === opt && { backgroundColor: C.coral },
                      ]}
                      onPress={() => setRepeat(opt)}
                    >
                      <Text
                        style={[
                          styles.repeatChipText,
                          repeat === opt && { color: C.white },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Notes */}
              <TextInput
                style={styles.inputNote}
                placeholder="Write your important note"
                placeholderTextColor="#b7d3ef"
                value={note}
                onChangeText={setNote}
                multiline
              />

              {/* Show More / Less */}
              {showMore ? (
                <View>
                  <View style={styles.meetingContainer}>
                    <View style={styles.meetingRow}>
                      <Text style={styles.colorLabel}>Meeting Link:</Text>
                      <View style={styles.meetingIcons}>
                        {MEETING_APPS.map((app) => (
                          <TouchableOpacity
                            key={app.label}
                            style={[
                              styles.appIconBtn,
                              meetingApp === app.label && {
                                borderColor: C.blue,
                                borderWidth: 2,
                              },
                            ]}
                            onPress={() => setMeetingApp(app.label as any)}
                          >
                            <Image source={app.icon} style={styles.appIconImg} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <TextInput
                      style={styles.meetingInput}
                      value={meetingLink}
                      onChangeText={setMeetingLink}
                      placeholder="Paste link here"
                      placeholderTextColor="#b7d3ef"
                      autoCapitalize="none"
                    />
                  </View>
                  {/* Show Less */}
                  <TouchableOpacity
                    style={styles.showLessBtn}
                    onPress={() => setShowMore(false)}
                  >
                    <Feather name="chevron-up" size={19} color={C.blue} />
                    <Text style={styles.showLessBtnText}>Show less</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => setShowMore(true)}
                >
                  <Feather name="chevron-down" size={20} color={C.text} />
                  <Text style={styles.moreBtnText}>More options</Text>
                </TouchableOpacity>
              )}

              {/* Bottom options */}
              <View style={styles.colorAlarmRow}>
                <Text style={styles.colorLabel}>Color</Text>
                {COLOR_OPTIONS.map((clr) => (
                  <TouchableOpacity
                    key={clr}
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: clr,
                        borderWidth: clr === color ? 2.2 : 0,
                      },
                    ]}
                    onPress={() => setColor(clr)}
                  />
                ))}
                <View style={{ flex: 1 }} />
                <Text style={styles.colorLabel}>Alarm</Text>
                <Switch
                  value={alarm}
                  onValueChange={setAlarm}
                  thumbColor={alarm ? C.coral : "#eee"}
                  ios_backgroundColor="#eee"
                  trackColor={{ false: "#e7eaf3", true: "#fdc8d3" }}
                />
              </View>

              {/* Save btn */}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddEventPopup;

// THEME STYLES
const styles = StyleSheet.create({
  modalMask: {
    flex: 1,
    backgroundColor: "rgba(35,48,75,0.21)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
  },
  card: {
    width: "94%",
    maxWidth: 480,
    backgroundColor: C.white,
    borderRadius: 25,
    paddingBottom: 10,
    shadowColor: "#314b85",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 1, height: 5 },
    elevation: 13,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.blue,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    marginBottom: 8,
  },
  headerTitle: {
    color: C.white,
    fontWeight: "700",
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.19,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#d1e6fc",
    marginLeft: 12,
  },
  inputTitle: {
    backgroundColor: C.blur,
    marginHorizontal: 24,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 11,
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    borderWidth: 1.15,
    borderColor: "#e5eaf5",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginHorizontal: 24,
  },
  inputDate: {
    backgroundColor: "#f8fafd",
    borderRadius: 7,
    minWidth: 104,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.01,
    borderColor: "#e3eaf5",
    paddingHorizontal: 8,
    paddingVertical: 13,
    elevation: 0,
  },
  dateText: {
    color: C.blue,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.13,
    textAlign: "center",
  },
  inputTime: {
    backgroundColor: "#f8fafd",
    borderRadius: 7,
    minWidth: 73,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.01,
    borderColor: "#e3eaf5",
    paddingHorizontal: 7,
    paddingVertical: 13,
    elevation: 0,
    marginHorizontal: 1,
  },
  timeText: {
    color: C.blue,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.06,
    textAlign: "center",
  },
  nativePicker: { backgroundColor: C.white, width: "100%" },
  repeatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 24,
    marginBottom: 8,
    marginTop: -2,
  },
  repeatChip: {
    backgroundColor: "#eef3f7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 12,
    marginTop: 5,
  },
  repeatChipText: {
    color: C.text,
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.11,
  },
  inputNote: {
    backgroundColor: "#f2f6fc",
    marginHorizontal: 24,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 18,
    fontSize: 15,
    color: "#414753",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ebeff9",
    minHeight: 48,
    textAlignVertical: "top",
  },
  meetingContainer: {
    marginBottom: 16,
    marginHorizontal: 24,
  },
  meetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  meetingIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  meetingInput: {
    backgroundColor: "#f8fafd",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
    fontSize: 15,
    color: C.text,
    borderWidth: 1,
    borderColor: "#e5eaf5",
  },
  appIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f8ff",
    marginHorizontal: 5,
    borderColor: "transparent",
  },
  appIconImg: { width: 25, height: 25, resizeMode: "contain" },
  moreBtn: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#edf1fb",
    borderRadius: 10,
    marginRight: 18,
    marginBottom: 7,
  },
  moreBtnText: {
    color: C.text,
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 5,
    letterSpacing: 0.05,
  },
  showLessBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 18,
    backgroundColor: "#edf5ff",
  },
  showLessBtnText: {
    color: C.blue,
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 14,
    letterSpacing: 0.05,
  },
  colorAlarmRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 5,
    marginBottom: 7,
  },
  colorLabel: {
    color: "#6d7691",
    fontWeight: "600",
    fontSize: 15,
    marginRight: 10,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    borderColor: C.blue,
  },
  saveBtnWrap: { alignItems: "center", marginTop: 10 },
  saveBtn: {
    width: 140,
    backgroundColor: C.coral,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 13,
    shadowColor: "#fdbaae",
    shadowOpacity: 0.13,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  saveBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.6,
  },
});
