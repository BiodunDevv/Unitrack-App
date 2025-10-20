import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";

export default function CurrentUserScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  const confirmLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: handleLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Logged out successfully",
      });
      router.replace("/auth");
    } catch {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: "Please try again",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleOpenWebsite = () => {
    Linking.openURL("https://unitrack.space");
  };

  const handleNavigateToDashboard = () => {
    router.push("/(tabs)");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="text-gray-700 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Admin user - show message to use website
  if (user.role === "admin") {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
        <View className="flex-1 bg-white">
          {/* Black Header */}
          <View
            className="bg-black px-6 pt-4 pb-8 relative"
            style={{ minHeight: 240 }}
          >
            {/* Decorative ADMIN - Bottom Right */}
            <View className="absolute bottom-2 right-6">
              <Text className="text-gray-400 text-7xl font-black tracking-wider opacity-20">
                ADMIN
              </Text>
            </View>

            <View className="flex-row items-center mb-6 z-10 pt-2">
              <View className="flex-row items-center">
                <Image
                  source={require("../assets/images/logoWhite.png")}
                  className="w-8 h-8 mr-2"
                  resizeMode="contain"
                />
                <Text className="text-white text-lg font-bold">UNITRACK</Text>
              </View>
            </View>

            <View className="z-10 pr-8">
              <Text className="text-white text-2xl font-bold mb-2">
                ADMIN PORTAL
              </Text>
              <Text className="text-white/80 text-sm leading-5">
                Access the full admin dashboard and management tools on our web
                platform
              </Text>
            </View>
          </View>

          {/* White Content Section */}
          <View className="flex-1 px-6 pt-8 pb-6 justify-between">
            <View>
              {/* Profile Card */}
              <View className="bg-gray-50 rounded-2xl p-6 mb-6 items-center border border-gray-200">
                <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-4">
                  <Ionicons name="shield-checkmark" size={40} color="white" />
                </View>
                <Text className="text-black text-xl font-bold mb-1">
                  {user.name}
                </Text>
                <Text className="text-gray-600 text-sm mb-3">{user.email}</Text>
                <View className="bg-blue-50 rounded-full px-4 py-1 border border-blue-200">
                  <Text className="text-blue-600 text-xs font-bold uppercase">
                    Administrator
                  </Text>
                </View>
              </View>

              {/* Info Banner */}
              <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color="#3B82F6"
                    style={{ marginRight: 12, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <Text className="text-blue-900 font-semibold text-sm mb-1">
                      Mobile Access Limited
                    </Text>
                    <Text className="text-blue-700 text-xs leading-5">
                      Full admin features are only available on the web
                      platform. Please use a desktop browser for complete access
                      to the dashboard.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex gap-3">
                <Pressable
                  onPress={handleOpenWebsite}
                  className="bg-black rounded-full py-4 px-6 flex-row items-center justify-center"
                >
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-white font-bold text-base tracking-wide">
                    OPEN WEB DASHBOARD
                  </Text>
                </Pressable>

                <Pressable
                  onPress={confirmLogout}
                  disabled={loggingOut}
                  className={`rounded-full py-4 px-6 flex-row items-center justify-center border ${
                    loggingOut
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {loggingOut && (
                    <ActivityIndicator
                      size="small"
                      color="#111827"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-gray-900 font-bold text-base">
                    {loggingOut ? "Logging out..." : "LOG OUT"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Teacher user - show enhanced profile with menu options
  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white">
        {/* Black Header */}
        <View
          className="bg-black px-6 pt-4 pb-8 relative"
          style={{ minHeight: 200 }}
        >
          {/* Decorative PROFILE - Bottom Right */}
          <View className="absolute bottom-2 right-6">
            <Text className="text-gray-400 text-7xl font-black tracking-wider opacity-20">
              PROFILE
            </Text>
          </View>

          <View className="flex-row items-center mb-6 z-10 pt-2">
            <View className="flex-row items-center">
              <Image
                source={require("../assets/images/logoWhite.png")}
                className="w-8 h-8 mr-2"
                resizeMode="contain"
              />
              <Text className="text-white text-lg font-bold">UNITRACK</Text>
            </View>
          </View>

          <View className="z-10 pr-8">
            <Text className="text-white text-2xl font-bold mb-2">
              WELCOME BACK
            </Text>
            <Text className="text-white/80 text-sm leading-5">
              Manage your profile and access your dashboard
            </Text>
          </View>
        </View>

        {/* White Content Section */}
        <View className="flex-1 px-6 pt-8 pb-6 justify-between">
          <View>
            {/* Profile Card */}
            <View className="bg-gray-50 rounded-2xl p-6 mb-6 items-center border border-gray-200">
              <View className="w-24 h-24 rounded-full bg-black items-center justify-center mb-4">
                <Ionicons name="person" size={48} color="white" />
              </View>
              <Text className="text-black text-2xl font-bold mb-1">
                {user.name}
              </Text>
              <Text className="text-gray-600 text-sm mb-3">{user.email}</Text>
              <View className="bg-gray-200 rounded-full px-4 py-1">
                <Text className="text-gray-800 text-xs font-bold uppercase">
                  {user.role}
                </Text>
              </View>
            </View>

            {/* Quick Actions Section */}
            <View className="mb-6">
              <Text className="text-gray-700 text-xs font-bold uppercase mb-3 px-2">
                Quick Actions
              </Text>

              <Pressable
                onPress={handleNavigateToDashboard}
                className="bg-black rounded-full py-4 px-6 flex-row items-center justify-between mb-3"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4">
                    <Ionicons name="grid" size={22} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">
                      Dashboard
                    </Text>
                    <Text className="text-white/70 text-xs">
                      View courses and sessions
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color="white" />
              </Pressable>
            </View>

            {/* Logout Button */}
            <Pressable
              onPress={confirmLogout}
              disabled={loggingOut}
              className={`rounded-full py-4 px-6 flex-row items-center justify-center border ${
                loggingOut
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-red-200"
              }`}
            >
              {loggingOut ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#DC2626"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-red-600 font-bold text-base">
                    Logging out...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#DC2626"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-red-600 font-bold text-base">
                    LOG OUT
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View className="items-center pb-4">
            <Text className="text-gray-400 text-xs">UniTrack v1.0.0</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
