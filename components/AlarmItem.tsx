import { View, Text, Switch, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Alarm } from '../types/alarm';

interface Props {
  alarm: Alarm;
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
}

export function AlarmItem({ alarm, onToggle, onDelete, onPress }: Props) {
  const timeStr = `${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`;

  return (
    <TouchableOpacity
      style={[styles.container, !alarm.enabled && styles.dimmed]}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.7}
    >
      {alarm.photoUri && (
        <Image source={{ uri: alarm.photoUri }} style={styles.photo} />
      )}
      <View style={styles.content}>
        <Text style={[styles.time, !alarm.enabled && styles.dimText]}>{timeStr}</Text>
        {alarm.label ? (
          <Text style={[styles.label, !alarm.enabled && styles.dimLabel]}>
            {alarm.label}
          </Text>
        ) : null}
      </View>
      <Switch
        value={alarm.enabled}
        onValueChange={onToggle}
        trackColor={{ true: '#34C759', false: '#2C2C2E' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#2C2C2E"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  dimmed: {
    opacity: 0.55,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  time: {
    fontSize: 34,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  dimText: {
    color: '#8E8E93',
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
  },
  dimLabel: {
    color: '#48484A',
  },
});
