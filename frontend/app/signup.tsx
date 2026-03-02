import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Signup Failed', data.error || 'Could not create account');
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>PortionUp</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Sign up to get started.</Text>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.inputIcon}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        {/* <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-facebook" size={22} color="#1877F2" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={22} color="#EA4335" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={22} color="#000" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity> */}

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>LOG IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 115,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandName: {
    fontSize:35,
    fontWeight: '900',
    color: '#111',
    letterSpacing: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  inputIcon: {
    marginLeft: 8,
  },
  signupButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  socialButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  socialIcon: {
    position: 'absolute',
    left: 20,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  loginRow: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});
