import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

export default function FoodDetectionLoadingScreen() {
  const router = useRouter();
  const { imageUri, mealType } = useLocalSearchParams();
  const [status, setStatus] = useState('Uploading image...');

  useEffect(() => {
    uploadAndDetectFood();
  }, []);

  const uploadAndDetectFood = async () => {
    try {
      if (!imageUri || typeof imageUri !== 'string') {
        Alert.alert('Error', 'No image provided');
        router.back();
        return;
      }

      setStatus('Uploading image...');
      
      // Create form data
      const formData = new FormData();
      const timestamp = new Date().getTime();
      const filename = `meal_${timestamp}.jpg`;
      
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any;
      
      formData.append('mealImage', imageFile);
      formData.append('mealType', String(mealType || 'snack'));
      
      setStatus('Analyzing food...');
      
      const BACKEND_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/meal/upload`;
      console.log('Uploading to:', BACKEND_URL);
      
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid server response');
      }
      
      if (response.ok) {
        setStatus('Detection complete!');
        
        // Wait a moment before navigating to meals page
        setTimeout(() => {
          // Navigate to meals page with detected foods
          router.replace({
            pathname: '/meals',
            params: {
              detectedFoods: JSON.stringify(result.detectedFoods || {}),
              mealType: String(mealType || 'snack')
            }
          });
        }, 500);
      } else {
        throw new Error(result.error || 'Detection failed');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? (error.name === 'AbortError' ? 'Request timed out. Check your network connection.' : error.message)
        : 'Could not detect food in image';
      Alert.alert(
        'Detection Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => router.push('/scanner')
          }
        ]
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Food Icon or Animation */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🍽️</Text>
          </View>
          
          {/* Loading Spinner */}
          <ActivityIndicator size="large" color="#EF4444" style={styles.spinner} />
          
          {/* Status Text */}
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.subText}>Please wait while we analyze your meal</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconText: {
    fontSize: 80,
  },
  spinner: {
    marginBottom: 30,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
