import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadAlarms, deleteAlarm, updateAlarm } from '../services/storage';
import {
  scheduleAlarmNotification,
  cancelAlarmNotification,
  requestPermissions,
} from '../services/scheduler';
import { AlarmItem } from '../components/AlarmItem';
import { Alarm } from '../types/alarm';

export default function AlarmListScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadAlarms().then(setAlarms);
    }, [])
  );

  useEffect(() => {
    requestPermissions();
  }, []);

  const handleToggle = async (alarm: Alarm) => {
    let notificationId: string | null = null;

    if (!alarm.enabled) {
      notificationId = await scheduleAlarmNotification({ ...alarm, enabled: true });
    } else if (alarm.notificationId) {
      await cancelAlarmNotification(alarm.notificationId);
    }

    const updated = { ...alarm, enabled: !alarm.enabled, notificationId };
    const next = await updateAlarm(updated);
    setAlarms(next);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Ébresztő törlése', 'Biztosan törölni szeretnéd?', [
      { text: 'Mégse', style: 'cancel' },
      {
        text: 'Törlés',
        style: 'destructive',
        onPress: async () => {
          const alarm = alarms.find((a) => a.id === id);
          if (alarm?.notificationId) {
            await cancelAlarmNotification(alarm.notificationId);
          }
          const next = await deleteAlarm(id);
          setAlarms(next);
        },
      },
    ]);
  };

  const sorted = [...alarms].sort((a, b) =>
    a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ébresztők</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/add-alarm')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="alarm-outline" size={72} color="#2C2C2E" />
          <Text style={styles.emptyTitle}>Nincs ébresztő</Text>
          <Text style={styles.emptyHint}>
            Nyomd meg a{' '}
            <Text style={styles.emptyHintBold}>+</Text>
            {' '}gombot az első ébresztő hozzáadásához
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmItem
              alarm={item}
              onToggle={() => handleToggle(item)}
              onDelete={() => handleDelete(item.id)}
              onPress={() => router.push(`/add-alarm?id=${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E3A5F',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#48484A',
  },
  emptyHint: {
    fontSize: 15,
    color: '#3A3A3C',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyHintBold: {
    fontWeight: '700',
    color: '#48484A',
  },
});
