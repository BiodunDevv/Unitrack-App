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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="text-gray-700 mt-4 font-medium">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="px-6 pt-4 pb-6 border-b border-gray-100">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-4 active:bg-gray-200"
              >
                <Ionicons name="arrow-back" size={22} color="#000000" />
              </Pressable>
              <Text className="text-black text-3xl font-bold mb-2">
                Update Name
              </Text>
              <Text className="text-gray-600 text-base">
                Change your display name
              </Text>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-1 px-6 pt-6 pb-6">
                {/* Current Name Display */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 rounded-2xl bg-black items-center justify-center mr-3">
                      <Ionicons name="person" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                        Current Name
                      </Text>
                      <Text className="text-black text-lg font-bold">
                        {profile?.name || user?.name || "Not set"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* New Name Input */}
                <View className="mb-6">
                  <Text className="text-black text-base font-bold mb-3">
                    New Name
                  </Text>
                  <View className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 flex-row items-center">
                    <Ionicons name="pencil" size={20} color="#000000" />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      className="flex-1 ml-3 text-base text-black font-medium"
                      placeholderTextColor="#9CA3AF"
                      editable={!isUpdating}
                      autoFocus={true}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  {name.trim().length > 0 && name.trim().length < 2 && (
                    <Text className="text-red-600 text-sm mt-2 font-medium">
                      Name must be at least 2 characters
                    </Text>
                  )}
                </View>

                {/* Guidelines Card */}
                <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <View className="flex-row items-start">
                    <View className="w-10 h-10 rounded-xl bg-black items-center justify-center mr-3">
                      <Ionicons name="information" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black text-sm font-bold mb-2">
                        Guidelines
                      </Text>
                      <Text className="text-gray-600 text-sm leading-6">
                        • Use your real full name{"\n"}• At least 2 characters
                        required{"\n"}• Changes apply immediately{"\n"}• Email
                        cannot be changed
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Spacer */}
                <View className="flex-1" />

                {/* Action Buttons */}
                <View className="pt-6 pb-4">
                  {/* Update Button */}
                  <Pressable
                    onPress={handleUpdateName}
                    disabled={
                      isUpdating || !name.trim() || name === profile?.name
                    }
                    className={`${
                      isUpdating || !name.trim() || name === profile?.name
                        ? "bg-gray-300"
                        : "bg-black"
                    } rounded-2xl py-4 items-center mb-3 flex-row justify-center`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white text-base font-bold">
                      {isUpdating ? "Updating..." : "Update Name"}
                    </Text>
                  </Pressable>

                  {/* Cancel Button */}
                  <Pressable
                    onPress={() => router.back()}
                    disabled={isUpdating}
                    className="bg-gray-100 rounded-2xl py-4 items-center active:bg-gray-200"
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
    </SafeAreaView>
  );
}
