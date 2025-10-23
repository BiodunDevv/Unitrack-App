import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordResetOTP, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");

  const forgotTitle = "RESET YOUR PASSWORD";
  const forgotSubtitle =
    "Enter your email address and we'll send you a verification code to reset your password";
  const emailLabel = "Email";
  const resetButton = "SEND RESET CODE";
  const backToSigninText = "Back to Sign In";

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Missing email",
        text2: "Please enter your email address",
      });
      return;
    }

    try {
      await requestPasswordResetOTP(email);

      Toast.show({
        type: "success",
        text1: "Code sent!",
        text2: "Check your email for the verification code",
      });

      // Navigate to verify page with reset type
      router.push({
        pathname: "/auth/verify",
        params: { type: "reset", email },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Request failed",
        text2:
          error instanceof Error
            ? error.message
            : "Failed to send reset code. Please try again.",
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
                Reset Password
              </Text>
            </View>
          </View>

          {/* Scrollable Form Section */}
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
                    {forgotTitle}
                  </Text>
                  <Text className="text-gray-600 text-sm leading-5">
                    {forgotSubtitle}
                  </Text>
                </View>

                {/* Form Card */}
                <View className="bg-white rounded-lg border border-gray-200 p-4">
                  {/* Email Field */}
                  <View>
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                      {emailLabel}
                    </Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="john@university.edu"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="bg-gray-50 rounded-lg px-4 py-3 text-sm border border-gray-200 text-black"
                      placeholderTextColor="#9CA3AF"
                      style={{ textAlign: "left" }}
                    />
                  </View>

                  {/* Helper Text */}
                  <Text className="text-gray-500 text-xs mt-2 leading-4">
                    We&apos;ll send you instructions to reset your password
                  </Text>
                </View>
              </View>

              {/* Bottom Section */}
              <View className="pb-6 pt-4">
                {/* Reset Button */}
                <Pressable
                  onPress={handleResetPassword}
                  disabled={!email.trim() || isLoading}
                  className={`${email.trim() && !isLoading ? "bg-black" : "bg-gray-400"} rounded-lg py-3 items-center mb-4 flex-row justify-center`}
                >
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-sm font-semibold">
                    {isLoading ? "Sending..." : resetButton}
                  </Text>
                </Pressable>

                {/* Back to Sign In */}
                <View className="flex-row items-center justify-center">
                  <Pressable onPress={() => router.back()}>
                    <Text className="text-black text-sm font-semibold">
                      {backToSigninText}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
