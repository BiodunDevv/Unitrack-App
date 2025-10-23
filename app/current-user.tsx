import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#000000" />
        <Text className="text-gray-700 mt-4 text-sm">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Admin user - show message to use website
  if (user.role === "admin") {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <Text className="text-black text-lg font-semibold">
              Admin Portal
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 px-6 pt-6 pb-6 justify-between">
            <View>
              {/* Profile Card */}
              <View className="bg-white rounded-lg p-6 mb-6 items-center border border-gray-200">
                <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-4">
                  <Ionicons name="shield-checkmark" size={36} color="white" />
                </View>
                <Text className="text-black text-xl font-bold mb-1">
                  {user.name}
                </Text>
                <Text className="text-gray-600 text-sm mb-3">{user.email}</Text>
                <View className="bg-blue-50 rounded-full px-4 py-1.5 border border-blue-200">
                  <Text className="text-blue-600 text-xs font-semibold">
                    Administrator
                  </Text>
                </View>
              </View>

              {/* Info Banner */}
              <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
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
              <View className="gap-3">
                <Pressable
                  onPress={handleOpenWebsite}
                  className="bg-black rounded-lg py-3 px-6 flex-row items-center justify-center"
                >
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-semibold text-sm">
                    Open Web Dashboard
                  </Text>
                </Pressable>

                <Pressable
                  onPress={confirmLogout}
                  disabled={loggingOut}
                  className={`rounded-lg py-3 px-6 flex-row items-center justify-center border ${
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
                  <Text className="text-gray-900 font-semibold text-sm">
                    {loggingOut ? "Logging out..." : "Log Out"}
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
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Welcome Section */}
        <View className="px-6 pt-8 pb-6">
          <Text className="text-black text-3xl font-bold mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-600 text-sm">
            Manage your courses and track attendance
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pb-6 justify-between">
          <View>
            {/* Profile Card */}
            <View className="bg-white rounded-lg p-6 mb-6 items-center border border-gray-200">
              <View className="w-20 h-20 rounded-full bg-black items-center justify-center mb-4">
                <Ionicons name="person" size={40} color="white" />
              </View>
              <Text className="text-black text-xl font-bold mb-1">
                {user.name}
              </Text>
              <Text className="text-gray-600 text-sm mb-3">{user.email}</Text>
              <View className="bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200">
                <Text className="text-gray-800 text-xs font-semibold">
                  {user.role === "teacher" ? "Lecturer" : user.role}
                </Text>
              </View>
            </View>

            {/* Quick Actions Section */}
            <View className="mb-6">
              <Text className="text-gray-700 text-xs font-semibold mb-3 px-1">
                QUICK ACTIONS
              </Text>

              <Pressable
                onPress={handleNavigateToDashboard}
                className="bg-black rounded-lg py-4 px-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4">
                    <Ionicons name="grid" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">
                      Dashboard
                    </Text>
                    <Text className="text-white/70 text-xs">
                      View courses and sessions
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </Pressable>
            </View>

            {/* Logout Button */}
            <Pressable
              onPress={confirmLogout}
              disabled={loggingOut}
              className={`rounded-lg py-3 px-6 flex-row items-center justify-center border ${
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
                  <Text className="text-red-600 font-semibold text-sm">
                    Logging out...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color="#DC2626"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-red-600 font-semibold text-sm">
                    Log Out
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
