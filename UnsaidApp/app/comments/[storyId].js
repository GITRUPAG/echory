import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { storyService } from '../services/storyService';

export default function CommentsScreen() {
  const { storyId } = useLocalSearchParams();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    const res = await storyService.getComments(storyId);
    setComments(res.data || []);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments</Text>

      <FlatList
        data={comments}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.user}>{item.userId}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  comment: {
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 10,
  },
  user: { fontWeight: 'bold', marginBottom: 5 },
});
