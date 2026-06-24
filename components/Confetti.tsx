import { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, View } from 'react-native';

const { width, height: H } = Dimensions.get('window');

const COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D',
  '#6BCB77', '#4D96FF', '#C77DFF',
  '#FF6BFF', '#48DBFB', '#FF9F43',
  '#F368E0', '#00D2D3', '#54A0FF',
];

const COUNT = 100;

interface PData {
  id: number;
  color: string;
  w: number;
  h: number;
  x: number;
  radius: number;
  delay: number;
  dur: number;
  wobble: number;
}

function Particle({ d }: { d: PData }) {
  const ty = useRef(new Animated.Value(-40)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(d.delay),
      Animated.parallel([
        Animated.timing(ty, {
          toValue: H + 60,
          duration: d.dur,
          useNativeDriver: true,
        }),
        Animated.timing(tx, {
          toValue: d.wobble,
          duration: d.dur,
          useNativeDriver: true,
        }),
        Animated.timing(rot, {
          toValue: 12,
          duration: d.dur,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(d.dur * 0.7),
          Animated.timing(op, {
            toValue: 0,
            duration: d.dur * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [d]);

  const rotate = rot.interpolate({
    inputRange: [0, 12],
    outputRange: ['0deg', '4320deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: d.x,
        top: 0,
        width: d.w,
        height: d.h,
        backgroundColor: d.color,
        borderRadius: d.radius,
        opacity: op,
        transform: [{ translateY: ty }, { translateX: tx }, { rotate }],
      }}
    />
  );
}

export function Confetti() {
  const particles = useMemo<PData[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const isCircle = Math.random() > 0.55;
        const size = 7 + Math.random() * 10;
        return {
          id: i,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          w: size,
          h: isCircle ? size : size * 0.42,
          x: Math.random() * width,
          radius: isCircle ? size / 2 : 2,
          delay: Math.random() * 1200,
          dur: 2800 + Math.random() * 1800,
          wobble: (Math.random() - 0.5) * 180,
        };
      }),
    []
  );

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}
      pointerEvents="none"
    >
      {particles.map((d) => (
        <Particle key={d.id} d={d} />
      ))}
    </View>
  );
}
