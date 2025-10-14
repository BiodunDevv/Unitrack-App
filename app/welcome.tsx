import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslatedTexts } from "../hooks/useTranslation";
import { SafeAreaView } from "react-native-safe-area-context";

const onboardingData = [
  {
    id: 1,
    titleKey: "Track Your Attendance Effortlessly",
    descriptionKey:
      "Monitor student attendance in real-time with GPS-verified check-ins. Stay organized and never miss a class.",
  },
  {
    id: 2,
    titleKey: "Location-Based Verification",
    descriptionKey:
      "Check in to classes with precise location tracking. Ensure accuracy and prevent proxy attendance automatically.",
  },
  {
    id: 3,
    titleKey: "Real-Time Reports & Analytics",
    descriptionKey:
      "Get instant insights into attendance patterns. Generate detailed reports and track your academic progress.",
  },
  {
    id: 4,
    titleKey: "Students: Submit Attendance Easily",
    descriptionKey:
      "As a student, simply open the app, verify your location, and submit your attendance with a single tap. Quick, easy, and secure.",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Get current item data
  const currentItem = onboardingData[currentIndex];

  // Translate all texts for current slide
  const [translatedTitle, translatedDescription, continueText, getStartedText] =
    useTranslatedTexts([
      currentItem.titleKey,
      currentItem.descriptionKey,
      "Continue",
      "Get Started",
    ]);

  // Continuous rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as seen
      try {
        await AsyncStorage.setItem("@unitrack_has_seen_onboarding", "true");
      } catch (error) {
        console.error("Error saving onboarding status:", error);
      }
      router.replace("/auth");
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Language Selector - Top Right */}
      <View className="absolute top-2 right-6 z-10">
        <LanguageSelector />
      </View>

      {/* Main Image */}
      <View className="flex-1 items-center justify-start pt-20">
        <View className="w-80 h-96 items-center justify-center">
          <Animated.Image
            source={require("../assets/images/logoWhite.png")}
            className="w-40 h-40"
            resizeMode="contain"
            style={{
              transform: [{ rotate: spin }],
            }}
          />
        </View>
      </View>

      {/* Content Section */}
      <View className="px-8 pb-12">
        {/* Title - Translated */}
        <Text className="text-white text-4xl font-bold mb-4 leading-tight">
          {translatedTitle}
        </Text>

        {/* Description - Translated */}
        <Text className="text-gray-400 text-base leading-6 mb-8">
          {translatedDescription}
        </Text>

        {/* Pagination Dots */}
        <View className="flex-row mb-8">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`h-1 rounded-full mr-2 ${
                index === currentIndex ? "w-8 bg-white" : "w-1 bg-gray-600"
              }`}
            />
          ))}
        </View>

        {/* Continue Button - Translated */}
        <Pressable
          onPress={handleNext}
          className="bg-white rounded-full py-4 items-center active:opacity-80"
        >
          <Text className="text-black text-lg font-semibold">
            {currentIndex === onboardingData.length - 1
              ? getStartedText
              : continueText}
          </Text>
        </Pressable>
      </View>

      {/* Bottom Safe Area */}
      <View className="h-8" />
    </SafeAreaView>
  );
}
