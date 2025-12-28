import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native'; // Required for the hamburger menu
import { userApi } from '../../services/userApi';
import { storyService } from '../../services/storyService';
import LottieView from 'lottie-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation(); // Hook to trigger side menu
  
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [recentStories, setRecentStories] = useState([]);

  const categories = [
    { label: 'Healing', color: '#E8F5E9', icon: 'feather' },
    { label: 'Love', color: '#FFD8D6', icon: 'heart' },
    { label: 'Heartbreak', color: '#F3E5F5', icon: 'activity' },
    { label: 'Motivation', color: '#FFF3E0', icon: 'zap' },
    { label: 'Life', color: '#D1E3FF', icon: 'compass' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, storiesRes] = await Promise.all([
        userApi.getCurrentUser(),
        storyService.getStories(0, 10) 
      ]);
      
      setUsername(userRes.data.username);
      
      const allStories = storiesRes.data?.content || storiesRes.data || [];
      const topThree = allStories
        .filter(s => s.visibility === 'PUBLIC')
        .slice(0, 3);
        
      setRecentStories(topThree);
    } catch (error) {
      console.error('Failed to load home data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* 🔹 Header Row with Drawer Toggle */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Feather name="menu" size={26} color="#1A237E" />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Text style={styles.brand}>𝓔𝓬𝓱𝓸𝓻𝔂</Text>
            <LottieView
              source={require('../../assets/Ink Pen.json')}
              autoPlay
              loop
              style={styles.lottiePen}
            />
          </View>

          <TouchableOpacity style={styles.profileIconButton} onPress={() => router.push('/profile')}>
            <Feather name="user" size={24} color="#1A237E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>Welcome back{username ? `, ${username}` : ''}</Text>

        {/* 🔍 Search Bar (Navigates to Explore) */}
        <TouchableOpacity 
          style={styles.searchBar} 
          onPress={() => router.push('/explore')}
          activeOpacity={0.9}
        >
          <Feather name="search" size={20} color="#78909C" />
          <Text style={styles.searchPlaceholder}>Search stories...</Text>
        </TouchableOpacity>

        {/* 💡 Quote Section */}
        <View style={styles.quoteCard}>
          <Feather name="edit-3" size={18} color="#5C6BC0" style={{ marginBottom: 8 }} />
          <Text style={styles.quoteText}>"What is uttered from the heart alone, will win the hearts of others to your own."</Text>
          <Text style={styles.quoteAuthor}>— Johann Wolfgang von Goethe</Text>
        </View>

        {/* 🗂 Categories */}
        <Text style={styles.sectionLabel}>Explore Categories</Text>
        <View style={styles.grid}>
          {categories.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={[
                styles.gridItem, 
                { backgroundColor: item.color },
                categories.length % 2 !== 0 && i === categories.length - 1 ? { width: '100%' } : {} 
              ]}
              onPress={() => router.push({
                pathname: '/category/[name]',
                params: { name: item.label }
              })}
            >
              <Feather name={item.icon} size={22} color="#1A237E" />
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 📜 Feed Section */}
        <View style={styles.feedHeader}>
          <Text style={styles.sectionLabel}>Recently Added</Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentStories.length > 0 ? (
          recentStories.map((story) => (
            <TouchableOpacity 
              key={story.id} 
              style={styles.storyCard}
              onPress={() => router.push('/explore')}
            >
              <View style={styles.storyTop}>
                <Text style={styles.storyTitle} numberOfLines={1}>{story.title}</Text>
                <Feather name="arrow-up-right" size={16} color="#B0BEC5" />
              </View>
              <Text style={styles.storySnippet} numberOfLines={2}>{story.content}</Text>
              <View style={styles.storyMeta}>
                <Text style={styles.authorName}>@{story.authorName || 'anonymous'}</Text>
                <Text style={styles.storyTime}>{new Date(story.createdAt).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noStories}>No public stories found.</Text>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F0' },
  scroll: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header Styles
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 5 
  },
  menuButton: { padding: 8, marginLeft: -10 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  brand: { fontSize: 32, fontWeight: 'bold', color: '#1A237E', fontStyle: 'italic' },
  lottiePen: { width: 60, height: 60 },
  profileIconButton: { backgroundColor: '#FFF', padding: 10, borderRadius: 50, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  
  welcome: { fontSize: 14, color: '#78909C', marginBottom: 20, textAlign: 'center' },
  
  // Search Bar
  searchBar: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 2, 
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  searchPlaceholder: { marginLeft: 10, color: '#90A4AE', fontSize: 16 },
  
  // Quote Card
  quoteCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 30, borderLeftWidth: 6, borderLeftColor: '#5C6BC0' },
  quoteText: { fontSize: 15, fontStyle: 'italic', color: '#37474F', lineHeight: 22 },
  quoteAuthor: { fontSize: 12, color: '#90A4AE', marginTop: 10, textAlign: 'right', fontWeight: '600' },
  
  sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 15 },
  
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { 
    width: '47%', 
    height: 95, 
    borderRadius: 24, 
    marginBottom: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  gridLabel: { marginTop: 8, fontWeight: '700', color: '#1A237E', fontSize: 14 },
  
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 15 },
  viewAllText: { color: '#5C6BC0', fontWeight: 'bold' },
  
  // Story Cards
  storyCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 15, elevation: 1 },
  storyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyTitle: { fontSize: 18, fontWeight: '700', color: '#263238', flex: 1 },
  storySnippet: { fontSize: 14, color: '#607D8B', marginVertical: 10, lineHeight: 20 },
  storyMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  authorName: { fontSize: 12, color: '#5C6BC0', fontWeight: '700' },
  storyTime: { fontSize: 12, color: '#B0BEC5' },
  noStories: { textAlign: 'center', color: '#B0BEC5', marginTop: 10 }
});