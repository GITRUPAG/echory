import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import userApi from '../../services/userApi';
import { storyService } from '../../services/storyService';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendingStories, setTrendingStories] = useState([]);
  const [mostLikedStories, setMostLikedStories] = useState([]);

  // Added a 6th category "Hope" to balance the 3-column grid
  const categories = [
    { label: 'Healing', color: '#E8F5E9', icon: 'feather' },
    { label: 'Love', color: '#FFD8D6', icon: 'heart' },
    { label: 'Heartbreak', color: '#F3E5F5', icon: 'activity' },
    { label: 'Motivation', color: '#FFF3E0', icon: 'zap' },
    { label: 'Life', color: '#D1E3FF', icon: 'compass' },
    { label: 'Hope', color: '#E1F5FE', icon: 'sun' }, 
  ];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!refreshing) setLoading(true);
    try {
      try {
        const userRes = await userApi.getCurrentUser();
        setUsername(userRes?.data?.username || 'Storyteller');
      } catch (e) { setUsername('Storyteller'); }

      const [trendingRes, likedRes] = await Promise.allSettled([
        storyService.getTrendingStories(),
        storyService.getMostLikedStories()
      ]);

      if (trendingRes.status === 'fulfilled') {
        const data = trendingRes.value?.data;
        setTrendingStories(data?.content || data || []);
      }
      if (likedRes.status === 'fulfilled') {
        const data = likedRes.value?.data;
        setMostLikedStories(data?.content || data || []);
      }
    } catch (error) {
      console.error('Home Data Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} tintColor="#1A237E" />}
      >
        
        {/* Header Row - Improved Spacing */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.iconHitSlop}>
            <Feather name="menu" size={24} color="#1A237E" />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Text style={styles.brand}>𝓔𝓬𝓱𝓸𝓻𝔂</Text>
            <View style={styles.lottiePen}>
               <LottieView source={require('../../assets/Ink Pen.json')} autoPlay loop style={{flex: 1}} />
            </View>
          </View>

          <TouchableOpacity style={styles.profileIconButton} onPress={() => router.push('/profile')}>
            <Feather name="user" size={20} color="#1A237E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>Welcome back{username ? `, ${username}` : ''}</Text>

        {/* Search Bar - Higher Contrast */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/explore')} activeOpacity={0.9}>
          <Feather name="search" size={18} color="#78909C" />
          <Text style={styles.searchPlaceholder}>Search for echoes...</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>🔥 Trending Now</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll} snapToInterval={200} decelerationRate="fast">
          {trendingStories.length > 0 ? (
            trendingStories.map((story) => (
              <TouchableOpacity key={story.id} style={styles.trendingCard} onPress={() => router.push(`/story/view/${story.id}`)}>
                <Text style={styles.trendingTitle} numberOfLines={2}>{story.title}</Text>
                <View style={styles.trendingMeta}>
                  <Feather name="trending-up" size={12} color="#81C784" />
                  <Text style={styles.trendingText}>{story.reactionsCount || 0} echoes</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : <Text style={styles.emptyText}>No trending echoes yet.</Text>}
        </ScrollView>

        {/* 3-Column Categories Grid */}
        <Text style={[styles.sectionLabel, { marginTop: 25 }]}>Explore Categories</Text>
        <View style={styles.grid}>
          {categories.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.gridItem, { backgroundColor: item.color }]}
              onPress={() => router.push({ pathname: '/category/[name]', params: { name: item.label } })}
            >
              <Feather name={item.icon} size={20} color="#1A237E" />
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.feedHeader}>
          <Text style={styles.sectionLabel}>🏆 Community Favorites</Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {mostLikedStories.slice(0, 2).map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyCard} onPress={() => router.push(`/story/view/${story.id}`)}>
            <View style={styles.storyTop}>
              <Text style={styles.storyTitleCard} numberOfLines={1}>{story.title}</Text>
              <View style={styles.likeBadge}>
                <FontAwesome name="heart" size={10} color="#E53935" />
                <Text style={styles.likeCountText}>{story.reactionsCount || 0}</Text>
              </View>
            </View>
            <Text style={styles.storySnippet} numberOfLines={2}>{story.content}</Text>
            <View style={styles.storyMeta}>
              <Text style={styles.authorName}>@{story.authorName || 'anonymous'}</Text>
              <Text style={styles.storyTime}>{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'recent'}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F0' },
  scroll: { paddingHorizontal: 20, paddingTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header Adjustments
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', marginLeft: 15 },
  brand: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', fontStyle: 'italic' },
  lottiePen: { width: 50, height: 50 },
  profileIconButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 50, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  iconHitSlop: { padding: 5 },
  welcome: { fontSize: 13, color: '#90A4AE', marginBottom: 20, textAlign: 'center', fontWeight: '500' },
  
  // Search Bar Enhancement
  searchBar: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 15, 
    alignItems: 'center', 
    elevation: 3, 
    shadowColor: '#1A237E', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    marginBottom: 25 
  },
  searchPlaceholder: { marginLeft: 10, color: '#90A4AE', fontSize: 15 },

  // Trending Cards Depth
  trendingScroll: { marginHorizontal: -20, paddingLeft: 20 },
  trendingCard: { 
    backgroundColor: '#1A237E', 
    width: 170, 
    height: 100, 
    borderRadius: 20, 
    padding: 15, 
    marginRight: 12, 
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  trendingTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  trendingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trendingText: { color: '#81C784', fontSize: 11, fontWeight: '700' },

  sectionLabel: { fontSize: 17, fontWeight: '800', color: '#1A237E', marginBottom: 12 },
  
  // Grid Adjustment (3 columns)
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '31%', height: 85, borderRadius: 20, marginBottom: 12, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  gridLabel: { marginTop: 6, fontWeight: '700', color: '#1A237E', fontSize: 12 },
  
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 12 },
  viewAllText: { color: '#5C6BC0', fontWeight: '700', fontSize: 13 },
  
  storyCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  storyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyTitleCard: { fontSize: 16, fontWeight: '700', color: '#263238', flex: 1 },
  likeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  likeCountText: { color: '#E53935', fontWeight: '800', fontSize: 11 },
  storySnippet: { fontSize: 13, color: '#607D8B', marginVertical: 8, lineHeight: 18 },
  storyMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  authorName: { fontSize: 11, color: '#5C6BC0', fontWeight: '700' },
  storyTime: { fontSize: 11, color: '#B0BEC5' },
  emptyText: { color: '#B0BEC5', padding: 20 }
});