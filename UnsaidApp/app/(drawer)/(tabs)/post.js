import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView, // Added for horizontal scrolling categories
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { storyService } from '../../services/storyService';

export default function PostScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [category, setCategory] = useState('General'); // Default category
  const [posting, setPosting] = useState(false);

  // List of categories
  const categories = ['General', 'Healing', 'Love', 'Heartbreak', 'Motivation', 'Life'];

  const toggleVisibility = () => {
    setVisibility(prev => (prev === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'));
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Empty story', 'Please write something before posting');
      return;
    }

    try {
      setPosting(true);

      // Passing category to your service
      await storyService.createStory(
        title.trim() || 'Unsaid',
        content.trim(),
        visibility,
        category // Ensure your service is updated to accept this
      );

      setTitle('');
      setContent('');
      router.replace('/(tabs)/explore');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to post story');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={26} color="#1A237E" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postBtn,
            (!content || posting) && styles.disabled,
          ]}
          disabled={!content || posting}
          onPress={handlePost}
        >
          <Text style={styles.postText}>
            {visibility === 'PRIVATE' ? 'Save to Vault 🔒' : 'Release'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🏷 TITLE INPUT */}
      <TextInput
        style={styles.titleInput}
        placeholder="Give it a title (optional)"
        value={title}
        onChangeText={setTitle}
        maxLength={60}
        placeholderTextColor="#90A4AE"
      />

      {/* ✍️ BODY INPUT */}
      <TextInput
        style={styles.bodyInput}
        placeholder="Unleash what's unsaid..."
        multiline
        value={content}
        onChangeText={setContent}
        maxLength={300}
        placeholderTextColor="#90A4AE"
        textAlignVertical="top"
      />

      {/* 📂 CATEGORY SELECTION (New Section) */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryLabel}>Select Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.chip,
                category === cat && styles.activeChip
              ]}
            >
              <Text style={[
                styles.chipText,
                category === cat && styles.activeChipText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.hint}>
          {visibility === 'PRIVATE'
            ? 'Only you can see this story'
            : 'Anyone can see this story'}
        </Text>

        <View style={styles.footer}>
          <View style={styles.toolBar}>
            <TouchableOpacity style={styles.tool}>
              <Feather name="image" size={22} color="#FF7043" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tool}>
              <Feather name="map-pin" size={22} color="#FF7043" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tool} onPress={toggleVisibility}>
              <Feather
                name={visibility === 'PRIVATE' ? 'lock' : 'unlock'}
                size={22}
                color={visibility === 'PRIVATE' ? '#E53935' : '#43A047'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.charCount}>{content.length}/300</Text>
        </View>

        <View style={styles.safetyBox}>
          <Feather name="shield" size={14} color="#78909C" />
          <Text style={styles.safetyText}>
            {visibility === 'PRIVATE'
              ? 'Saved privately. Only you can read this.'
              : 'Shared publicly. Be kind to yourself.'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  postBtn: { backgroundColor: '#FF7043', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 25 },
  disabled: { backgroundColor: '#FFD8D6', opacity: 0.6 },
  postText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  titleInput: { fontSize: 20, fontWeight: '600', paddingHorizontal: 30, paddingVertical: 14, color: '#1A237E', borderBottomWidth: 1, borderBottomColor: '#ECEFF1' },
  bodyInput: { flex: 1, padding: 30, fontSize: 18, color: '#1A237E', lineHeight: 28 },

  // --- Category Styles ---
  categoryContainer: {
    paddingVertical: 10,
    backgroundColor: '#FAFAFA', // Subtle background to separate from inputs
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#90A4AE',
    marginLeft: 30,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  categoryScroll: {
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    // Elevation for Android
    elevation: 2,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeChip: {
    backgroundColor: '#1A237E',
    borderColor: '#1A237E',
  },
  chipText: {
    color: '#546E7A',
    fontSize: 14,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFF',
    fontWeight: '700',
  },
  // --- Footer Styles ---
  footerContainer: { paddingBottom: 20 },
  hint: { textAlign: 'center', color: '#90A4AE', fontSize: 13, marginBottom: 15, marginTop: 10 },
  footer: { paddingHorizontal: 30, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  toolBar: { flexDirection: 'row' },
  tool: { marginRight: 30 },
  charCount: { color: '#CFD8DC', fontSize: 12 },
  safetyBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 6 },
  safetyText: { color: '#78909C', fontSize: 12, fontWeight: '500' },
});