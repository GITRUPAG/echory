import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../assets/welcome.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.brandTitle}>Echory</Text>
        <Text style={styles.description}>
          Share your story, free your heart. A safe space for everything left unsaid.
        </Text>

        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signUpBtn} 
          onPress={() => router.push('/register')}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F3F0' // Creamy background from logo texture
  },
  animationContainer: { 
    flex: 1.2, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  lottie: { 
    width: '80%', 
    height: '80%' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 30, 
    alignItems: 'center' 
  },
  welcomeText: { 
    fontSize: 20, 
    color: '#7C5DA3' // Muted Purple from logo accents
  },
  brandTitle: { 
    fontSize: 48, 
    color: '#1A2B56', // Deep Navy from the logo text
    fontWeight: 'bold',
    fontStyle: 'italic', // Added to match the script style of the logo
  },
  description: { 
    textAlign: 'center', 
    color: '#555E78', // Desaturated Navy for readability
    marginBottom: 40, 
    lineHeight: 22 
  },
  loginBtn: { 
    backgroundColor: '#1A2B56', // Primary Navy
    width: '100%', 
    height: 55, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
    // Optional: Subtle shadow for depth
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#FFF' 
  },
  signUpBtn: { 
    backgroundColor: 'transparent', 
    width: '100%', 
    height: 55, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#26A69A' // Teal/Cyan accent from logo
  },
  signUpText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#26A69A' 
  },
});