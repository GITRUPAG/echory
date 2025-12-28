import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  ImageBackground,
  Alert,
  TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { storyService } from '../services/storyService';

const backgroundImage = require('../assets/storyBg.jpg');

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (id) fetchStoryDetails();
  }, [id]);

  const fetchStoryDetails = async () => {
    try {
      setLoading(true);
      const res = await storyService.getStoryById(id); 
      setStory(res.data);
      setEditTitle(res.data.title);
      setEditContent(res.data.content);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    const nextStatus = story.visibility === 'PRIVATE' ? 'Public' : 'Private';
    
    Alert.alert(
      "Change Visibility",
      `Move this story to ${nextStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setIsToggling(true);
              const res = await storyService.toggleVisibility(id);
              // Update local state with the new story object from response
              setStory(res.data);
              Alert.alert("Success", `Story is now ${res.data.visibility.toLowerCase()}`);
            } catch (e) {
              Alert.alert('Error', 'Unable to change visibility');
            } finally {
              setIsToggling(false);
            }
          }
        }
      ]
    );
  };

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      await storyService.editStory(id, { title: editTitle, content: editContent });
      setStory({ ...story, title: editTitle, content: editContent });
      setIsEditing(false);
      Alert.alert("Success", "Story updated!");
    } catch (error) {
      Alert.alert("Error", "Could not update story");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Story", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await storyService.deleteStory(id);
            router.back();
          } catch (e) {
            Alert.alert("Error", "Failed to delete");
          }
        } 
      }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1A237E" /></View>;

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
            <Feather name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            {!isEditing && (
              <>
                {/* 🔒/🔓 Toggle Visibility Button */}
                <TouchableOpacity 
                  onPress={handleToggleVisibility} 
                  style={[styles.iconCircle, {marginRight: 10}]}
                  disabled={isToggling}
                >
                  {isToggling ? (
                    <ActivityIndicator size="small" color="#1A237E" />
                  ) : (
                    <Feather 
                      name={story.visibility === 'PRIVATE' ? 'lock' : 'globe'} 
                      size={20} 
                      color={story.visibility === 'PRIVATE' ? '#E53935' : '#43A047'} 
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.iconCircle, {marginRight: 10}]}>
                  <Feather name="edit-2" size={20} color="#1A237E" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDelete} style={styles.iconCircle}>
                  <Feather name="trash-2" size={20} color="#E53935" />
                </TouchableOpacity>
              </>
            )}

            {isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.iconCircle}>
                <Feather name="x" size={24} color="#78909C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.paperEffect}>
            {isEditing ? (
              <>
                <TextInput 
                  style={styles.titleInput} 
                  value={editTitle} 
                  onChangeText={setEditTitle} 
                  placeholder="Title"
                />
                <TextInput 
                  style={styles.contentInput} 
                  value={editContent} 
                  onChangeText={setEditContent} 
                  multiline 
                  placeholder="Content"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{story.title}</Text>
                  <View style={[
                    styles.badge, 
                    { backgroundColor: story.visibility === 'PRIVATE' ? '#FFEBEE' : '#E8F5E9' }
                  ]}>
                    <Text style={[
                      styles.badgeText, 
                      { color: story.visibility === 'PRIVATE' ? '#E53935' : '#43A047' }
                    ]}>
                      {story.visibility}
                    </Text>
                  </View>
                </View>
                <Text style={styles.date}>{new Date(story.createdAt).toLocaleDateString()}</Text>
                <View style={styles.divider} />
                <Text style={styles.storyContent}>{story.content}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center', minWidth: 40 },
  scrollContent: { padding: 20 },
  paperEffect: { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 15, padding: 20, minHeight: 400 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A237E', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginLeft: 10 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#78909C', marginVertical: 5 },
  divider: { height: 1, backgroundColor: '#DDD', marginVertical: 15 },
  storyContent: { fontSize: 17, lineHeight: 26, color: '#333', fontStyle: 'italic' },
  titleInput: { fontSize: 22, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#CCC', marginBottom: 15, padding: 5 },
  contentInput: { fontSize: 16, minHeight: 200, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#1A237E', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' }
});