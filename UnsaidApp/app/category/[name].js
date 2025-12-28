import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { storyService } from '../services/storyService';
import { userApi } from '../services/userApi';
import HashtagText from '../components/HashtagText';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 8400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();

  // Data States
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Comment States
  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [activeComments, setActiveComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Animation
  const heartScale = useSharedValue(0);
  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  useEffect(() => {
    init();
  }, [name]);

  const init = async () => {
    try {
      const res = await userApi.getCurrentUser();
      setCurrentUserId(res.data.id);
    } catch (e) {
      console.log('User not logged in');
    } finally {
      fetchCategorizedStories();
    }
  };

  const fetchCategorizedStories = async () => {
    try {
      const res = await storyService.getStoriesByCategory(name.toUpperCase());
      const data = res.data.content || res.data || [];
      setStories(data);
      setFilteredStories(data);
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredStories(stories);
      return;
    }
    const filtered = stories.filter(story => 
      story.title.toLowerCase().includes(text.toLowerCase()) || 
      story.content.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStories(filtered);
  };

  const handleLike = async (storyId) => {
    if (!currentUserId) {
      Alert.alert('Login required', 'Please login to like ❤️');
      return;
    }
    try {
      heartScale.value = 1;
      heartScale.value = withTiming(0, { duration: 600 });
      await storyService.reactToStory(storyId, 'LIKE');
      
      const updateList = (list) => list.map(story =>
        story.id === storyId ? { ...story, reactionsCount: (story.reactionsCount || 0) + 1 } : story
      );
      setStories(updateList);
      setFilteredStories(updateList);
    } catch (e) { console.error('Like failed', e.message); }
  };

  const openCommentsSheet = async (storyId) => {
    setSelectedStoryId(storyId);
    setViewAllModalVisible(true);
    setActiveComments([]);
    try {
      const res = await storyService.getComments(storyId, 0, 5);
      setActiveComments(res.data?.content || []);
    } catch (e) { console.error('Failed to load comments', e); }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUserId) return;
    try {
      setSubmitting(true);
      await storyService.addComment(selectedStoryId, commentText);
      const newComment = { 
        userId: currentUserId, 
        text: commentText, 
        createdAt: new Date().toISOString(),
        username: 'You' 
      };
      setActiveComments(prev => [...prev, newComment]);
      
      const updateStories = (list) => list.map(s => 
        s.id === selectedStoryId ? { ...s, comments: [...(s.comments || []), newComment] } : s
      );
      setStories(updateStories);
      setFilteredStories(updateStories);
      setCommentText('');
    } catch (e) { Alert.alert('Error', 'Unable to add comment'); }
    finally { setSubmitting(false); }
  };

  const renderStory = ({ item: story }) => {
    const latestComment = story.comments?.[story.comments.length - 1];
    return (
      // Changed from TouchableOpacity to View to disable card navigation
      <View style={styles.storyCard}>
        <Animated.View style={[styles.heartOverlay, animatedHeartStyle]}>
          <Feather name="heart" size={80} color="#E53935" />
        </Animated.View>

        <View style={styles.cardHeader}>
          <Text style={styles.storyTitle}>{story.title}</Text>
          <Feather name="more-horizontal" size={20} color="#B0BEC5" />
        </View>

        <HashtagText
          text={story.content}
          style={styles.contentBody}
          onPressHashtag={(tag) => router.push(`/hashtag/${tag}`)}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => handleLike(story.id)}
          >
            <Feather name="heart" size={20} color="#455A64" />
            <Text style={styles.actionCount}>{story.reactionsCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => openCommentsSheet(story.id)}
          >
            <Feather name="message-circle" size={20} color="#455A64" />
            <Text style={styles.actionCount}>{story.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>

        {latestComment && (
          <TouchableOpacity 
            onPress={() => openCommentsSheet(story.id)} 
            style={styles.previewSection}
          >
            <Text style={styles.previewText} numberOfLines={1}>
              <Text style={styles.boldUser}>{latestComment.username || 'User'}: </Text>
              {latestComment.text || latestComment.content}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#1A237E" size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color="#1A237E" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSubtitle}>Category</Text>
          <Text style={styles.headerTitle}>{name}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#90A4AE" />
          <TextInput 
            placeholder={`Search in ${name}...`}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#90A4AE"
          />
        </View>
      </View>

      <FlatList
        data={filteredStories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStory}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategorizedStories(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={50} color="#CFD8DC" />
            <Text style={styles.empty}>No stories here yet</Text>
          </View>
        }
      />

      {/* Comment Modal */}
      <Modal visible={viewAllModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setViewAllModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Comments</Text>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {activeComments.length > 0 ? activeComments.map((c, i) => (
                <View key={i} style={styles.fullCommentItem}>
                  <View style={styles.avatarPlaceholder} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentHeaderRow}>
                       <Text style={styles.boldUser}>{c.username || 'User'}</Text>
                       <Text style={styles.timestampMini}>{formatTimeAgo(c.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentBodyText}>{c.text || c.content}</Text>
                  </View>
                </View>
              )) : <Text style={styles.noComments}>No echoes yet.</Text>}
            </ScrollView>
            <View style={styles.sheetInputArea}>
              <TextInput style={styles.textInput} placeholder="Add an echo..." value={commentText} onChangeText={setCommentText} multiline />
              <TouchableOpacity onPress={submitComment} disabled={submitting || !commentText.trim()}>
                <Text style={[styles.postLabel, !commentText.trim() && { opacity: 0.4 }]}>Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { marginRight: 15 },
  headerSubtitle: { fontSize: 12, color: '#78909C', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A237E' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 15, color: '#1A237E' },
  list: { paddingBottom: 20 },
  storyCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 8, padding: 20, borderRadius: 24, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  storyTitle: { fontSize: 18, fontWeight: '700', color: '#1B5E20', flex: 1 },
  contentBody: { fontSize: 15, color: '#37474F', lineHeight: 22, marginBottom: 15 },
  actionRow: { flexDirection: 'row', gap: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
  iconButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 13, fontWeight: '600', color: '#607D8B' },
  heartOverlay: { position: 'absolute', top: '20%', left: '35%', zIndex: 10 },
  previewSection: { marginTop: 10, backgroundColor: '#F8F9FB', padding: 10, borderRadius: 12 },
  previewText: { fontSize: 13, color: '#546E7A' },
  boldUser: { fontWeight: '700', color: '#263238' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: SCREEN_HEIGHT * 0.75, padding: 24 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20, color: '#1A237E' },
  fullCommentItem: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F5F5' },
  commentBodyText: { color: '#455A64', fontSize: 14, marginTop: 2 },
  timestampMini: { fontSize: 10, color: '#B0BEC5' },
  noComments: { textAlign: 'center', color: '#90A4AE', marginTop: 50 },
  sheetInputArea: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  textInput: { flex: 1, backgroundColor: '#F8F9FB', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  postLabel: { color: '#1E88E5', fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { marginTop: 10, color: '#90A4AE' }
});