import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ otp?: string; email?: string }>();
  const { verifyOTPAndResetPassword, isLoading } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasNumber = /\d/.test(password);
  const minLength = password.length >= 8;
  const passwordsMatch = password === confirm && password.length > 0;
  const valid = minLength && hasNumber && passwordsMatch;

  const handleReset = async () => {
    if (!valid) {
      Toast.show({
        type: "error",
        text1: "Invalid password",
        text2: "Please check all requirements",
      });
      return;
    }

    if (!params.otp || !params.email) {
      Toast.show({
        type: "error",
        text1: "Invalid session",
        text2: "Please request a password reset again",
      });
      router.replace("/auth/forgot-password");
      return;
    }

    try {
      await verifyOTPAndResetPassword(params.email, params.otp, password);

      Toast.show({
        type: "success",
        text1: "Password reset!",
        text2: "You can now sign in with your new password",
      });

      router.replace("/auth/signin");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Reset failed",
        text2:
          error instanceof Error
            ? error.message
            : "Failed to reset password. Please try again.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => router.back()}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
              >
                <Ionicons name="arrow-back" size={20} color="black" />
              </Pressable>
              <Text className="text-black text-lg font-semibold">
                Create New Password
              </Text>
            </View>
          </View>

          {/* Scrollable Form */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-6 pt-6 justify-between">
              <View className="flex-1">
                {/* Welcome Text */}
                <View className="mb-6">
                  <Text className="text-black text-2xl font-bold mb-2">
                    Create New Password
                  </Text>
                  <Text className="text-gray-600 text-sm leading-5">
                    Enter your new password twice to confirm. Minimum 8
                    characters.
                  </Text>
                </View>

                {/* Form Card */}
                <View className="bg-white rounded-lg border border-gray-200 p-4">
                  <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                      New Password
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        className="flex-1 px-4 py-3 text-sm text-black"
                        placeholderTextColor="#9CA3AF"
                        style={{ textAlign: "left" }}
                      />
                      <Pressable
                        onPress={() => setShowPassword((s) => !s)}
                        className="px-3"
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={18}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View>
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                      Confirm Password
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                      <TextInput
                        value={confirm}
                        onChangeText={setConfirm}
                        placeholder="••••••••"
                        secureTextEntry={!showConfirm}
                        autoCapitalize="none"
                        className="flex-1 px-4 py-3 text-sm text-black"
                        placeholderTextColor="#9CA3AF"
                        style={{ textAlign: "left" }}
                      />
                      <Pressable
                        onPress={() => setShowConfirm((s) => !s)}
                        className="px-3"
                      >
                        <Ionicons
                          name={showConfirm ? "eye-off" : "eye"}
                          size={18}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {password.length > 0 && (
                    <View className="gap-2 mt-3">
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name={minLength ? "checkmark-circle" : "close-circle"}
                          size={14}
                          color={minLength ? "#10B981" : "#EF4444"}
                        />
                        <Text
                          className={`text-xs ${minLength ? "text-green-600" : "text-red-500"}`}
                        >
                          At least 8 characters
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name={hasNumber ? "checkmark-circle" : "close-circle"}
                          size={14}
                          color={hasNumber ? "#10B981" : "#EF4444"}
                        />
                        <Text
                          className={`text-xs ${hasNumber ? "text-green-600" : "text-red-500"}`}
                        >
                          Contains at least 1 number
                        </Text>
                      </View>
                      {confirm.length > 0 && (
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name={
                              passwordsMatch
                                ? "checkmark-circle"
                                : "close-circle"
                            }
                            size={14}
                            color={passwordsMatch ? "#10B981" : "#EF4444"}
                          />
                          <Text
                            className={`text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                          >
                            Passwords match
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>

              <View className="pb-6 pt-4">
                <Pressable
                  onPress={handleReset}
                  className={`${valid && !isLoading ? "bg-black" : "bg-gray-400"} rounded-lg py-3 items-center flex-row justify-center`}
                  disabled={!valid || isLoading}
                >
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-sm font-semibold">
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
