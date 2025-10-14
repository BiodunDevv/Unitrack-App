import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import useTranslationStore from "../store/useTranslationStore";

/**
 * Beautiful toast overlay with glassmorphism and smooth animations
 * Shows when translations are being fetched
 */
export default function TranslationToast() {
  const isFetchingLanguage = useTranslationStore(
    (state) => state.isFetchingLanguage
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFetchingLanguage) {
      // Start rotation animation for loading icon
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Slide in and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out and fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFetchingLanguage]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="absolute top-0 left-0 right-0 z-50 pointer-events-none items-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
        }}
        className="mt-14 mx-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl px-6 py-4 flex-row items-center shadow-2xl"
      >
        {/* Animated Loading Icon */}
        <Animated.View
          style={{ transform: [{ rotate: spin }] }}
          className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3"
        >
          <Ionicons name="sync" size={18} color="#fff" />
        </Animated.View>

        {/* Text Content */}
        <View className="flex-1">
          <Text className="text-white text-sm font-bold">
            Fetching Language
          </Text>
          <Text className="text-white/70 text-xs mt-0.5">
            Translating content...
          </Text>
        </View>

        {/* Pulse Animation Indicator */}
        <View className="flex-row ml-2">
          <View className="w-1.5 h-1.5 rounded-full bg-white/60 mx-0.5" />
          <View className="w-1.5 h-1.5 rounded-full bg-white/40 mx-0.5" />
          <View className="w-1.5 h-1.5 rounded-full bg-white/20 mx-0.5" />
        </View>
      </Animated.View>
    </View>
  );
}
