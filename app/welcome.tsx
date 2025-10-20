import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SideSwipe from "react-native-sideswipe";

const { width } = Dimensions.get("window");

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

function OnboardingSlide({ item }: { item: (typeof onboardingData)[0] }) {
  return (
    <View style={{ width }} className="px-8">
      <Text className="text-gray-900 text-2xl font-bold text-center mb-4 leading-tight">
        {item.titleKey}
      </Text>
      <Text className="text-gray-600 text-sm text-center leading-6">
        {item.descriptionKey}
      </Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sideSwipeRef = useRef(null);

  // Static button texts
  const nextText = "Next";
  const getStartedText = "Get Started";
  const skipText = "Skip";
  const backText = "Back";

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

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("@unitrack_has_seen_onboarding", "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
    router.replace("/auth");
  };

  const renderItem = ({ itemIndex }: any) => {
    const item = onboardingData[itemIndex];
    return <OnboardingSlide item={item} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <View className="flex-1">
        {/* Top Bar */}
        <View className="flex-row justify-end items-center px-6 pt-4 pb-2">
          {/* Skip Button - Top Right */}
          <Pressable onPress={handleSkip} className="py-2 px-4">
            <Text className="text-white text-base font-medium">{skipText}</Text>
          </Pressable>
        </View>

        {/* Black Background Section with Logo */}
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <View className="w-72 h-72 items-center justify-center mb-8">
              <Image
                source={require("../assets/images/logoWhite.png")}
                className="w-56 h-56"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* UNITRACK Text Above White Card */}
        <View
          className="items-center shadow-lg mb-4"
          style={{ marginBottom: -18, zIndex: 10 }}
        >
          <View className="bg-black px-8 py-2 rounded-full">
            <Text className="text-white text-xl font-bold tracking-wider">
              UNITRACK
            </Text>
          </View>
        </View>

        {/* White Bottom Card with SideSwipe */}
        <View className="bg-white rounded-t-[40px] pt-10 pb-8">
          {/* SideSwipe Carousel */}
          <View style={{ height: 120 }}>
            <SideSwipe
              ref={sideSwipeRef}
              index={currentIndex}
              itemWidth={width}
              style={{ width }}
              data={onboardingData}
              contentOffset={0}
              onIndexChange={(index: number) => setCurrentIndex(index)}
              renderItem={renderItem}
              useVelocityForIndex={false}
            />
          </View>

          {/* Pagination Dots */}
          <View className="flex-row justify-center mb-8 px-8">
            {onboardingData.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full mx-1 ${
                  index === currentIndex ? "w-8 bg-black" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View className="px-8">
            {currentIndex > 0 ? (
              // Show Back and Next buttons side by side
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleBack}
                  className="flex-1 bg-gray-200 rounded-full py-4 items-center active:opacity-80"
                >
                  <Text className="text-gray-900 text-base font-bold">
                    {backText}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleNext}
                  className="flex-1 bg-black rounded-full py-4 items-center active:opacity-90 shadow-lg"
                  style={{
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Text className="text-white text-base font-bold">
                    {currentIndex === onboardingData.length - 1
                      ? getStartedText
                      : nextText}
                  </Text>
                </Pressable>
              </View>
            ) : (
              // Show only Next button on first slide
              <Pressable
                onPress={handleNext}
                className="bg-black rounded-full py-4 items-center active:opacity-90 shadow-lg"
                style={{
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text className="text-white text-base font-bold">
                  {nextText}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
