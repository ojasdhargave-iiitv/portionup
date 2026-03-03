import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Dimensions, Image } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  resetKey?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = (SCREEN_WIDTH - 60) / 7; // Adjust based on container padding

export default function Calendar({ onDateSelect, resetKey }: CalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Reset to today whenever resetKey changes (e.g. on screen focus)
  useEffect(() => {
    if (resetKey !== undefined) {
      const now = new Date();
      setSelectedDate(now);
      setCurrentDate(now);
      onDateSelect?.(now);
    }
  }, [resetKey]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Get all days in the current month for scrolling
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = new Date(year, month, i);
      days.push({
        date: i,
        dayOfWeek: currentDay.getDay(),
        fullDate: currentDay,
        isFuture: currentDay > today,
      });
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Auto-scroll to selected date (or today on mount) when month changes
  useEffect(() => {
    const targetDate = selectedDate;
    const targetIndex = days.findIndex(
      (day) =>
        day.date === targetDate.getDate() &&
        currentDate.getMonth() === targetDate.getMonth() &&
        currentDate.getFullYear() === targetDate.getFullYear()
    );
    
    if (targetIndex !== -1 && scrollViewRef.current) {
      // Delay to ensure the ScrollView is rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, targetIndex * DAY_WIDTH - DAY_WIDTH * 2), // Center selected date
          animated: true,
        });
      }, 100);
    }
  }, [currentDate, selectedDate]);

  const handleDatePress = (fullDate: Date) => {
    setSelectedDate(fullDate);
    onDateSelect?.(fullDate);
  };

  const handleMonthYearChange = (month: number, year: number) => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
    setShowDropdown(false);
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getDayName = (dayOfWeek: number) => {
    // dayOfWeek: 0 = Sunday, 1 = Monday, etc.
    // Convert to Monday = 0 format
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return dayNames[adjustedDay];
  };

  return (
    <View style={styles.container}>
      {/* Month/Year Dropdown Header */}
      <TouchableOpacity 
        style={styles.dropdownHeader}
        onPress={() => setShowDropdown(true)}
      >
        <Image 
          source={require('../assets/icons/calenderpng.png')} 
          style={styles.calendarIcon}
        />
        <Text style={styles.monthText}>
          {monthNames[currentDate.getMonth()]}
        </Text>
        <Image 
          source={require('../assets/icons/drop.png')} 
          style={styles.dropIcon}
        />
      </TouchableOpacity>

      {/* Horizontal Scrollable Calendar */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={DAY_WIDTH}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayContainer}
            onPress={() => !day.isFuture && handleDatePress(day.fullDate)}
            activeOpacity={day.isFuture ? 1 : 0.7}
          >
            {/* Selected Date Indicator - Vertical Pill (moves with selection) */}
            {!day.isFuture && isSelected(day.fullDate) && <View style={styles.todayPill} />}
            {day.isFuture && <View style={styles.futurePill} />}
            
            {/* Day Name */}
            <Text style={[
              styles.dayNameText,
              !day.isFuture && isSelected(day.fullDate) && styles.selectedText,
              day.isFuture && styles.futureText,
            ]}>
              {getDayName(day.dayOfWeek)}
            </Text>
            
            {/* Date Number - All dates have background circle */}
            <View style={[
              styles.dateCircle,
              !day.isFuture && isSelected(day.fullDate) && styles.selectedCircle,
              day.isFuture && styles.futureDateCircle,
            ]}>
              <Text style={[
                styles.dateText,
                !day.isFuture && isSelected(day.fullDate) && styles.selectedDateText,
                day.isFuture && styles.futureText,
              ]}>
                {day.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Month/Year Picker Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownTitle}>Select Month & Year</Text>
            <ScrollView style={styles.dropdownScroll}>
              {[2026, 2025].map((year) => {
                // For current year, only show months up to current month
                const maxMonth = year === today.getFullYear() ? today.getMonth() : 11;
                return (
                  <View key={year}>
                    <Text style={styles.yearText}>{year}</Text>
                    <View style={styles.monthsGrid}>
                      {monthNames.slice(0, maxMonth + 1).map((month, index) => (
                        <TouchableOpacity
                          key={month}
                          style={styles.monthItem}
                          onPress={() => handleMonthYearChange(index, year)}
                        >
                          <Text style={styles.monthItemText}>{month}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff00',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'flex-start',
    gap: 8,
  },
  calendarIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  dropIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  dayContainer: {
    width: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },
  todayPill: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: '120%',
    backgroundColor: '#FF4632',
    borderRadius: 24,
    zIndex: -1,
  },
  dayNameText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  todayText: {
    color: '#fff',
  },
  selectedText: {
    color: '#fff',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Light gray background for all dates
  },
  selectedCircle: {
    backgroundColor: '#333', // Dark circle for selected date
  },
  dateText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: '600',
  },
  futurePill: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: '120%',
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    zIndex: -1,
  },
  futureText: {
    color: '#bbb',
  },
  futureDateCircle: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: SCREEN_WIDTH * 0.85,
    maxHeight: '70%',
    padding: 20,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdownScroll: {
    maxHeight: 400,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5757',
    marginTop: 15,
    marginBottom: 10,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  monthItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
