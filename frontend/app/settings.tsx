import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/auth-context';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

function SettingItem({ icon, label, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIconContainer}>{icon}</View>
        <Text style={styles.settingItemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadUsername = async () => {
      const stored = await AsyncStorage.getItem('username');
      if (stored) setUsername(stored);
    };
    loadUsername();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Image
                source={require('@/assets/icons/profile.png')}
                style={styles.profileAvatar}
                resizeMode="cover"
              />
              <View style={styles.profileText}>
                <Text style={styles.profileName}>{username || 'User'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.qrButton}>
              <Ionicons name="qr-code" size={28} color="#222" />
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={<Ionicons name="person-outline" size={22} color="#555" />}
              label="My Profile"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="globe-outline" size={22} color="#555" />}
              label="Language and Country"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<MaterialCommunityIcons name="credit-card-outline" size={22} color="#555" />}
              label="Payment Option"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="notifications-outline" size={22} color="#555" />}
              label="Notification"
            />
          </View>

          {/* Promotions Section */}
          <Text style={styles.sectionTitle}>Promotions</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={<Ionicons name="people-outline" size={22} color="#555" />}
              label="Invite Friend & Donate"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<MaterialCommunityIcons name="bullhorn-outline" size={22} color="#555" />}
              label="Promotion Codes"
            />
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginLeft: 4,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#C8E64A',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#808080',
  },
  profileText: {
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  profileEmail: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  qrButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0EC',
    marginHorizontal: 14,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
  },
});
