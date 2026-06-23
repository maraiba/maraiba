import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { loadAlarms } from '../services/storage';
import { scheduleSnoozeNotification } from '../services/scheduler';
import { Alarm } from '../types/alarm';

const { width, height } = Dimensions.get('window');

export default function AlarmRingingScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [now, setNow] = useState(new Date());
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hapticRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadAlarms().then((alarms) => {
      setAlarm(alarms.find((a) => a.id === alarmId) ?? null);
    });
  }, [alarmId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pulse animation on the dismiss button
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Alarm sound + haptics
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../assets/sounds/alarm.mp3'),
          { isLooping: true, volume: 1.0 }
        );

        if (mounted) {
          soundRef.current = sound;
          await sound.playAsync();
        }
      } catch {
        // Sound file not found — app still works without audio
      }
    })();

    // Haptic pattern every 1.5s
    hapticRef.current = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }, 1500);

    return () => {
      mounted = false;
      if (hapticRef.current) clearInterval(hapticRef.current);
      soundRef.current?.stopAsync().then(() => soundRef.current?.unloadAsync());
    };
  }, []);

  const stopAudio = async () => {
    if (hapticRef.current) clearInterval(hapticRef.current);
    try {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
    } catch {}
  };

  const handleDismiss = async () => {
    await stopAudio();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.back();
  };

  const handleSnooze = async () => {
    await stopAudio();
    if (alarm) await scheduleSnoozeNotification(alarm);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Background: blurred photo or dark gradient */}
      {alarm?.photoUri ? (
        <Image
          source={{ uri: alarm.photoUri }}
          style={styles.bgImage}
          blurRadius={20}
        />
      ) : (
        <View style={styles.bgFallback} />
      )}
      <View style={styles.overlay} />

      {/* Main photo */}
      {alarm?.photoUri && (
        <Image
          source={{ uri: alarm.photoUri }}
          style={styles.mainPhoto}
          resizeMode="cover"
        />
      )}

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        <Text style={styles.timeText}>{timeStr}</Text>
        {alarm?.label ? (
          <Text style={styles.labelText}>{alarm.label}</Text>
        ) : null}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.snoozeBtn}
            onPress={handleSnooze}
            activeOpacity={0.75}
          >
            <Text style={styles.snoozeBtnText}>Szundi · 10 perc</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={handleDismiss}
              activeOpacity={0.85}
            >
              <Text style={styles.dismissBtnText}>Kikapcsolás</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const PHOTO_H = Math.min(width * 0.75, height * 0.42);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    position: 'absolute',
    width,
    height,
    opacity: 0.35,
  },
  bgFallback: {
    position: 'absolute',
    width,
    height,
    backgroundColor: '#0A0A0A',
  },
  overlay: {
    position: 'absolute',
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mainPhoto: {
    width: width - 32,
    height: PHOTO_H,
    borderRadius: 22,
    alignSelf: 'center',
    marginTop: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 52,
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  labelText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
    marginBottom: 4,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  snoozeBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
  },
  snoozeBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  dismissBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
});
