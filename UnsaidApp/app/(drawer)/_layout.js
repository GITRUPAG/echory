import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Feather } from '@expo/vector-icons';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        screenOptions={{ 
          headerShown: false, // Hide duplicate headers
          drawerActiveTintColor: '#1B3C1A',
        }}
      >
        {/* 1. This points to the folder containing your Bottom Tabs */}
        <Drawer.Screen
          name="(tabs)" 
          options={{
            drawerLabel: 'Home',
            title: 'Unsaid',
            drawerIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
          }}
        />

        {/* 2. This points to your bookmarks.js file inside (drawer) */}
        <Drawer.Screen
          name="bookmarks"
          options={{
            drawerLabel: 'My Bookmarks',
            title: 'Saved Stories',
            drawerIcon: ({ color }) => <Feather name="bookmark" size={20} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}