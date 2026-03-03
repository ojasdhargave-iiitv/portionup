import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Calendar from '@/components/calendar';
import CaloriesCard from '@/components/calories-card';
import NutritionCard from '@/components/nutrition-card';
import BottomNavbar from '@/components/bottom-navbar';
import MealTypeModal from '@/components/meal-type-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/icon-symbol';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [caloriesRequired, setCaloriesRequired] = useState(2050);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [fibres, setFibres] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home');
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [showCalorieGoalModal, setShowCalorieGoalModal] = useState(false);
  const [calorieGoalInput, setCalorieGoalInput] = useState('');

  // Load saved calorie goal on mount
  useEffect(() => {
    const loadGoal = async () => {
      const saved = await AsyncStorage.getItem('calorieGoal');
      if (saved) setCaloriesRequired(Number(saved));
    };
    loadGoal();
  }, []);

  const handleSetCalorieGoal = async () => {
    const val = parseInt(calorieGoalInput, 10);
    if (!val || val <= 0) return;
    setCaloriesRequired(val);
    await AsyncStorage.setItem('calorieGoal', String(val));
    setShowCalorieGoalModal(false);
    setCalorieGoalInput('');
  };

  const fetchDailySummary = async (date: Date) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const res = await fetch(`${API_BASE}/user/summary?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCaloriesConsumed(data.calories || 0);
        setProtein(data.protein || 0);
        setCarbs(data.carbs || 0);
        setFats(data.fat || 0);
        setFibres(data.fiber || 0);
      }
    } catch (err) {
      console.error('Failed to fetch daily summary:', err);
    }
  };

  // Re-fetch when screen is focused (e.g. after adding a meal)
  useFocusEffect(
    useCallback(() => {
      fetchDailySummary(selectedDate);
    }, [selectedDate])
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTabPress = (tab: string) => {
    console.log('Tab pressed:', tab);
    
    // Navigate to the appropriate screen
    if (tab === 'home') {
      router.push('/');
    } else if (tab === 'meal') {
      router.push('/meals');
    } else if (tab === 'scanner') {
      router.push('/scanner');
    } else if (tab === 'setting') {
      router.push('/settings');
    }
  };

  const handleSelectMealType = (mealType: string) => {
    console.log('Selected meal type:', mealType);
    setShowMealTypeModal(false);
    // Navigate to search page with meal type
    router.push(`/meal-search?mealType=${mealType}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileContainer} onPress={() => router.push('/settings')}>
          <View style={styles.profileIcon}>
            <Image 
              source={require('@/assets/icons/profile.png')} 
              style={styles.profileIcon}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.brandName}>PortionUp</Text>
        <TouchableOpacity>
          <View style={styles.bellIconContainer}>
            <Image 
              source={require('@/assets/icons/bell.png')} 
              style={styles.bellIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar */}
        <Calendar onDateSelect={handleDateSelect} />

        {/* Calories Consumed Card - Full Width */}
        <View style={styles.fullWidthCardContainer}>
          <NutritionCard
            title="Calories Consumed"
            value={caloriesConsumed}
            unit="Cals"
            color="#FFAB73"
            maxValue={caloriesRequired}
            fullWidth={true}
          />
        </View>


        {/* Calories Left Card */}
        <CaloriesCard
          type="left"
          calories={Math.max(0, caloriesRequired - caloriesConsumed)}
          required={caloriesRequired}
          color="#F4D03F"
          onCirclePress={() => {
            setCalorieGoalInput(String(caloriesRequired));
            setShowCalorieGoalModal(true);
          }}
        />
        
        {/* Nutrition Cards Grid */}
        <View style={styles.nutritionGrid}>
          <NutritionCard
            title="Protein"
            value={protein}
            unit="grams"
            color="#E8B4F5"
            maxValue={150}
          />
          <NutritionCard
            title="Carbs"
            value={carbs}
            unit="grams"
            color="#A8D5A1"
            maxValue={300}
          />
          <NutritionCard
            title="Fats"
            value={fats}
            unit="grams"
            color="#F5A6A6"
            maxValue={200}
          />
          <NutritionCard
            title="Fibres"
            value={fibres}
            unit="grams"
            color="#A6C8E8"
            maxValue={250}
          />
        </View>

        

        {/* Extra padding to prevent content from being hidden behind navbar */}
        <View style={styles.navbarPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} />

      {/* Meal Type Selection Modal */}
      <MealTypeModal
        visible={showMealTypeModal}
        onClose={() => setShowMealTypeModal(false)}
        onSelectMealType={handleSelectMealType}
      />

      {/* Calorie Goal Input Modal */}
      <Modal
        visible={showCalorieGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalorieGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Calorie Goal</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 2050"
              placeholderTextColor="#aaa"
              value={calorieGoalInput}
              onChangeText={setCalorieGoalInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCalorieGoalModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSetCalorieGoal}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: '#ffffffff',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#808080ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    width: 24,
    height: 24,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fullWidthCardContainer: {
    width: '100%',
    marginBottom: 15,
  },
  navbarPadding: {
    height: 110,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E8734A',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
