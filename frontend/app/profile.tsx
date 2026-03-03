import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const stored = await AsyncStorage.getItem('username');
    if (stored) {
      setUsername(stored);
      setNewUsername(stored);
    }

    // Load profile pic
    const token = await AsyncStorage.getItem('token');
    if (token) {
      const picUrl = `${API_BASE}/user/profile/pic`;
      // Check if profile pic exists
      try {
        const res = await fetch(picUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          // Add timestamp to bust cache
          setProfilePicUri(`${picUrl}?t=${Date.now()}&token=${token}`);
        }
      } catch {
        // No profile pic
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant gallery access to select a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // Validate file type
      const mimeType = asset.mimeType || 'image/jpeg';
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
        Alert.alert('Invalid File', 'Only JPEG, PNG, and WebP images are allowed.');
        return;
      }

      // Validate file size
      if (asset.fileSize && asset.fileSize > MAX_PROFILE_PIC_SIZE) {
        Alert.alert('File Too Large', 'Profile picture must be under 5 MB.');
        return;
      }

      setSelectedImage(asset);
      setProfilePicUri(asset.uri);
    }
  };

  const handleSave = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    const hasUsernameChange = trimmed !== username;
    const hasImageChange = !!selectedImage;

    if (!hasUsernameChange && !hasImageChange) {
      Alert.alert('No Changes', 'Nothing to update.');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const formData = new FormData();

      if (hasUsernameChange) {
        formData.append('username', trimmed);
      }

      if (hasImageChange && selectedImage) {
        const imageFile = {
          uri: selectedImage.uri,
          type: selectedImage.mimeType || 'image/jpeg',
          name: `profile_${Date.now()}.jpg`,
        } as any;
        formData.append('profilePic', imageFile);
      }

      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Update stored data
        if (data.username) {
          await AsyncStorage.setItem('username', data.username);
          setUsername(data.username);
        }
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
        }
        if (data.hasProfilePic) {
          // Store a flag + timestamp so other screens know to reload
          await AsyncStorage.setItem('profilePicUpdated', String(Date.now()));
        }

        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Profile Picture */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {profilePicUri ? (
                <Image source={{ uri: profilePicUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#bbb" />
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          {/* Username Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.fieldInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter username"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 36,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8734A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F5F5F0',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  fieldContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  fieldInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e8e8e4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  saveButton: {
    marginHorizontal: 24,
    backgroundColor: '#E8734A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E8734A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
