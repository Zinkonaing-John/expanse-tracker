import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ReceiptScannerProps = {
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
};

export function ReceiptScanner({ onCapture, onCancel }: ReceiptScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <MaterialCommunityIcons name="camera-off-outline" size={56} color="#22d3ee" style={{ marginBottom: 16 }} />
        <Text className="text-white text-xl font-semibold mb-2 text-center">
          Camera not available on web
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          Please use the mobile app to scan receipts
        </Text>
        <TouchableOpacity
          onPress={handlePickImage}
          className="bg-primary-500 px-6 py-3 rounded-xl mb-4"
        >
          <Text className="text-white font-semibold">Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel}>
          <Text className="text-gray-400">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <MaterialCommunityIcons name="camera-outline" size={56} color="#22d3ee" style={{ marginBottom: 16 }} />
        <Text className="text-white text-xl font-semibold mb-2 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          We need camera access to scan your receipts
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary-500 px-6 py-3 rounded-xl mb-4"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel}>
          <Text className="text-gray-400">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="flex-1">
          <Image
            source={{ uri: capturedImage }}
            className="flex-1"
            resizeMode="contain"
          />
        </View>
        <View className="p-4 flex-row gap-3">
          <TouchableOpacity
            onPress={handleRetake}
            className="flex-1 bg-gray-700 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            className="flex-1 bg-primary-500 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
      >
        <View className="flex-1 justify-between">
          <View className="p-4">
            <TouchableOpacity
              onPress={onCancel}
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-4">
            <View className="bg-black/50 px-4 py-2 rounded-full">
              <Text className="text-white text-sm">
                Position receipt within frame
              </Text>
            </View>
          </View>

          <View className="mx-8 h-64 border-2 border-white/50 rounded-xl" />

          <View className="p-4 flex-row items-center justify-center gap-8">
            <TouchableOpacity
              onPress={handlePickImage}
              className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
            >
              <MaterialCommunityIcons name="image-multiple-outline" size={26} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCapture}
              disabled={isCapturing}
              className="w-20 h-20 rounded-full bg-white items-center justify-center"
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <View className="w-16 h-16 rounded-full border-4 border-gray-300" />
              )}
            </TouchableOpacity>

            <View className="w-14 h-14" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}
