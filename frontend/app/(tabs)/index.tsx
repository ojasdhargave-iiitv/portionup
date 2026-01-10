import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Calendar from '@/components/calendar';
import CaloriesCard from '@/components/calories-card';
import NutritionCard from '@/components/nutrition-card';
import BottomNavbar from '@/components/bottom-navbar';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const router = useRouter();
  // hardcoded state for all values RN
  const [caloriesLeft, setCaloriesLeft] = useState(1352);
  const [caloriesRequired, setCaloriesRequired] = useState(2050);
  const [caloriesBurnt, setCaloriesBurnt] = useState(502);
  const [protein, setProtein] = useState(80);
  const [carbs, setCarbs] = useState(223);
  const [fats, setFats] = useState(121);
  const [fibres, setFibres] = useState(164);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // You can load data for the selected date here
    console.log('Selected date:', date);
  };

  const handleTabPress = (tab: string) => {
    console.log('Tab pressed:', tab);
    
    // Navigate to the appropriate screen
    if (tab === 'home') {
      router.push('/');
    } else if (tab === 'scanner') {
      router.push('/scanner');
    } else if (tab === 'setting') {
      router.push('/explore');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.profileIcon}>
            <Image 
              source={require('@/assets/icons/profile.png')} 
              style={styles.profileIcon}
              resizeMode="cover"
            />
          </View>
        </View>
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

        {/* Calories Left Card */}
        <CaloriesCard
          type="left"
          calories={caloriesLeft}
          required={caloriesRequired}
          color="#F4D03F"
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

        {/* Calories Burnt Card - Full Width */}
        <View style={styles.fullWidthCardContainer}>
          <NutritionCard
            title="Calories Burnt"
            value={caloriesBurnt}
            unit="Cals"
            color="#FFAB73"
            maxValue={1000}
            fullWidth={true}
          />
        </View>

        {/* Extra padding to prevent content from being hidden behind navbar */}
        <View style={styles.navbarPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} />
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
});
