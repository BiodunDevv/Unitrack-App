import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";
import { useProfileStore } from "../../store/useProfileStore";

export default function Profile() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { profile, isLoading, getProfile } = useProfileStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getProfile();
    }
  }, [isAuthenticated, getProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
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

  if (isLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="text-gray-700 mt-4 font-medium">
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cover Photo Area */}
        <View className="bg-white">
          <View
            className="h-44 relative overflow-hidden"
            style={{ backgroundColor: "#0A0A0A" }}
          >
            {/* Animated Gradient Waves */}
            <View className="absolute inset-0">
              <View
                className="absolute w-full h-full"
                style={{
                  backgroundColor: "#1a1a1a",
                  transform: [{ skewY: "-6deg" }],
                }}
              />
              <View
                className="absolute -bottom-20 w-full h-40 rounded-t-full"
                style={{ backgroundColor: "#0f0f0f" }}
              />
            </View>

            {/* Grid Dots Pattern */}
            <View className="absolute inset-0" style={{ opacity: 0.15 }}>
              {[...Array(8)].map((_, row) => (
                <View key={row} className="flex-row justify-around py-2">
                  {[...Array(6)].map((_, col) => (
                    <View
                      key={col}
                      className="w-1.5 h-1.5 rounded-full bg-white"
                    />
                  ))}
                </View>
              ))}
            </View>

            {/* Large Logo Center */}
            <View className="absolute inset-0 items-center justify-center">
              <Image
                source={require("../../assets/images/logoWhite.png")}
                className="w-32 h-32"
                style={{ opacity: 0.08 }}
                resizeMode="contain"
              />
            </View>

            {/* Corner Accents */}
            <View
              className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-white"
              style={{ opacity: 0.1 }}
            />
            <View
              className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-white"
              style={{ opacity: 0.1 }}
            />

            {/* Floating Circles */}
            <View
              className="absolute top-12 right-16 w-20 h-20 rounded-full border border-white"
              style={{ opacity: 0.1 }}
            />
            <View
              className="absolute bottom-16 left-12 w-16 h-16 rounded-full bg-white"
              style={{ opacity: 0.05 }}
            />
          </View>

          {/* Profile Info Section */}
          <View className="px-4 pb-4">
            {/* Avatar overlapping cover */}
            <View className="items-center -mt-20 mb-3">
              <View className="relative">
                <View
                  className="w-36 h-36 rounded-full bg-white items-center justify-center"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View className="w-32 h-32 rounded-full bg-black items-center justify-center">
                    <Ionicons name="person" size={56} color="white" />
                  </View>
                </View>
                {profile?.email_verified && (
                  <View className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-blue-500 items-center justify-center border-4 border-white">
                    <Ionicons name="checkmark" size={18} color="white" />
                  </View>
                )}
              </View>
            </View>

            {/* Name and Email */}
            <View className="items-center mb-3">
              <Text className="text-black text-2xl font-bold text-center mb-1">
                {user?.name || profile?.name || "User"}
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                {profile?.email || user?.email}
              </Text>
            </View>

            {/* Role Badge */}
            <View className="items-center mb-4">
              <View className="bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                <View className="flex-row items-center">
                  <Ionicons name="school" size={14} color="#000000" />
                  <Text className="text-black text-xs font-semibold ml-1.5">
                    Lecturer
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View className="mb-3">
              <Pressable
                onPress={() => router.push("/profile/update-name" as any)}
                className="flex-1 bg-black rounded-lg py-2.5 active:bg-gray-800"
              >
                <Text className="text-white text-sm font-semibold text-center">
                  Edit Profile
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Divider */}
          <View className="h-2 bg-gray-50" />
        </View>

        {/* Details Section */}
        <View className="bg-white mt-2 px-4 py-4">
          <Text className="text-black text-xl font-bold mb-4">Details</Text>

          {/* Info Items */}
          {profile && (
            <>
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={20} color="#000000" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-base">
                    Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="time-outline" size={20} color="#000000" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-base">
                    Last active{" "}
                    {new Date(profile.last_login).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={20} color="#000000" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-base">
                    {profile?.email || user?.email}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Settings Section */}
        <View className="bg-white mt-2 px-4 py-4">
          <Text className="text-black text-xl font-bold mb-4">Settings</Text>

          {/* Settings Items */}
          <Pressable
            onPress={() => router.push("/profile/update-name" as any)}
            className="flex-row items-center py-3 active:bg-gray-50 rounded-lg"
          >
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center mr-3">
              <Ionicons name="person-outline" size={20} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-base font-medium">
                Personal Information
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <View className="h-px bg-gray-100 ml-12 my-1" />

          <Pressable
            onPress={() => router.push("/profile/update-password" as any)}
            className="flex-row items-center py-3 active:bg-gray-50 rounded-lg"
          >
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center mr-3">
              <Ionicons name="lock-closed-outline" size={20} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-base font-medium">
                Security & Password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <View className="h-px bg-gray-100 ml-12 my-1" />

          <Pressable className="flex-row items-center py-3 active:bg-gray-50 rounded-lg">
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center mr-3">
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#000000"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-base font-medium">
                Notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <View className="h-px bg-gray-100 ml-12 my-1" />

          <Pressable
            onPress={() => router.push("/help" as any)}
            className="flex-row items-center py-3 active:bg-gray-50 rounded-lg"
          >
            <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-base font-medium">
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Logout Section */}
        <View className="bg-white mt-2 px-4 py-4 mb-6">
          <Pressable
            onPress={confirmLogout}
            disabled={loggingOut}
            className="flex-row items-center py-3 active:bg-gray-50 rounded-lg"
          >
            <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              {loggingOut ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#EF4444" />
                  <Text className="text-red-500 text-base font-medium ml-2">
                    Logging out...
                  </Text>
                </View>
              ) : (
                <Text className="text-red-500 text-base font-medium">
                  Log Out
                </Text>
              )}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
