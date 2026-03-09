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

      // Use XMLHttpRequest instead of fetch for reliable file uploads in React Native
      // The whatwg-fetch polyfill overrides native fetch and doesn't support RN's FormData file convention
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', BACKEND_URL);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.timeout = 150000; // 150s timeout - must exceed backend's 120s detection timeout

        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(response);
            } else {
              reject(new Error(response.error || 'Detection failed'));
            }
          } catch {
            reject(new Error('Invalid server response'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network request failed. Check your connection and backend server.'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Request timed out. Check your network connection.'));
        };

        xhr.send(formData);
      });

      const detected = result.detectedFoods || {};

      // No food detected — alert and go back to scanner
      if (Object.keys(detected).length === 0) {
        Alert.alert(
          'No Food Detected',
          "Sorry, we couldn't detect any food in this image. Please try again with a clearer photo.",
          [{ text: 'OK', onPress: () => router.replace('/scanner') }]
        );
        return;
      }

      setStatus('Detection complete!');

      // Wait a moment before navigating to meals page
      setTimeout(() => {
        router.replace({
          pathname: '/add-meal',
          params: {
            detectedFoods: JSON.stringify(detected),
            mealType: String(mealType || 'snack')
          }
        });
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error
        ? error.message
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
