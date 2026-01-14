import React, { useEffect, useState, useRef, memo } from 'react';
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
  FlatList
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { storyService } from '../services/storyService';
import HashtagText from '../components/HashtagText';
import { useAuth } from '../context/AuthContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// --- 📦 STORY ITEM COMPONENT ---
const StoryItem = memo(({ story, onLike, onOpenComments, router }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingMap, setLoadingMap] = useState({});
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const galleryRef = useRef(null);
  const heartScale = useSharedValue(0);

  const TEXT_LIMIT = 180;
  const content = story?.content || '';
  const shouldShowReadMore = content.length > TEXT_LIMIT;
  const hasImages = story.imageUrls && story.imageUrls.length > 0;
  const cardContentWidth = SCREEN_WIDTH - 72; 

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const handlePressLike = () => {
    heartScale.value = withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 }));
    onLike(story.id);
  };

  const scrollToImage = (index) => {
    galleryRef.current?.scrollTo({ x: index * cardContentWidth, animated: true });
    setCurrentImgIndex(index);
  };

  return (
    <View style={styles.storyCard}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/story/view/${story.id}`)}>
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
              <Text style={styles.avatarLetter}>
                {String(story.user?.username || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.usernameText}>{story.anonymous ? 'Anonymous Soul' : (story.user?.username || 'User')}</Text>
            <Text style={styles.timestampMini}>{formatTimeAgo(story.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.storyTitle}>{story.title || 'Untitled'}</Text>
        
        <HashtagText
          text={isExpanded || !shouldShowReadMore ? content : `${content.slice(0, TEXT_LIMIT)}...`}
          style={styles.contentBody}
          onPressHashtag={(tag) => router.push(`/hashtag/${tag}`)}
        />
        
        {shouldShowReadMore && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>{isExpanded ? 'Show less' : 'See more'}</Text>
          </TouchableOpacity>
        )}

        {hasImages && (
          <View style={styles.imageGalleryContainer}>
            <ScrollView 
              ref={galleryRef}
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setCurrentImgIndex(Math.round(e.nativeEvent.contentOffset.x / cardContentWidth))}
            >
              {story.imageUrls.map((url, index) => (
                <View key={index} style={styles.imageWrapper}>
                  {loadingMap[index] !== false && <ActivityIndicator style={StyleSheet.absoluteFill} color="#1A237E" />}
                  <Image source={{ uri: url }} style={styles.storyImage} onLoad={() => setLoadingMap(p => ({...p, [index]: false}))} />
                </View>
              ))}
            </ScrollView>
            {currentImgIndex > 0 && (
              <TouchableOpacity style={[styles.galleryArrow, styles.arrowLeft]} onPress={() => scrollToImage(currentImgIndex - 1)}>
                <Feather name="chevron-left" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
            {currentImgIndex < story.imageUrls.length - 1 && (
              <TouchableOpacity style={[styles.galleryArrow, styles.arrowRight]} onPress={() => scrollToImage(currentImgIndex + 1)}>
                <Feather name="chevron-right" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handlePressLike}>
          <FontAwesome name={story.hasReacted ? "heart" : "heart-o"} size={22} color={story.hasReacted ? "#E53935" : "#455A64"} />
          <Text style={[styles.actionCount, story.hasReacted && { color: "#E53935" }]}>
            {String(story.reactionsCount || 0)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => onOpenComments(story.id)}>
          <Feather name="message-circle" size={22} color="#455A64" />
          <Text style={styles.actionCount}>{String(story.comments?.length || 0)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// --- 📱 MAIN SCREEN ---
export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [activeComments, setActiveComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchCategorizedStories();
  }, [name]);

  const fetchCategorizedStories = async () => {
    setLoading(true);
    try {
      const res = await storyService.getStoriesByCategory(name.toUpperCase());
      setStories(res.data.content || res.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false); 
      setRefreshing(false); 
    }
  };

  const handleLike = async (storyId) => {
    if (!currentUser) return Alert.alert('Login required', 'Please login to like ❤️');
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, hasReacted: !s.hasReacted, reactionsCount: s.hasReacted ? s.reactionsCount - 1 : s.reactionsCount + 1 } : s));
    try { await storyService.reactToStory(storyId, 'LIKE'); } catch (e) { fetchCategorizedStories(); }
  };

  const openCommentsSheet = async (storyId) => {
    setSelectedStoryId(storyId);
    setViewAllModalVisible(true);
    try {
      const res = await storyService.getComments(storyId, 0, 20);
      setActiveComments(res.data?.content || []);
    } catch (e) { console.error(e); }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    try {
      const res = await storyService.addComment(selectedStoryId, commentText);
      const newComment = { 
        id: res.data?.id || Date.now(), 
        username: currentUser.username, 
        text: commentText, 
        createdAt: new Date().toISOString() 
      };
      setActiveComments(prev => [...prev, newComment]);
      setStories(prev => prev.map(s => s.id === selectedStoryId ? { ...s, comments: [...(s.comments || []), newComment] } : s));
      setCommentText('');
      Keyboard.dismiss();
    } catch (e) { Alert.alert('Error', 'Unable to add comment'); }
  };

  const filteredStories = stories.filter(s => 
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading && stories.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1A237E" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color="#1A237E" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSubtitle}>Explore Category</Text>
          <Text style={styles.headerTitle}>{name}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#90A4AE" />
          <TextInput 
            placeholder={`Search in ${name}...`}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#90A4AE"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredStories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <StoryItem story={item} onLike={handleLike} onOpenComments={openCommentsSheet} router={router} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategorizedStories(); }} tintColor="#1A237E" />}
          ListEmptyComponent={<Text style={styles.empty}>No echoes found in this category.</Text>}
        />
      )}

      {/* Comment Modal */}
      <Modal visible={viewAllModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setViewAllModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Comments</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {activeComments.map((c, i) => (
                <View key={i} style={styles.fullCommentItem}>
                  {/* COMMENT AVATAR FALLBACK */}
                  <View style={styles.commentAvatar}>
                     <Text style={styles.avatarLetter}>{String(c.username || 'U').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boldUser}>{c.username} <Text style={styles.timestampMini}>{formatTimeAgo(c.createdAt)}</Text></Text>
                    <Text style={styles.commentBodyText}>{c.text || c.content}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.sheetInputArea}>
              <TextInput style={styles.textInput} placeholder="Add an echo..." value={commentText} onChangeText={setCommentText} />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { marginRight: 15 },
  headerSubtitle: { fontSize: 12, color: '#78909C', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A237E' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 15, height: 45, borderRadius: 15, alignItems: 'center', elevation: 2 },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 15 },
  list: { paddingBottom: 20 },
  storyCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 10, padding: 20, borderRadius: 24, elevation: 3 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#C5CAE9' },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: { fontSize: 14, fontWeight: '800', color: '#1A237E' },
  anonymousAvatar: { backgroundColor: '#ECEFF1', borderColor: '#CFD8DC' },
  usernameText: { fontSize: 14, fontWeight: '700', color: '#263238' },
  timestampMini: { fontSize: 10, color: '#B0BEC5' },
  storyTitle: { fontSize: 18, fontWeight: '700', color: '#1B5E20', marginBottom: 8 },
  contentBody: { fontSize: 15, color: '#37474F', lineHeight: 22 },
  readMoreButton: { marginTop: 4, marginBottom: 10 },
  readMoreText: { color: '#1E88E5', fontWeight: '700' },
  imageGalleryContainer: { marginTop: 10, borderRadius: 16, overflow: 'hidden', height: 250, backgroundColor: '#F0F0F0', position: 'relative' },
  imageWrapper: { width: SCREEN_WIDTH - 72, height: 250, justifyContent: 'center', alignItems: 'center' },
  storyImage: { width: '100%', height: '100%', position: 'absolute' },
  galleryArrow: { position: 'absolute', top: '45%', backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20, zIndex: 10 },
  arrowLeft: { left: 10 },
  arrowRight: { right: 10 },
  actionRow: { flexDirection: 'row', gap: 24, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12, marginTop: 10 },
  iconButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, fontWeight: '600', color: '#607D8B' },
  heartOverlay: { position: 'absolute', top: '25%', left: '35%', zIndex: 99 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: SCREEN_HEIGHT * 0.75, padding: 24 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  fullCommentItem: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center' },
  boldUser: { fontWeight: '700', color: '#263238' },
  commentBodyText: { color: '#455A64', fontSize: 14 },
  sheetInputArea: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  textInput: { flex: 1, backgroundColor: '#F8F9FB', borderRadius: 20, paddingHorizontal: 16, height: 40 },
  postLabel: { color: '#1E88E5', fontWeight: '800' },
  empty: { textAlign: 'center', color: '#90A4AE', marginTop: 50 }
});