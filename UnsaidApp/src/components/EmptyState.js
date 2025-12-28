import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Ionicons name="chatbubbles-outline" size={64} color="#E5E7EB" />
      <Text style={styles.text}>No unsaid stories yet. Be the first to speak.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  text: { color: '#9CA3AF', marginTop: 10, fontSize: 16 },
});