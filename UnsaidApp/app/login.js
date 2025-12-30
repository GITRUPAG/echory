import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { userApi } from './services/userApi'; 

/* =========================
   PUSH TOKEN HELPER
========================== */
async function getPushToken() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  return (await Notifications.getExpoPushTokenAsync()).data;
}

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Missing fields', 'Please enter credentials');
      return;
    }

    try {
      setLoading(true);

      // ✅ FIXED: use userApi.login()
      const response = await userApi.login(identifier, password);
      const { token } = response.data;

      await AsyncStorage.setItem('token', token);

      const pushToken = await getPushToken();
      if (pushToken) {
        await userApi.savePushToken(pushToken);
      }

      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'Invalid username/email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require('../assets/image.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            placeholderTextColor="#94A3B8"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.mainBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.mainBtnText}>
            {loading ? 'Logging in...' : 'Log In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.signUpLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* =========================
   STYLES (UNCHANGED)
========================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EE' },
  topSection: { flex: 1.2, justifyContent: 'center', alignItems: 'center', paddingTop: 20 },
  logo: { width: '85%', height: '85%', resizeMode: 'contain' },
  formContainer: { flex: 1.3, paddingHorizontal: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A2B56', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#7C5DA3', marginBottom: 30 },
  inputWrapper: { marginBottom: 16, borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0' },
  input: { height: 50, fontSize: 16, color: '#1A2B56', paddingHorizontal: 4 },
  mainBtn: { backgroundColor: '#1A2B56', height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  mainBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#64748B', fontSize: 15 },
  signUpLink: { color: '#26A69A', fontWeight: 'bold' },
});
