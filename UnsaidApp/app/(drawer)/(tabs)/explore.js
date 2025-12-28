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
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { storyService } from '../../services/storyService';
import { userApi } from '../../services/userApi';
import HashtagText from '../../components/HashtagText';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function ExploreScreen() {
  const router = useRouter();

  // 1️⃣ DATA & PAGING STATES
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // 2️⃣ SEARCH & MENU STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetStory, setMenuTargetStory] = useState(null);
  const [bookmarking, setBookmarking] = useState(false);

  // 3️⃣ INTERACTION STATES
  const [currentUserId, setCurrentUserId] = useState(null);
  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [activeComments, setActiveComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ANIMATIONS
  const heartScale = useSharedValue(0);
  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const res = await userApi.getCurrentUser();
      setCurrentUserId(res.data.id);
    } catch (e) {
      console.log('User not logged in');
    } finally {
      loadStories(0);
    }
  };

  // FETCH LOGIC (Paged + Search Aware)
  const loadStories = async (pageToLoad = 0, query = searchQuery) => {
    if (loading || loadingMore || (!hasMore && pageToLoad !== 0)) return;
    pageToLoad === 0 ? setLoading(true) : setLoadingMore(true);

    try {
      let res;
      if (query.trim().length > 0) {
        res = await storyService.searchStories(query, pageToLoad, PAGE_SIZE);
      } else {
        res = await storyService.getStories(pageToLoad, PAGE_SIZE);
      }

      const data = res.data.content || [];
      setStories(prev => (pageToLoad === 0 ? data : [...prev, ...data]));
      setHasMore(!res.data.last);
      setPage(pageToLoad);
    } catch (e) {
      console.error('Failed to load stories', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = () => {
    setHasMore(true);
    loadStories(0, searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setHasMore(true);
    loadStories(0, '');
  };

  const onRefresh = () => {
    setHasMore(true);
    loadStories(0);
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
  };

  // --- CARD ACTIONS ---

  const handleLike = async (storyId) => {
    if (!currentUserId) {
      Alert.alert('Login required', 'Please login to like ❤️');
      return;
    }
    setStories(prev => prev.map(story => {
      if (story.id === storyId) {
        const isCurrentlyLiked = story.hasReacted;
        return {
          ...story,
          hasReacted: !isCurrentlyLiked,
          reactionsCount: isCurrentlyLiked ? (story.reactionsCount - 1) : (story.reactionsCount + 1)
        };
      }
      return story;
    }));
    try {
      heartScale.value = 1;
      heartScale.value = withTiming(0, { duration: 600 });
      await storyService.reactToStory(storyId, 'LIKE');
    } catch (e) {
      loadStories(page);
    }
  };

  const handleBookmark = async () => {
    if (!currentUserId) {
      setMenuVisible(false);
      Alert.alert('Login required', 'Please login to save stories 🔖');
      return;
    }
    if (!menuTargetStory) return;

    const isCurrentlyBookmarked = menuTargetStory.isBookmarked;

    try {
      setBookmarking(true);
      await storyService.toggleBookmark(menuTargetStory.id);
      
      // Update local stories list so the UI reflects the change immediately
      setStories(prev => prev.map(s => 
        s.id === menuTargetStory.id ? { ...s, isBookmarked: !isCurrentlyBookmarked } : s
      ));

      setMenuVisible(false);
      Alert.alert('Success', isCurrentlyBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks! ✨');
    } catch (e) {
      Alert.alert('Error', 'Could not update bookmark.');
    } finally {
      setBookmarking(false);
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report', 'This story has been reported for review. Thank you.');
  };

  // --- COMMENT ACTIONS ---
  const openCommentsSheet = async (storyId) => {
    setSelectedStoryId(storyId);
    setViewAllModalVisible(true);
    setActiveComments([]);
    try {
      const res = await storyService.getComments(storyId, 0, 5);
      setActiveComments(res.data?.content || []);
    } catch (e) {
      console.error('Failed to load comments', e);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUserId) return;
    try {
      setSubmitting(true);
      await storyService.addComment(selectedStoryId, commentText);
      const newComment = { 
        userId: currentUserId, text: commentText, 
        createdAt: new Date().toISOString(), username: 'You'
      };
      setActiveComments(prev => [...prev, newComment]);
      setStories(prev => prev.map(s => s.id === selectedStoryId ? { ...s, comments: [...(s.comments || []), newComment] } : s));
      setCommentText('');
    } catch (e) { Alert.alert('Error', 'Unable to add comment'); }
    finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.headerTitleMini}>Unsaid</Text>
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={18} color="#90A4AE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search echoes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            placeholderTextColor="#90A4AE"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}><Feather name="x" size={18} color="#90A4AE" /></TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        scrollEventThrottle={400} 
        onScroll={({ nativeEvent }) => { if (isCloseToBottom(nativeEvent)) loadStories(page + 1); }}
        refreshControl={<RefreshControl refreshing={loading && page === 0} onRefresh={onRefresh} tintColor="#1A237E" />}
      >
        {loading && page === 0 ? (
          <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 50 }} />
        ) : (
          <>
            {stories.map(story => (
              <View key={story.id} style={styles.storyCard}>
                <Animated.View style={[styles.heartOverlay, animatedHeartStyle]}>
                  <FontAwesome name="heart" size={80} color="#E53935" />
                </Animated.View>

                <View style={styles.cardHeader}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <TouchableOpacity onPress={() => { setMenuTargetStory(story); setMenuVisible(true); }}>
                    <Feather name="more-horizontal" size={20} color="#B0BEC5" />
                  </TouchableOpacity>
                </View>

                <HashtagText
                  text={story.content}
                  style={styles.contentBody}
                  onPressHashtag={(tag) => router.push(`/hashtag/${tag}`)}
                />

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleLike(story.id)}>
                    <FontAwesome name={story.hasReacted ? "heart" : "heart-o"} size={22} color={story.hasReacted ? "#E53935" : "#455A64"} />
                    <Text style={[styles.actionCount, story.hasReacted && { color: "#E53935" }]}>{story.reactionsCount || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => openCommentsSheet(story.id)}>
                    <Feather name="message-circle" size={22} color="#455A64" />
                    <Text style={styles.actionCount}>{story.comments?.length || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {loadingMore && <ActivityIndicator size="small" color="#1A237E" style={{ margin: 20 }} />}
            {!hasMore && stories.length > 0 && <Text style={styles.endMessage}>You’ve reached the end 🌱</Text>}
          </>
        )}
      </ScrollView>

      {/* Action Menu (Bookmark/Report) */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => !bookmarking && setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleBookmark} disabled={bookmarking}>
              {bookmarking ? (
                <ActivityIndicator size="small" color="#1A237E" />
              ) : (
                <FontAwesome 
                  name={menuTargetStory?.isBookmarked ? "bookmark" : "bookmark-o"} 
                  size={18} 
                  color="#263238" 
                />
              )}
              <Text style={styles.menuText}>
                {bookmarking ? 'Processing...' : (menuTargetStory?.isBookmarked ? 'Unbookmark' : 'Bookmark')}
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Feather name="flag" size={18} color="#E53935" /><Text style={[styles.menuText, { color: '#E53935' }]}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Comment Sheet */}
      <Modal visible={viewAllModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setViewAllModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Comments</Text>
            <ScrollView style={{ flex: 1 }}>
              {activeComments.map((c, i) => (
                <View key={i} style={styles.fullCommentItem}>
                  <View style={styles.avatarPlaceholder} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boldUser}>{c.username || 'User'} <Text style={styles.timestampMini}>{formatTimeAgo(c.createdAt)}</Text></Text>
                    <Text style={styles.commentBodyText}>{c.text || c.content}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.sheetInputArea}>
              <TextInput style={styles.textInput} placeholder="Add an echo..." value={commentText} onChangeText={setCommentText} />
              <TouchableOpacity onPress={submitComment} disabled={submitting}><Text style={styles.postLabel}>Post</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  searchHeader: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  headerTitleMini: { fontSize: 24, fontWeight: '800', color: '#1A237E', marginBottom: 10 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 12, height: 45, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  storyCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 10, padding: 20, borderRadius: 24, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  storyTitle: { fontSize: 20, fontWeight: '700', color: '#1B5E20', flex: 1 },
  contentBody: { fontSize: 16, color: '#37474F', lineHeight: 24, marginBottom: 15 },
  actionRow: { flexDirection: 'row', gap: 24, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
  iconButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, fontWeight: '600', color: '#607D8B' },
  heartOverlay: { position: 'absolute', top: '30%', left: '40%', zIndex: 10 },
  boldUser: { fontWeight: '700', color: '#263238' },
  timestampMini: { fontSize: 11, color: '#B0BEC5' },
  endMessage: { textAlign: 'center', color: '#B0BEC5', marginVertical: 30 },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { backgroundColor: '#FFF', borderRadius: 15, width: 180, padding: 5, elevation: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  menuText: { fontSize: 15, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#F0F0F0' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: SCREEN_HEIGHT * 0.75, padding: 24 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  fullCommentItem: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5' },
  commentBodyText: { color: '#455A64', fontSize: 14 },
  sheetInputArea: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  textInput: { flex: 1, backgroundColor: '#F8F9FB', borderRadius: 25, paddingHorizontal: 16, height: 45 },
  postLabel: { color: '#1E88E5', fontWeight: '800' }
});