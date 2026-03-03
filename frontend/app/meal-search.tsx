import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface SelectedItem {
  food: FoodItem;
  count: number;
}

export default function MealSearchScreen() {
  const router = useRouter();
  const { mealType } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Prefetch ALL food items on mount (only 29 items)
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/user/foods/all`);
        const data = await response.json();
        if (data.foods) {
          setFoodItems(data.foods);
        }
      } catch (error) {
        console.error('Failed to fetch food items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  // Only filter when 3+ characters typed, show all items when search is empty
  const filteredItems = searchQuery.length === 0
    ? foodItems
    : searchQuery.length < 3
      ? foodItems
      : foodItems.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const getSelectedCount = (itemId: string) => {
    const found = selectedItems.find(s => s.food.id === itemId);
    return found ? found.count : 0;
  };

  const handleAddItem = (item: FoodItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(s => s.food.id === item.id);
      if (existing) {
        return prev.map(s => s.food.id === item.id ? { ...s, count: s.count + 1 } : s);
      }
      return [...prev, { food: item, count: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => {
      const existing = prev.find(s => s.food.id === itemId);
      if (existing && existing.count > 1) {
        return prev.map(s => s.food.id === itemId ? { ...s, count: s.count - 1 } : s);
      }
      return prev.filter(s => s.food.id !== itemId);
    });
  };

  const totalSelectedCount = selectedItems.reduce((sum, s) => sum + s.count, 0);

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return;

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const items = selectedItems.map(s => ({
        name: s.food.name,
        count: s.count,
      }));

      const res = await fetch(`${API_BASE}/user/meal/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          mealType: String(mealType || 'snack'),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Meal Added', `${totalSelectedCount} item${totalSelectedCount !== 1 ? 's' : ''} logged as ${mealType}`, [
          { text: 'OK', onPress: () => router.replace('/meals') },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to add meal');
      }
    } catch (err) {
      console.error('Submit meal error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image
            source={require('@/assets/icons/back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Add {mealType ? String(mealType).charAt(0).toUpperCase() + String(mealType).slice(1) : 'Meal'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food items..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Food List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const count = getSelectedCount(item.id);
          return (
            <View style={[styles.foodItem, count > 0 && styles.foodItemSelected]}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodDetails}>
                  {item.calories} cal • P:{item.protein}g C:{item.carbs}g F:{item.fat}g
                </Text>
              </View>
              <View style={styles.countControls}>
                {count > 0 && (
                  <>
                    <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
                      <Text style={styles.removeButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.countText}>{count}</Text>
                  </>
                )}
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddItem(item)}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No food items found</Text>
          </View>
        }
      />

      {/* Selected Items Count & Submit */}
      {selectedItems.length > 0 && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>
              {totalSelectedCount} item{totalSelectedCount !== 1 ? 's' : ''} selected
            </Text>
            <Text style={styles.footerSubtext}>
              {selectedItems.map(s => `${s.food.name} x${s.count}`).join(', ')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add to {mealType}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIconText: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  foodItemSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 13,
    color: '#666',
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#666',
    marginTop: -2,
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    maxWidth: 180,
  },
  submitButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
