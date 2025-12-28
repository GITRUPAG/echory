import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { notificationService } from '../services/notificationService';

const getMessage = (type) => {
  switch (type) {
    case 'LIKE':
      return 'liked your story';
    case 'COMMENT':
      return 'commented on your story';
    case 'BOOKMARK':
      return 'bookmarked your story';
    default:
      return 'interacted with your story';
  }
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.log('Failed to load notifications');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handlePress = async (item) => {
    if (!item.read) {
      await notificationService.markAsRead(item.id);
    }

    router.push(`/stories/${item.storyId}`);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handlePress(item)}
      style={[
        styles.card,
        !item.read && styles.unreadCard
      ]}
    >
      <View style={styles.iconWrap}>
        <Feather
          name={
            item.type === 'LIKE'
              ? 'heart'
              : item.type === 'COMMENT'
              ? 'message-circle'
              : 'bookmark'
          }
          size={18}
          color="#1E88E5"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.text}>
          <Text style={styles.bold}>{item.senderId}</Text>{' '}
          {getMessage(item.type)}
        </Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No notifications yet 🔔</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  unreadCard: {
    backgroundColor: '#EEF4FF',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  text: {
    fontSize: 14,
    color: '#263238',
  },
  bold: {
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#90A4AE',
  },
});
