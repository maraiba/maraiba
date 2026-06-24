import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { loadAlarms, addAlarm, updateAlarm } from '../services/storage';
import { scheduleAlarmNotification, cancelAlarmNotification } from '../services/scheduler';
import { Alarm } from '../types/alarm';
import { Confetti } from '../components/Confetti';

export default function AddAlarmScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d;
  });
  const [label, setLabel] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [existing, setExisting] = useState<Alarm | null>(null);
  const [saved, setSaved] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    loadAlarms().then((alarms) => {
      const alarm = alarms.find((a) => a.id === id);
      if (!alarm) return;
      setExisting(alarm);
      const d = new Date();
      d.setHours(alarm.hour, alarm.minute, 0, 0);
      setTime(d);
      setLabel(alarm.label);
      setPhotoUri(alarm.photoUri);
    });
  }, [id]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const source = result.assets[0].uri;
    try {
      const dir = `${FileSystem.documentDirectory}alarm_photos/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const dest = `${dir}${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: source, to: dest });
      setPhotoUri(dest);
    } catch {
      setPhotoUri(source);
    }
  };

  const handleSave = async () => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    if (id && existing) {
      if (existing.notificationId) {
        await cancelAlarmNotification(existing.notificationId);
      }
      const updated: Alarm = { ...existing, hour, minute, label, photoUri };
      const notificationId = await scheduleAlarmNotification(updated);
      await updateAlarm({ ...updated, notificationId });
    } else {
      const alarm: Alarm = {
        id: Date.now().toString(),
        hour,
        minute,
        label,
        photoUri,
        enabled: true,
        notificationId: null,
      };
      const notificationId = await scheduleAlarmNotification(alarm);
      await addAlarm({ ...alarm, notificationId });
    }

    setSaved(true);
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 14,
    }).start();
    timerRef.current = setTimeout(() => router.back(), 5000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (saved) {
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    return (
      <View style={styles.successContainer}>
        <Confetti />
        <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
          <Text style={styles.successCheck}>✓</Text>
          <Text style={styles.successTitle}>Ébresztő beállítva!</Text>
          <Text style={styles.successTime}>{timeStr}</Text>
          {label ? <Text style={styles.successLabel}>{label}</Text> : null}
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>Mégse</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{id ? 'Ébresztő szerkesztése' : 'Új ébresztő'}</Text>
        <TouchableOpacity onPress={handleSave} hitSlop={12}>
          <Text style={styles.save}>Mentés</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => date && setTime(date)}
            style={styles.picker}
            themeVariant="dark"
            locale="hu-HU"
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Megnevezés</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="pl. Reggeli ébresztő"
              placeholderTextColor="#48484A"
              returnKeyType="done"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fotó</Text>
            <TouchableOpacity
              style={styles.photoBtn}
              onPress={pickPhoto}
              activeOpacity={0.8}
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoEmpty}>
                  <Ionicons name="image-outline" size={44} color="#48484A" />
                  <Text style={styles.photoEmptyText}>Fotó kiválasztása</Text>
                </View>
              )}
            </TouchableOpacity>

            {photoUri && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                <Text style={styles.removeBtnText}>Fotó eltávolítása</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E3A5F',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancel: {
    fontSize: 17,
    color: '#8E8E93',
  },
  save: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34C759',
  },
  content: {
    padding: 20,
    gap: 28,
  },
  picker: {
    alignSelf: 'center',
    height: 180,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#102040',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#FFFFFF',
  },
  photoBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 14,
  },
  photoEmpty: {
    height: 160,
    backgroundColor: '#102040',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderStyle: 'dashed',
  },
  photoEmptyText: {
    fontSize: 15,
    color: '#48484A',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  removeBtnText: {
    fontSize: 15,
    color: '#FF3B30',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  successCheck: {
    fontSize: 72,
    color: '#34C759',
    lineHeight: 88,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successTime: {
    fontSize: 52,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  successLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
