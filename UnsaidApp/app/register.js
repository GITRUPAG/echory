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
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        router.push('/login');
      } else {
        const errorData = await response.json();
        Alert.alert("Registration Failed", errorData.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
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
              source={require('../assets/image.png')} // Corrected to image.png
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

            <TouchableOpacity onPress={() => router.push('/login')} style={styles.footerLink}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.linkText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0EBE3' // Matches the logo's parchment color
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingBottom: 40 
  },
  headerSection: { 
    width: '100%',
    height: 250, // Slightly shorter than login to fit 3 inputs
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  logo: { 
    width: '90%', 
    height: '90%', 
    resizeMode: 'contain' 
  },
  formSection: { 
    paddingHorizontal: 35,
    marginTop: -10
  },
  title: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#1A2B56', // Logo Navy
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#7C5DA3', // Logo Purple
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  inputContainer: { 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  input: { 
    height: 55, 
    paddingHorizontal: 20, 
    fontSize: 16, 
    color: '#1A2B56' 
  },
  mainBtn: { 
    backgroundColor: '#1A2B56', 
    height: 55, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 4
  },
  mainBtnText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 1
  },
  footerLink: { 
    marginTop: 25, 
    alignItems: 'center' 
  },
  footerText: { 
    color: '#64748B',
    fontSize: 15 
  },
  linkText: { 
    color: '#26A69A', // Logo Teal
    fontWeight: 'bold' 
  }
});