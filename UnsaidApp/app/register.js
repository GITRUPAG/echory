import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { userApi } from './services/userApi'; // ✅ FIXED IMPORT

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // ✅ FIXED: use userApi.register()
      await userApi.register({ username, email, password });
      Alert.alert('Success', 'Account created successfully!');
      router.push('/login');
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.error || 'Something went wrong'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerSection}>
            <Image
              source={require('../assets/image.png')}
              style={styles.logo}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Echory community</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.mainBtn} onPress={handleRegister}>
              <Text style={styles.mainBtnText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.linkText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES (UNCHANGED)
========================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EBE3' },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  headerSection: { width: '100%', height: 250, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  logo: { width: '90%', height: '90%', resizeMode: 'contain' },
  formSection: { paddingHorizontal: 35, marginTop: -10 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#1A2B56', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#7C5DA3', textAlign: 'center', marginBottom: 25, marginTop: 5 },
  inputContainer: { backgroundColor: '#FFF', borderRadius: 15, marginBottom: 15, elevation: 2 },
  input: { height: 55, paddingHorizontal: 20, fontSize: 16, color: '#1A2B56' },
  mainBtn: { backgroundColor: '#1A2B56', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  footerLink: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#64748B', fontSize: 15 },
  linkText: { color: '#26A69A', fontWeight: 'bold' },
});
