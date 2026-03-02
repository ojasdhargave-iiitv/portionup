import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image, ImageBackground, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import NutritionCard from '@/components/nutrition-card';
import BottomNavbar from '@/components/bottom-navbar';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  size: string;
}

export default function MealsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [activeTab, setActiveTab] = useState('meal');
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '95%'], []);
  
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  // Verify authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Get token from .env for now (in production, this would come from secure storage/login)
        const token = process.env.EXPO_PUBLIC_AUTH_TOKEN;
        if (!token) {
          console.log('No auth token found');
          setIsAuthorized(false);
          return;
        }

        setAuthToken(token);
        
        const VERIFY_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/auth/verify`;
        const response = await fetch(VERIFY_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        
        if (response.ok && result.authorized) {
          console.log('User authenticated:', result.username);
          setIsAuthorized(true);
        } else {
          console.log('Authentication failed');
          setIsAuthorized(false);
          Alert.alert(
            'Authentication Required',
            'Please login to save meals',
            [{ text: 'OK', onPress: () => router.push('/') }]
          );
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthorized(false);
      }
    };

    verifyAuth();
  }, []);

  // Initialize with detected foods when coming from detection
  useEffect(() => {
    if (params.detectedFoods && typeof params.detectedFoods === 'string') {
      try {
        const detected = JSON.parse(params.detectedFoods);
        const items: FoodItem[] = Object.entries(detected).map(([name, count], index) => ({
          id: `detected-${index}`,
          name: name,
          quantity: count as number,
          size: 'Medium'
        }));
        setFoodItems(items);
        
        // Set meal type from params
        if (params.mealType && typeof params.mealType === 'string') {
          setSelectedMealType(params.mealType.charAt(0).toUpperCase() + params.mealType.slice(1));
        }
      } catch (error) {
        console.error('Failed to parse detected foods:', error);
      }
    }
  }, [params.detectedFoods, params.mealType]);

  // Nutrition values
  const [protein, setProtein] = useState(80);
  const [carbs, setCarbs] = useState(223);
  const [fats, setFats] = useState(121);
  const [fibres, setFibres] = useState(164);
  const [totalCalories, setTotalCalories] = useState(502);
  const healthScore = 66;

  const handleTabPress = (tab: string) => {
    console.log('Tab pressed:', tab);
    
    if (tab === 'home') {
      router.push('/');
    } else if (tab === 'meal') {
      router.push('/meals');
    } else if (tab === 'scanner') {
      router.push('/scanner');
    } else if (tab === 'activity') {
      router.push('/explore');
    } else if (tab === 'setting') {
      router.push('/explore');
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setFoodItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const cycleSize = (id: string, direction: 'prev' | 'next') => {
    const sizes = ['Small', 'Medium', 'Large', 'Measures'];
    setFoodItems(prev => prev.map(item => {
      if (item.id === id) {
        const currentIndex = sizes.indexOf(item.size);
        let newIndex;
        if (direction === 'next') {
          newIndex = (currentIndex + 1) % sizes.length;
        } else {
          newIndex = (currentIndex - 1 + sizes.length) % sizes.length;
        }
        return { ...item, size: sizes[newIndex] };
      }
      return item;
    }));
  };

  const saveMeal = async () => {
    if (!isAuthorized) {
      Alert.alert('Not Authorized', 'You must be logged in to save meals');
      return;
    }

    if (foodItems.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    if (!authToken) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare items for backend
      const items = foodItems.map(item => ({
        name: item.name,
        count: item.quantity
      }));

      const BACKEND_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/meal/manual`;
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          items: items,
          mealType: selectedMealType.toLowerCase()
        })
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success!',
          result.message || 'Meal saved successfully',
          [
            {
              text: 'OK',
              onPress: () => router.push('/')
            }
          ]
        );
      } else {
        // Show specific error from backend
        if (result.error?.includes('Unauthorized')) {
          Alert.alert('Unauthorized', 'Your session has expired. Please login again.');
          setIsAuthorized(false);
        } else {
          Alert.alert('Error', result.error || 'Failed to save meal');
        }
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Background Image */}
      <ImageBackground          
        source={require('@/assets/icons/illustration.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header Overlay */}
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Image
                source={require('@/assets/icons/back.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.title}>Nutrients</Text>

            <TouchableOpacity style={styles.headerButton}>
              <Image
                source={require('@/assets/icons/option.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* Bottom Sheet with Content */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Meal Type Dropdown and Add Disk Button */}
        <View style={styles.topControls}>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedMealType}
              onValueChange={(itemValue) => setSelectedMealType(itemValue)}
              style={styles.picker}
              dropdownIconColor="#000"
            >
              <Picker.Item label="Breakfast" value="Breakfast" />
              <Picker.Item label="Lunch" value="Lunch" />
              <Picker.Item label="Dinner" value="Dinner" />
              <Picker.Item label="Snacks" value="Snacks" />
            </Picker>
          </View>
          
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Disk</Text>
          </TouchableOpacity>
        </View>

        {/* Food Items List */}
        <View style={styles.foodList}>
          {foodItems.map(item => (
            <View key={item.id} style={styles.foodItem}>
              {/* Left side - Food Name */}
              <View style={styles.foodNameContainer}>
                <Text style={styles.foodName}>{item.name}</Text>
              </View>
              
              {/* Right side - Controls */}
              <View style={styles.controlsContainer}>
                {/* Quantity Controls */}
                <View style={styles.quantityControl}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Size Controls */}
                <View style={styles.sizeControl}>
                  <TouchableOpacity 
                    style={styles.sizeArrow}
                    onPress={() => cycleSize(item.id, 'prev')}
                  >
                    <Text style={styles.sizeArrowText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.sizeText}>{item.size}</Text>
                  <TouchableOpacity 
                    style={styles.sizeArrow}
                    onPress={() => cycleSize(item.id, 'next')}
                  >
                    <Text style={styles.sizeArrowText}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Health Score */}
        <View style={styles.healthScoreContainer}>
          <Text style={styles.healthScoreTitle}>Health Score</Text>
          <View style={styles.healthScoreBar}>
            <View style={[styles.healthScoreFill, { width: `${healthScore}%` }]} />
            <Text style={styles.healthScoreText}>{healthScore}%</Text>
          </View>
        </View>

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
            color="#B8D88A"
            maxValue={300}
          />
          <NutritionCard
            title="Fats"
            value={fats}
            unit="grams"
            color="#F5A8A8"
            maxValue={150}
          />
          <NutritionCard
            title="Fibres"
            value={fibres}
            unit="grams"
            color="#A8C8E8"
            maxValue={200}
          />
        </View>

        {/* Total Calories Card */}
        <View style={styles.totalCaloriesCard}>
          <View style={styles.caloriesContent}>
            <Text style={styles.caloriesTitle}>Total Calories</Text>
            <View style={styles.caloriesValueContainer}>
              <Text style={styles.caloriesValue}>{totalCalories}</Text>
              <Text style={styles.caloriesUnit}>Cals</Text>
            </View>
          </View>
          <View style={styles.caloriesCircle} />
        </View>

          {/* Done Button */}
          <TouchableOpacity 
            style={[styles.doneButton, (isSaving || !isAuthorized) && styles.doneButtonDisabled]} 
            onPress={saveMeal}
            disabled={isSaving || !isAuthorized}
          >
            <Text style={styles.doneButtonText}>
              {isSaving ? 'Saving...' : !isAuthorized ? 'Login Required' : 'Done'}
            </Text>
          </TouchableOpacity>

          {/* Bottom padding for navbar */}
          <View style={styles.bottomPadding} />
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Bottom Navigation */}
      <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundImage: {
    width: '100%',
    height: '65%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerOverlay: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handleIndicator: {
    backgroundColor: '#ddd',
    width: 40,
    height: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  dropdownContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 250,
    height: 60,
    gap: 10,
    paddingVertical: 30,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 60,
  },
  addButton: {
    backgroundColor: '#B8D88A',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 250,
    minWidth: 140,
    minHeight: 60,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  foodList: {
    marginBottom: 20,
  },
  foodItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  foodNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  controlsContainer: {
    flex: 1,
    gap: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5A8A8',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F5A8A8',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    minWidth: 30,
    textAlign: 'center',
  },
  sizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sizeArrow: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeArrowText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  sizeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  healthScoreContainer: {
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  healthScoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  healthScoreBar: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  healthScoreFill: {
    height: '100%',
    backgroundColor: '#B8D88A',
    borderRadius: 20,
  },
  healthScoreText: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlignVertical: 'center',
    lineHeight: 40,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalCaloriesCard: {
    backgroundColor: '#F5A563',
    borderRadius: 42,
    padding: 25,
    marginBottom: 20,
    minHeight: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  caloriesContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  caloriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  caloriesValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#333',
  },
  caloriesUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  caloriesCircle: {
    position: 'absolute',
    right: 13,
    top: '75%',
    width: 70,
    height: 70,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    transform: [{ translateY: -70 }],
  },
  bottomPadding: {
    height: 100,
  },
  doneButton: {
    backgroundColor: '#EF4444',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doneButtonDisabled: {
    backgroundColor: '#ccc',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
