import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Confetti } from '../components/Confetti';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Confetti />
      <View style={styles.content}>
        <Text style={styles.title}>Maraiba</Text>
        <Text style={styles.subtitle}>Üdvözöljük!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '300',
  },
});
