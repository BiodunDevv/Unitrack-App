import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";

const HAS_SEEN_ONBOARDING = "@unitrack_has_seen_onboarding";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    const checkAppState = async () => {
      try {
        // Wait for auth store to finish loading
        if (isLoading) return;

        // Check if user is already authenticated
        if (isAuthenticated && user) {
          // Navigate authenticated users to current-user page
          setTimeout(() => {
            router.replace("/current-user");
          }, 2500);
          return;
        }

        // Not authenticated, check onboarding status
        const hasSeen = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING);

        setTimeout(() => {
          if (hasSeen === "true") {
            router.replace("/auth");
          } else {
            router.replace("/welcome");
          }
        }, 2500);
      } catch (error) {
        console.error("Error checking app state:", error);
        setTimeout(() => {
          router.replace("/welcome");
        }, 2500);
      }
    };

    checkAppState();
  }, [router, isAuthenticated, user, isLoading]);

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
