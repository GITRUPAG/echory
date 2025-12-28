import React from 'react';
import { Text, StyleSheet } from 'react-native';

const HASHTAG_REGEX = /(#\w+)/g;

export default function HashtagText({
  text,
  onPressHashtag,
  style,
}) {
  if (!text) return null;

  const parts = text.split(HASHTAG_REGEX);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.match(HASHTAG_REGEX)) {
          return (
            <Text
              key={index}
              style={styles.hashtag}
              onPress={() =>
                onPressHashtag && onPressHashtag(part.substring(1))
              }
            >
              {part}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  hashtag: {
    color: '#1E88E5', // 🔵 blue
    fontWeight: '600',
  },
});
