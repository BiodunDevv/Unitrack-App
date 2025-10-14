import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HAS_SEEN_ONBOARDING = "@unitrack_has_seen_onboarding";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING);

        // Navigate after delay
        setTimeout(() => {
          if (hasSeen === "true") {
            // User has seen onboarding, go directly to auth
            router.replace("/auth");
          } else {
            // First time user, show welcome/onboarding
            router.replace("/welcome");
          }
        }, 2500);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to showing welcome on error
        setTimeout(() => {
          router.replace("/welcome");
        }, 2500);
      }
    };

    checkOnboarding();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        {/* Logo */}
        <Image
          source={require("../assets/images/logoDark.png")}
          className="w-32 h-32"
          resizeMode="contain"
        />

        {/* Loading Spinner at Bottom */}
        <View className="absolute bottom-32">
          <ActivityIndicator size="small" color="#000000" />
        </View>
      </View>
    </SafeAreaView>
  );
}
