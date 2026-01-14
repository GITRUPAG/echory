import React, { useEffect, useState, memo, useRef } from 'react';
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
  Image,
  Keyboard,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { storyService } from '../../services/storyService';
import userApi from '../../services/userApi';
import HashtagText from '../../components/HashtagText';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// --- 🕒 HELPER: TIME FORMAT ---
const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// --- 📦 COMPONENT: INDIVIDUAL STORY CARD ---
const StoryItem = memo(({ story, onLike, onOpenComments, onOpenMenu, router }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingMap, setLoadingMap] = useState({});
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const galleryRef = useRef(null);
  const heartScale = useSharedValue(0);

  const TEXT_LIMIT = 180;
  const shouldShowReadMore = story.content && story.content.length > TEXT_LIMIT;
  const hasImages = story.imageUrls && story.imageUrls.length > 0;
  const cardContentWidth = SCREEN_WIDTH - 72; // Adjusted for padding/margins

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const handlePressLike = () => {
    heartScale.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
    onLike(story.id);
  };

  const handleViewStory = () => {
    router.push(`/story/view/${story.id}`);
  };

  const scrollToImage = (index) => {
    galleryRef.current?.scrollTo({
      x: index * cardContentWidth,
      animated: true,
    });
    setCurrentImgIndex(index);
  };

  return (
    <View style={styles.storyCard}>
      <TouchableOpacity activeOpacity={0.9} onPress={handleViewStory}>
        <Animated.View style={[styles.heartOverlay, animatedHeartStyle]} pointerEvents="none">
          <FontAwesome name="heart" size={80} color="#E53935" />
        </Animated.View>

        <View style={styles.userInfoRow}>
          <View style={[styles.miniAvatar, story.anonymous && styles.anonymousAvatar]}>
            {story.anonymous ? (
              <Feather name="user-x" size={14} color="#90A4AE" />
            ) : story.user?.profileImageUrl ? (
              <Image source={{ uri: story.user.profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLetter}>{(story.user?.username || 'U').charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View>
            <Text style={styles.usernameText}>
              {story.anonymous ? 'Anonymous Soul' : (story.user?.username || 'Unknown')}
            </Text>
            <Text style={styles.timestampMini}>{formatTimeAgo(story.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.cardHeader}>
          <Text style={styles.storyTitle}>{story.title}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation(); 
              onOpenMenu(story);
            }}
          >
            <Feather name="more-horizontal" size={20} color="#B0BEC5" />
          </TouchableOpacity>
        </View>

        <View>
          <HashtagText
            text={isExpanded || !shouldShowReadMore 
              ? story.content 
              : `${story.content.slice(0, TEXT_LIMIT)}...`}
            style={styles.contentBody}
            onPressHashtag={(tag) => router.push(`/hashtag/${tag}`)}
          />
          
          {shouldShowReadMore && (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation(); 
                setIsExpanded(!isExpanded);
              }}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMoreText}>
                {isExpanded ? 'Show less' : 'See more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🖼️ IMAGE GALLERY SECTION WITH ARROWS */}
        {hasImages && (
          <View style={styles.imageGalleryContainer}>
            <ScrollView 
              ref={galleryRef}
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / cardContentWidth);
                setCurrentImgIndex(newIndex);
                e.stopPropagation();
              }} 
            >
              {story.imageUrls.map((url, index) => (
                <View key={index} style={styles.imageWrapper}>
                  {loadingMap[index] !== false && (
                    <ActivityIndicator 
                      style={StyleSheet.absoluteFill} 
                      color="#1A237E" 
                    />
                  )}
                  <Image 
                    source={{ uri: url }} 
                    style={styles.storyImage} 
                    resizeMode="cover" 
                    onLoad={() => setLoadingMap(prev => ({ ...prev, [index]: false }))}
                    onError={() => setLoadingMap(prev => ({ ...prev, [index]: false }))}
                  />
                </View>
              ))}
            </ScrollView>

            {/* Left Arrow Navigation */}
            {currentImgIndex > 0 && (
              <TouchableOpacity 
                style={[styles.galleryArrow, styles.arrowLeft]}
                onPress={() => scrollToImage(currentImgIndex - 1)}
              >
                <Feather name="chevron-left" size={20} color="#FFF" />
              </TouchableOpacity>
            )}

            {/* Right Arrow Navigation */}
            {currentImgIndex < story.imageUrls.length - 1 && (
              <TouchableOpacity 
                style={[styles.galleryArrow, styles.arrowRight]}
                onPress={() => scrollToImage(currentImgIndex + 1)}
              >
                <Feather name="chevron-right" size={20} color="#FFF" />
              </TouchableOpacity>
            )}

            {story.imageUrls.length > 1 && (
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>{currentImgIndex + 1}/{story.imageUrls.length}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handlePressLike}>
          <FontAwesome 
            name={story.hasReacted ? "heart" : "heart-o"} 
            size={22} 
            color={story.hasReacted ? "#E53935" : "#455A64"} 
          />
          <Text style={[styles.actionCount, story.hasReacted && { color: "#E53935" }]}>
            {story.reactionsCount || 0}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => onOpenComments(story.id)}>
          <Feather name="message-circle" size={22} color="#455A64" />
          <Text style={styles.actionCount}>{story.comments?.length || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// --- 📱 MAIN SCREEN ---
export default function ExploreScreen() {
  const router = useRouter();

  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetStory, setMenuTargetStory] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [activeComments, setActiveComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const res = await userApi.getCurrentUser();
      setCurrentUser(res.data);
    } catch (e) {
      console.log('User not logged in');
    } finally {
      loadStories(0);
    }
  };

  const loadStories = async (pageToLoad = 0, query = searchQuery) => {
    if (loading || loadingMore || (!hasMore && pageToLoad !== 0)) return;
    
    if (pageToLoad === 0) {
        setRefreshing(true);
    } else {
        setLoadingMore(true);
    }

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
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    loadStories(0);
  };

  const handleLike = async (storyId) => {
    if (!currentUser) {
      Alert.alert('Login required', 'Please login to like ❤️');
      return;
    }
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const isCurrentlyLiked = s.hasReacted;
        return {
          ...s,
          hasReacted: !isCurrentlyLiked,
          reactionsCount: isCurrentlyLiked ? (s.reactionsCount - 1) : (s.reactionsCount + 1)
        };
      }
      return s;
    }));

    try {
      await storyService.reactToStory(storyId, 'LIKE');
    } catch (e) {
      loadStories(page);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser || !menuTargetStory) return;
    const isCurrentlyBookmarked = menuTargetStory.isBookmarked;
    try {
      await storyService.toggleBookmark(menuTargetStory.id);
      setStories(prev => prev.map(s => s.id === menuTargetStory.id ? { ...s, isBookmarked: !isCurrentlyBookmarked } : s));
      setMenuVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Could not update bookmark.');
    }
  };

  const openCommentsSheet = async (storyId) => {
    setSelectedStoryId(storyId);
    setViewAllModalVisible(true);
    setActiveComments([]);
    try {
      const res = await storyService.getComments(storyId, 0, 20);
      setActiveComments(res.data?.content || []);
    } catch (e) {
      console.error('Failed to load comments', e);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    try {
      setSubmitting(true);
      const res = await storyService.addComment(selectedStoryId, commentText);
      const newComment = { 
        id: res.data?.id || Date.now().toString(),
        userId: currentUser.username, 
        text: commentText, 
        createdAt: new Date().toISOString(), 
        username: currentUser.username,
        profileImageUrl: currentUser.profileImageUrl
      };
      setActiveComments(prev => [...prev, newComment]);
      setStories(prev => prev.map(s => s.id === selectedStoryId ? { ...s, comments: [...(s.comments || []), newComment] } : s));
      setCommentText('');
      Keyboard.dismiss();
    } catch (e) { 
      Alert.alert('Error', 'Unable to add comment'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <Text style={styles.headerTitleMini}>Unsaid</Text>
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={18} color="#90A4AE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search echoes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => loadStories(0)}
            returnKeyType="search"
            placeholderTextColor="#90A4AE"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); loadStories(0, ''); }}>
              <Feather name="x" size={18} color="#90A4AE" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        onScroll={({ nativeEvent }) => {
          const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 100;
          if (isCloseToBottom && hasMore && !loadingMore) loadStories(page + 1);
        }}
        scrollEventThrottle={16}
        refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="#1A237E" 
                colors={["#1A237E"]}
            />
        }
      >
        {loading && page === 0 ? (
          <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 50 }} />
        ) : (
          <>
            {stories.map(story => (
              <StoryItem 
                key={story.id} 
                story={story} 
                onLike={handleLike} 
                onOpenComments={openCommentsSheet}
                onOpenMenu={(s) => { setMenuTargetStory(s); setMenuVisible(true); }}
                router={router}
              />
            ))}
            {loadingMore && <ActivityIndicator size="small" color="#1A237E" style={{ margin: 20 }} />}
            {!hasMore && stories.length > 0 && <Text style={styles.endText}>No more stories to echo.</Text>}
          </>
        )}
      </ScrollView>

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleBookmark}>
                <FontAwesome name={menuTargetStory?.isBookmarked ? "bookmark" : "bookmark-o"} size={18} color="#263238" />
                <Text style={styles.menuText}>{menuTargetStory?.isBookmarked ? 'Unbookmark' : 'Bookmark'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); Alert.alert('Reported'); }}>
                <Feather name="flag" size={18} color="#E53935" /><Text style={[styles.menuText, { color: '#E53935' }]}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Comments Modal */}
      <Modal visible={viewAllModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setViewAllModalVisible(false)} />
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
            style={styles.sheetContainer}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Comments</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {activeComments.map((c, i) => (
                <View key={c.id || i} style={styles.fullCommentItem}>
                  <View style={styles.avatarPlaceholder}>
                    {c.profileImageUrl ? (
                      <Image source={{ uri: c.profileImageUrl }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarLetter}>{(c.username || 'U').charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.boldUser}>{c.username || 'User'} <Text style={styles.timestampMini}>{formatTimeAgo(c.createdAt)}</Text></Text>
                    </View>
                    <Text style={styles.commentBodyText}>{c.text || c.content}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.sheetInputArea}>
              <View style={styles.tinyAvatar}>
                {currentUser?.profileImageUrl ? (
                   <Image source={{ uri: currentUser.profileImageUrl }} style={styles.avatarImage} />
                ) : (
                   <Text style={[styles.avatarLetter, { fontSize: 10 }]}>{(currentUser?.username || 'U').charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <TextInput 
                style={styles.textInput} 
                placeholder="Add an echo..." 
                value={commentText} 
                onChangeText={setCommentText} 
              />
              <TouchableOpacity onPress={submitComment}><Text style={styles.postLabel}>Post</Text></TouchableOpacity>
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
  storyCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 10, padding: 20, borderRadius: 24, elevation: 3, position: 'relative', overflow: 'hidden' },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C5CAE9', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: { fontSize: 14, fontWeight: '800', color: '#1A237E' },
  anonymousAvatar: { backgroundColor: '#ECEFF1', borderColor: '#CFD8DC' },
  usernameText: { fontSize: 14, fontWeight: '700', color: '#263238' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  storyTitle: { fontSize: 20, fontWeight: '700', color: '#1B5E20', flex: 1 },
  contentBody: { fontSize: 16, color: '#37474F', lineHeight: 24, marginBottom: 10 },
  readMoreButton: { marginTop: 4, marginBottom: 15 },
  readMoreText: { color: '#1E88E5', fontWeight: '700', fontSize: 14 },
  
  imageGalleryContainer: { 
    marginTop: 5, 
    borderRadius: 16, 
    overflow: 'hidden', 
    backgroundColor: '#F0F0F0', 
    marginBottom: 15,
    position: 'relative' // Critical for arrow positioning
  },
  imageWrapper: { 
    width: SCREEN_WIDTH - 72, 
    height: 300, 
    position: 'relative', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#E0E0E0'
  }, 
  storyImage: { 
    width: '100%', 
    height: '100%',
    position: 'absolute' 
  },
  
  // 🏹 ARROW STYLES
  galleryArrow: {
    position: 'absolute',
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  arrowLeft: { left: 10 },
  arrowRight: { right: 10 },

  imageBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  imageBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 24, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
  iconButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, fontWeight: '600', color: '#607D8B' },
  heartOverlay: { position: 'absolute', top: '25%', left: '35%', zIndex: 99, alignSelf: 'center' },
  boldUser: { fontWeight: '700', color: '#263238' },
  timestampMini: { fontSize: 11, color: '#B0BEC5' },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { backgroundColor: '#FFF', borderRadius: 15, width: 180, padding: 5, elevation: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  menuText: { fontSize: 15, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: SCREEN_HEIGHT * 0.8, padding: 24 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  fullCommentItem: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  tinyAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  commentBodyText: { color: '#455A64', fontSize: 14 },
  sheetInputArea: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  textInput: { flex: 1, backgroundColor: '#F8F9FB', borderRadius: 25, paddingHorizontal: 16, height: 45 },
  postLabel: { color: '#1E88E5', fontWeight: '800' },
  endText: { textAlign: 'center', color: '#B0BEC5', marginVertical: 20, fontSize: 12 }
});