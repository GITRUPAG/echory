import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { storyService } from '../services/storyService';

export default function BookmarksScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await storyService.getMyBookmarks(0, 50);
      setStories(res.data?.content || res.data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={26} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.title}>Bookmarks</Text>
        <TouchableOpacity onPress={fetchBookmarks}>
          <Feather name="refresh-cw" size={20} color="#1A237E" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#1A237E" />
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push('/explore')}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSnippet} numberOfLines={2}>{item.content}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bookmark" size={50} color="#CFD8DC" />
              <Text style={styles.emptyText}>No saved stories yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1B5E20' },
  cardSnippet: { color: '#546E7A', marginTop: 8, lineHeight: 20 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#90A4AE', marginTop: 10, fontSize: 16 }
});