import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";
import { useProfileStore } from "../../store/useProfileStore";

export default function UpdateName() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const {
    profile,
    isLoading,
    error,
    updateSuccess,
    getProfile,
    updateProfile,
    clearError,
    clearSuccess,
  } = useProfileStore();

  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    if (updateSuccess) {
      Toast.show({
        type: "success",
        text1: "Name updated successfully!",
        text2: "Your display name has been changed",
      });
      clearSuccess();
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  }, [updateSuccess, clearSuccess, router]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: error,
      });
      clearError();
    }
  }, [error, clearError]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Name is required",
        text2: "Please enter your full name",
      });
      return;
    }

    if (name.trim().length < 2) {
      Toast.show({
        type: "error",
        text1: "Name too short",
        text2: "Name must be at least 2 characters",
      });
      return;
    }

    setIsUpdating(true);
    updateUser({ name: name.trim() });

    try {
      await updateProfile({ name: name.trim() });
    } catch (err) {
      console.error("Failed to update name:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <View className="flex-1">
        <SafeAreaView className="bg-white" edges={["top"]} />
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-4 font-medium">Loading...</Text>
        </View>
        <SafeAreaView className="bg-black" edges={["bottom"]} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView className="bg-white" edges={["top"]} />
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 py-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => router.back()}
                  className="mr-4 active:opacity-70"
                >
                  <Ionicons name="arrow-back" size={24} color="#000000" />
                </Pressable>
                <Text className="text-black text-xl font-bold">
                  Update Name
                </Text>
              </View>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-1 p-4 pb-6">
                {/* Current Name Card */}
                <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                  <Text className="text-gray-500 text-xs font-medium mb-2 uppercase">
                    Current Name
                  </Text>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-black items-center justify-center mr-3">
                      <Ionicons name="person" size={20} color="white" />
                    </View>
                    <Text className="text-black text-base font-semibold">
                      {profile?.name || user?.name || "Not set"}
                    </Text>
                  </View>
                </View>

                {/* New Name Input Card */}
                <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                  <Text className="text-gray-500 text-xs font-medium mb-3 uppercase">
                    New Name
                  </Text>
                  <View className="bg-gray-50 rounded-lg px-4 py-3 flex-row items-center border border-gray-200">
                    <Ionicons name="pencil" size={18} color="#6B7280" />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      className="flex-1 ml-3 text-base text-black"
                      placeholderTextColor="#9CA3AF"
                      editable={!isUpdating}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  {name.trim().length > 0 && name.trim().length < 2 && (
                    <Text className="text-red-600 text-xs mt-2">
                      Name must be at least 2 characters
                    </Text>
                  )}
                </View>

                {/* Guidelines Card */}
                <View className="bg-white rounded-lg p-4 border border-gray-200">
                  <View className="flex-row items-center mb-3">
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#000000"
                    />
                    <Text className="text-black text-sm font-semibold ml-2">
                      Guidelines
                    </Text>
                  </View>
                  <Text className="text-gray-600 text-sm leading-6">
                    • Use your real full name{"\n"}• At least 2 characters
                    required{"\n"}• Changes apply immediately{"\n"}• Email
                    cannot be changed
                  </Text>
                </View>

                {/* Spacer */}
                <View className="flex-1" />

                {/* Action Buttons */}
                <View className="pt-6">
                  {/* Update Button */}
                  <Pressable
                    onPress={handleUpdateName}
                    disabled={
                      isUpdating || !name.trim() || name === profile?.name
                    }
                    className={`${
                      isUpdating || !name.trim() || name === profile?.name
                        ? "bg-gray-300"
                        : "bg-black active:bg-gray-800"
                    } rounded-lg py-3.5 items-center mb-2 flex-row justify-center`}
                  >
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text className="text-white text-base font-semibold">
                      {isUpdating ? "Updating..." : "Update Name"}
                    </Text>
                  </Pressable>

                  {/* Cancel Button */}
                  <Pressable
                    onPress={() => router.back()}
                    disabled={isUpdating}
                    className="bg-white rounded-lg py-3.5 items-center border border-gray-300 active:bg-gray-50"
                  >
                    <Text className="text-black text-base font-semibold">
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </View>
  );
}
