import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';

interface BottomNavbarProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export default function BottomNavbar({ activeTab = 'home', onTabPress }: BottomNavbarProps) {
  const tabs = [
    { name: 'home', icon: require('@/assets/icons/home.png'), label: 'Home' },
    { name: 'meal', icon: require('@/assets/icons/meal icon.png'), label: 'Meal', iconStyle: styles.mealIcon },
    { name: 'scanner', icon: require('@/assets/icons/scanner icon.png'), label: 'Scan' },
    { name: 'fitness', icon: require('@/assets/icons/fitness icon\'.png'), label: 'Fitness', iconStyle: styles.fitnessIcon },
    { name: 'setting', icon: require('@/assets/icons/setting icon.png'), label: 'Setting' },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabPress?.(tab.name)}
            >
              <Image
                source={tab.icon}
                style={[
                  styles.icon,
                  !isActive && styles.inactiveIcon,
                  tab.iconStyle
                ]}
                resizeMode="contain"
              />
              {isActive && (
                <Text style={styles.label}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1000,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 50,
  },
  activeTab: {
    transform: [{ translateY: -0 }],
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  inactiveIcon: {
    tintColor: '#888',
  },
  mealIcon: {
    width:26,
    height:26,
  },
  fitnessIcon: {
    width:25,
    height:25,
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
