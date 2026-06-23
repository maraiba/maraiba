import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, StyleSheet, Platform,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { loadAlarms, saveAlarms } from '../src/storage';
import { scheduleAlarm } from '../src/notifications';
import { Alarm } from '../src/types';

export default function AddAlarmScreen() {
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [label, setLabel] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const src = result.assets[0].uri;
      const ext = src.split('.').pop() ?? 'jpg';
      const dest = `${FileSystem.documentDirectory}alarm_${Date.now()}.${ext}`;
      await FileSystem.copyAsync({ from: src, to: dest });
      setPhotoUri(dest);
    }
  }

  async function save() {
    const existing = await loadAlarms();
    const alarm: Alarm = {
      id: Date.now().toString(),
      hour: time.getHours(),
      minute: time.getMinutes(),
      label: label.trim(),
      photoUri,
      enabled: true,
      notificationId: null,
    };
    alarm.notificationId = await scheduleAlarm(alarm);
    await saveAlarms([...existing, alarm]);
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.section}>Időpont</Text>

      {Platform.OS === 'android' && !showPicker && (
        <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.timeButtonText}>
            {String(time.getHours()).padStart(2, '0')}:{String(time.getMinutes()).padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      )}

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (selected) setTime(selected);
          }}
          style={styles.picker}
        />
      )}

      <Text style={styles.section}>Megnevezés (opcionális)</Text>
      <TextInput
        style={styles.input}
        placeholder="pl. Reggeli ébresztő"
        placeholderTextColor="#444"
        value={label}
        onChangeText={setLabel}
      />

      <Text style={styles.section}>Fotó ébresztéskor</Text>
      <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoEmpty}>
            <Ionicons name="image-outline" size={44} color="#444" />
            <Text style={styles.photoEmptyText}>Koppints a fotó kiválasztásához</Text>
          </View>
        )}
      </TouchableOpacity>

      {photoUri && (
        <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.removeBtn}>
          <Ionicons name="close-circle-outline" size={16} color="#e05c5c" />
          <Text style={styles.removeText}>Fotó eltávolítása</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Ionicons name="alarm-outline" size={22} color="#fff" />
        <Text style={styles.saveBtnText}>Ébresztő mentése</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  content: { padding: 24, paddingBottom: 60 },
  section: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 10,
  },
  picker: { backgroundColor: '#1a1a2e', borderRadius: 14 },
  timeButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
  },
  timeButtonText: { color: '#fff', fontSize: 52, fontWeight: '100', letterSpacing: 6 },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  photoBox: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  photoPreview: { width: '100%', height: 230, resizeMode: 'cover' },
  photoEmpty: {
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  photoEmptyText: { color: '#555', fontSize: 14 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 10,
  },
  removeText: { color: '#e05c5c', fontSize: 14 },
  saveBtn: {
    marginTop: 44,
    backgroundColor: '#4a90d9',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4a90d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
});
