import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import BottomNavbar from '@/components/bottom-navbar';
import MealTypeModal from '@/components/meal-type-modal';

const { width, height } = Dimensions.get('window');

type ScanMode = 'scanFood' | 'barcodes' | 'foodTags' | 'gallery';

export default function ScannerScreen() {
  const [activeMode, setActiveMode] = useState<ScanMode>('scanFood');
  const [activeTab, setActiveTab] = useState('scanner');
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleTakePhoto = async () => {
    if (activeMode === 'scanFood' && cameraRef.current && !isUploading) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.4, // Compress to 40% quality for faster upload
          base64: false,
          skipProcessing: true,
        });
        
        if (!photo || !photo.uri) {
          Alert.alert('Error', 'Failed to capture photo');
          return;
        }
        
        console.log('Photo captured:', photo);
        
        // Get meal type based on time
        const mealType = getMealType();
        
        // Navigate to loading screen with image URI and meal type
        router.push(`/food-detection-loading?imageUri=${encodeURIComponent(photo.uri)}&mealType=${mealType}`);
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to capture photo');
      }
    }
  };

  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 21) return 'dinner';
    return 'snack';
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need camera permission</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleTabPress = (tab: string) => {
    console.log('Tab pressed:', tab);
    
    // Navigate to the appropriate screen
    if (tab === 'home') {
      router.push('/');
    } else if (tab === 'meal') {
      router.push('/meals');
    } else if (tab === 'scanner') {
      // already here
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

  const scanModes = [
    {
      id: 'scanFood' as ScanMode,
      label: 'Scan Food',
      icon: require('@/assets/icons/scanfood.png'),
    },
    {
      id: 'barcodes' as ScanMode,
      label: 'Barcodes',
      icon: require('@/assets/icons/barcode.png'),
    },
    {
      id: 'foodTags' as ScanMode,
      label: 'Food Tags',
      icon: require('@/assets/icons/foodtag.png'),
    },
    {
      id: 'gallery' as ScanMode,
      label: 'Gallery',
      icon: require('@/assets/icons/Gallery.png'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Camera View - Full Screen */}
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        {/* Header - Overlay on Camera */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Image
              source={require('@/assets/icons/back.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <Text style={styles.title}>Scanner</Text>

          <TouchableOpacity style={styles.headerButton}>
            <Image
              source={require('@/assets/icons/option.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Camera Preview Area with Scan Frame */}
        <Pressable style={styles.cameraContainer} onPress={handleTakePhoto}>
          {/* Vignette Effect - Darkened outer area */}
          <View style={styles.vignetteOverlay} />

          {/* Scan Frame Overlay */}
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
          </View>
        </Pressable>

        {/* Scan Mode Buttons */}
        <View style={styles.modesContainer}>
          {scanModes.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeButton,
                  isActive && styles.modeButtonActive,
                ]}
                onPress={() => setActiveMode(mode.id)}
                activeOpacity={0.7}
              >
                <Image
                  source={mode.icon}
                  style={[
                    styles.modeIcon,
                    isActive && styles.modeIconActive,
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.modeLabel,
                    isActive && styles.modeLabelActive,
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </CameraView>

      {/* Bottom Navigation */}
      <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} />

      {/* Meal Type Selection Modal */}
      <MealTypeModal
        visible={showMealTypeModal}
        onClose={() => setShowMealTypeModal(false)}
        onSelectMealType={handleSelectMealType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vignetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  scanFrameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  scanFrame: {
    width: width - 60,
    height: width - 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 40,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 40,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 40,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 40,
  },
  modesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 12,
    zIndex: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modeButton: {
    flex: 1,
    backgroundColor: 'rgba(229, 229, 229, 0.95)',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    maxWidth: 85,
  },
  modeButtonActive: {
    backgroundColor: '#EF4444',
  },
  modeIcon: {
    width: 28,
    height: 28,
    marginBottom: 6,
    tintColor: '#000',
  },
  modeIconActive: {
    tintColor: '#fff',
  },
  modeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  modeLabelActive: {
    color: '#fff',
  },
});
