import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function StoryCard({ content, time }) {
  return (
    <View style={styles.card}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.content}>{content}</Text>
      <View style={styles.footer}>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  quoteMark: {
    fontSize: 40,
    color: Colors.primary,
    lineHeight: 40,
    fontFamily: 'serif',
    marginBottom: -10,
  },
  content: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});