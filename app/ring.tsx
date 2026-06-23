import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadAlarms } from '../src/storage';
import { Alarm } from '../src/types';

const { width, height } = Dimensions.get('window');

export default function RingScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const [alarm, setAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    loadAlarms().then(list => {
      const found = list.find(a => a.id === alarmId);
      if (found) setAlarm(found);
    });
  }, [alarmId]);

  const timeStr = alarm
    ? `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`
    : '';

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {alarm?.photoUri ? (
        <Image source={{ uri: alarm.photoUri }} style={styles.photo} />
      ) : (
        <View style={styles.noPhoto}>
          <Ionicons name="alarm" size={100} color="#4a90d9" />
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.time}>{timeStr}</Text>
        {alarm?.label ? <Text style={styles.label}>{alarm.label}</Text> : null}

        <TouchableOpacity style={styles.dismissBtn} onPress={() => router.back()}>
          <Ionicons name="close-circle" size={26} color="#fff" />
          <Text style={styles.dismissText}>Leállítás</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  photo: {
    position: 'absolute',
    width,
    height,
    resizeMode: 'cover',
  },
  noPhoto: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 64,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  time: {
    color: '#ffffff',
    fontSize: 88,
    fontWeight: '100',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  label: {
    color: '#e0e0e0',
    fontSize: 22,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  dismissBtn: {
    marginTop: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 60,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  dismissText: { color: '#ffffff', fontSize: 20, fontWeight: '500' },
});
