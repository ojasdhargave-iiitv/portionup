import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function MealSearchScreen() {
  const router = useRouter();
  const { mealType } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch random food items from backend
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/foods/random`);
        const data = await response.json();
        if (data.foods) {
          setFoodItems(data.foods);
        }
      } catch (error) {
        console.error('Failed to fetch food items:', error);
        // Fallback to mock data if API fails
        setFoodItems([
          { id: '1', name: 'Idli', calories: 58, protein: 2, carbs: 12, fat: 0.5 },
          { id: '2', name: 'Dosa', calories: 133, protein: 4, carbs: 24, fat: 2 },
          { id: '3', name: 'Sambar', calories: 80, protein: 3, carbs: 15, fat: 2 },
          { id: '4', name: 'Roti', calories: 71, protein: 3, carbs: 15, fat: 0.4 },
          { id: '5', name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  const filteredItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = (item: FoodItem) => {
    setSelectedItems([...selectedItems, item]);
  };

  const handleSubmit = async () => {
    // TODO: Send to backend
    console.log('Selected meal type:', mealType);
    console.log('Selected items:', selectedItems);
    
    // Navigate back or to summary
    router.back();
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
        <Text style={styles.searchIconText}>🔍</Text>
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodItem}
            onPress={() => handleAddItem(item)}
          >
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodDetails}>
                {item.calories} cal • P:{item.protein}g C:{item.carbs}g F:{item.fat}g
              </Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No food items found</Text>
          </View>
        }
      />

      {/* Selected Items Count */}
      {selectedItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add to {mealType}</Text>
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
  submitButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
