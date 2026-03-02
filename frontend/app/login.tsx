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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    console.log('=== Login Attempt ===');
    console.log('API_BASE:', API_BASE);
    console.log('URL:', `${API_BASE}/user/login`);
    console.log('Username:', username.trim());

    setLoading(true);
    try {
      console.log('Sending login request...');
      const response = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data));

      if (!response.ok) {
        console.log('Login failed:', data.error);
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
        return;
      }

      console.log('Login successful, token received');
      if (rememberMe) {
        await AsyncStorage.setItem('token', data.token);
        console.log('Token saved to AsyncStorage');
      }

      console.log('Navigating to home...');
      router.replace('/(tabs)');
    } catch (err: any) {
      console.log('=== Login Error ===');
      console.log('Error:', err.message);
      console.log('Full error:', err);
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
        <Text style={styles.title}>Log in to continue.</Text>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email or username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
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

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Reset Password</Text>
        </TouchableOpacity>

        {/* Remember Me */}
        {/* <View style={styles.rememberRow}>
          <Text style={styles.rememberText}>Remember me</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View> */}

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>LOG IN</Text>
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

        {/* Signup Link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>SIGN UP</Text>
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
    paddingTop: 120,
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
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 18,
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
  forgotContainer: {
    alignSelf: 'flex-start',
    marginBottom:18 ,
    marginLeft: 10,
  },
  forgotText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  rememberText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
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
  signupRow: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});
