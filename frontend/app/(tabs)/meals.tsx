import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavbar from '@/components/bottom-navbar';
import MealTypeModal from '@/components/meal-type-modal';
import Calendar from '@/components/calendar';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

interface MealItem {
  name: string;
  count: number;
  unit: string;
}

interface MealEntry {
  _id: string;
  mealTime: string;
  mealType: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  items: MealItem[];
}

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍌',
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: '#E8734A',
  lunch: '#4A90D9',
  dinner: '#9B59B6',
  snack: '#27AE60',
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function MealCard({ meal, onDelete }: { meal: MealEntry; onDelete: (id: string) => void }) {
  const mealColor = MEAL_COLORS[meal.mealType] || '#888';
  const mealIcon = MEAL_ICONS[meal.mealType] || '🍽️';
  const mealLabel = meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1);

  return (
    <View style={styles.mealCard}>
      {/* Top row */}
      <View style={styles.mealCardHeader}>
        <View style={styles.mealTypeRow}>
          <Text style={styles.mealIcon}>{mealIcon}</Text>
          <Text style={[styles.mealTypeLabel, { color: mealColor }]}>{mealLabel}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.mealTime}>{formatTime(meal.mealTime)}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(meal._id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#E8734A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Food items */}
      <View style={styles.foodItemsList}>
        {meal.items.map((item, i) => (
          <Text key={i} style={styles.foodItemText}>
            {item.name} ({item.count} {item.unit})
          </Text>
        ))}
      </View>

      {/* Nutrition row */}
      <View style={styles.nutritionRow}>
        <View style={styles.nutrientBox}>
          <Text style={styles.nutrientLabel}>Calories</Text>
          <Text style={styles.nutrientValue}>{meal.totals.calories} cal</Text>
        </View>
        <View style={styles.nutrientBox}>
          <Text style={styles.nutrientLabel}>Protein</Text>
          <Text style={styles.nutrientValue}>{meal.totals.protein} g</Text>
        </View>
        <View style={styles.nutrientBox}>
          <Text style={styles.nutrientLabel}>Fat</Text>
          <Text style={styles.nutrientValue}>{meal.totals.fat} g</Text>
        </View>
        <View style={styles.nutrientBox}>
          <Text style={styles.nutrientLabel}>Carbs</Text>
          <Text style={styles.nutrientValue}>{meal.totals.carbs} g</Text>
        </View>
      </View>
    </View>
  );
}

export default function MealsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('meal');
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) return;

              const res = await fetch(`${API_BASE}/user/meal/${mealId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              if (res.ok) {
                setMeals(prev => prev.filter(m => m._id !== mealId));
              } else {
                Alert.alert('Error', 'Failed to delete meal');
              }
            } catch (err) {
              console.error('Delete meal error:', err);
              Alert.alert('Error', 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const fetchMeals = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/user/meals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals || []);
      }
    } catch (err) {
      console.error('Failed to fetch meals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchMeals();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeals();
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'home') {
      router.push('/');
    } else if (tab === 'meal') {
      // already here
    } else if (tab === 'scanner') {
      router.push('/scanner');
    } else if (tab === 'setting') {
      router.push('/settings');
    }
  };

  // Filter meals by selected date
  const filteredMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.mealTime);
    return (
      mealDate.getDate() === selectedDate.getDate() &&
      mealDate.getMonth() === selectedDate.getMonth() &&
      mealDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Group filtered meals by date
  const groupedMeals: Record<string, MealEntry[]> = {};
  filteredMeals.forEach((meal) => {
    const dateKey = new Date(meal.mealTime).toDateString();
    if (!groupedMeals[dateKey]) groupedMeals[dateKey] = [];
    groupedMeals[dateKey].push(meal);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Logs</Text>
      </View>

      {/* Calendar */}
      <Calendar onDateSelect={handleDateSelect} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8734A" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8734A" />
          }
        >
          {filteredMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>No meals logged</Text>
              <Text style={styles.emptySubtitle}>
                No meals found for this date. Add an entry below.
              </Text>
            </View>
          ) : (
            Object.entries(groupedMeals).map(([dateKey, dateMeals]) => (
              <View key={dateKey} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDateHeader(dateMeals[0].mealTime)}</Text>
                {dateMeals.map((meal) => (
                  <MealCard key={meal._id} meal={meal} onDelete={handleDeleteMeal} />
                ))}
              </View>
            ))
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Add Entry FAB */}
      <TouchableOpacity
        style={styles.addEntryButton}
        activeOpacity={0.85}
        onPress={() => setShowMealTypeModal(true)}
      >
        <Text style={styles.addEntryText}>+ Add Entry</Text>
      </TouchableOpacity>

      {/* Meal Type Selection Modal */}
      <MealTypeModal
        visible={showMealTypeModal}
        onClose={() => setShowMealTypeModal(false)}
        onSelectMealType={(mealType: string) => {
          setShowMealTypeModal(false);
          router.push(`/meal-search?mealType=${mealType}`);
        }}
      />

      {/* Bottom Navigation */}
      <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 12,
    backgroundColor: '#F5F5F0',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
    marginLeft: 4,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  mealIcon: {
    fontSize: 20,
  },
  mealTypeLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  mealTime: {
    fontSize: 13,
    color: '#AAA',
    fontWeight: '500',
  },
  foodItemsList: {
    marginBottom: 12,
    paddingLeft: 30,
  },
  foodItemText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  nutrientBox: {
    alignItems: 'center',
    flex: 1,
  },
  nutrientLabel: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 2,
    fontWeight: '500',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
  },
  addEntryButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    backgroundColor: '#E8734A',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#E8734A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  addEntryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
