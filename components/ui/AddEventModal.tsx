import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = ['#57cc99', '#3366cc', '#ed6c63'];

export default function AddEventModal({ onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [alarm, setAlarm] = useState(false);

  // For demo: just use strings; you can replace these with pickers
  const [date, setDate] = useState('2025-08-06');
  const [time, setTime] = useState('10:00 AM');

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        id: Date.now().toString(),
        title,
        note,
        color,
        alarm,
        date,
        time,
        status: 'In Progress',
      });
      setTitle('');
      setNote('');
      setColor(COLORS[0]);
      setAlarm(false);
    }
    onClose();
  };

  return (
    <View style={modalStyles.modalContainer}>
      <View style={modalStyles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} accessibilityLabel="Close">
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={modalStyles.profileIcon}>👤</Text>
      </View>
      <Text style={modalStyles.label}>Title</Text>
      <TextInput
        style={modalStyles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Event Title"
      />
      <Text style={modalStyles.label}>Date and Time</Text>
      <View style={modalStyles.row}>
        <TextInput style={[modalStyles.input, { flex: 1, marginRight: 8 }]} value={date} onChangeText={setDate} placeholder="2025-08-06" />
        <TextInput style={[modalStyles.input, { flex: 1 }]} value={time} onChangeText={setTime} placeholder="10:00 AM" />
      </View>
      <Text style={modalStyles.label}>Note</Text>
      <TextInput
        style={[modalStyles.input, { minHeight: 60 }]}
        value={note}
        onChangeText={setNote}
        placeholder="Write your important note..."
        multiline
      />
      <View style={[modalStyles.row, { marginVertical: 16 }]}>
        <Text style={modalStyles.label}>Color</Text>
        <View style={{ flexDirection: 'row' }}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                modalStyles.colorCircle,
                { backgroundColor: c, borderWidth: color === c ? 2 : 0 },
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>
        <Text style={[modalStyles.label, { marginLeft: 10 }]}>Alarm</Text>
        <Switch value={alarm} onValueChange={setAlarm} thumbColor={alarm ? "#ed6c63" : "#888"} />
      </View>
      <TouchableOpacity
        style={modalStyles.saveBtn}
        onPress={handleSave}
        accessibilityLabel="Save event"
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#22304c',
    borderRadius: 22,
    padding: 22,
    margin: 20,
    elevation: 14,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: {
    backgroundColor: '#394967',
    padding: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#213457",
    borderRadius: 7,
    elevation: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: "#fff",
    marginVertical: 7,
  },
  label: {
    color: "#b8d6ff",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  colorCircle: {
    width: 26, height: 26, borderRadius: 13, marginHorizontal: 5, borderColor: '#fff'
  },
  profileIcon: { fontSize: 32, marginRight: 2 },
  saveBtn: {
    alignSelf: "stretch",
    marginTop: 15,
    backgroundColor: "#ed6c63",
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 13,
    elevation: 3,
    shadowColor: "#ed6c63",
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 2 },
  },
});

