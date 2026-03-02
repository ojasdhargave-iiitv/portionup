import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

interface MealTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMealType: (mealType: string) => void;
}

export default function MealTypeModal({
  visible,
  onClose,
  onSelectMealType,
}: MealTypeModalProps) {
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Which meal would you like to track?</Text>

          <View style={styles.optionsContainer}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.value}
                style={styles.optionButton}
                onPress={() => onSelectMealType(meal.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{meal.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
});
