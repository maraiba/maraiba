import {
  View, Text, FlatList, TouchableOpacity, Switch, StyleSheet, Alert,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadAlarms, saveAlarms } from '../src/storage';
import { scheduleAlarm, cancelAlarm, requestPermissions } from '../src/notifications';
import { Alarm } from '../src/types';

export default function HomeScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAlarms().then(setAlarms);
    }, [])
  );

  useEffect(() => {
    requestPermissions();
  }, []);

  async function toggleAlarm(alarm: Alarm) {
    let updated: Alarm;
    if (alarm.enabled) {
      if (alarm.notificationId) await cancelAlarm(alarm.notificationId);
      updated = { ...alarm, enabled: false, notificationId: null };
    } else {
      const notifId = await scheduleAlarm(alarm);
      updated = { ...alarm, enabled: true, notificationId: notifId };
    }
    const next = alarms.map(a => (a.id === alarm.id ? updated : a));
    setAlarms(next);
    await saveAlarms(next);
  }

  async function deleteAlarm(alarm: Alarm) {
    Alert.alert('Törlés', 'Biztosan törli ezt az ébresztőt?', [
      { text: 'Mégse', style: 'cancel' },
      {
        text: 'Törlés',
        style: 'destructive',
        onPress: async () => {
          if (alarm.notificationId) await cancelAlarm(alarm.notificationId);
          const next = alarms.filter(a => a.id !== alarm.id);
          setAlarms(next);
          await saveAlarms(next);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="alarm-outline" size={72} color="#333" />
          <Text style={styles.emptyTitle}>Nincs ébresztő</Text>
          <Text style={styles.emptyHint}>Nyomd meg a + gombot az első hozzáadásához</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.enabled && styles.cardOff]}>
              <View style={styles.cardLeft}>
                <Text style={[styles.time, !item.enabled && styles.dimText]}>
                  {String(item.hour).padStart(2, '0')}:{String(item.minute).padStart(2, '0')}
                </Text>
                {item.label ? (
                  <Text style={[styles.label, !item.enabled && styles.dimText]}>{item.label}</Text>
                ) : null}
                {item.photoUri ? (
                  <Text style={styles.photoTag}>📷 Fotó csatolva</Text>
                ) : null}
              </View>
              <View style={styles.cardRight}>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleAlarm(item)}
                  trackColor={{ false: '#2a2a3e', true: '#4a90d9' }}
                  thumbColor={item.enabled ? '#ffffff' : '#666'}
                />
                <TouchableOpacity onPress={() => deleteAlarm(item)} style={styles.trashBtn}>
                  <Ionicons name="trash-outline" size={22} color="#e05c5c" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add')}>
        <Ionicons name="add" size={34} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  list: { padding: 16, paddingBottom: 100 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  emptyTitle: { color: '#666', fontSize: 20, fontWeight: '600' },
  emptyHint: { color: '#444', fontSize: 14, textAlign: 'center', paddingHorizontal: 48 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },
  cardOff: { opacity: 0.45 },
  cardLeft: { flex: 1 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  time: { color: '#ffffff', fontSize: 44, fontWeight: '200', letterSpacing: 2 },
  dimText: { color: '#666' },
  label: { color: '#aaa', fontSize: 14, marginTop: 4 },
  photoTag: { color: '#4a90d9', fontSize: 12, marginTop: 6 },
  trashBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    backgroundColor: '#4a90d9',
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4a90d9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
});
