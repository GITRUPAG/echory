import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emulator → 10.0.2.2
const API_URL = 'http://10.0.2.2:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// 🔐 Attach JWT automatically to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token'); // ✅ FIXED

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
