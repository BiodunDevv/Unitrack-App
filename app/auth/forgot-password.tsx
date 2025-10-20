import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
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
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white">
        {/* Black Header */}
        <View
          className="bg-black px-6 pt-4 pb-8 relative"
          style={{ minHeight: 200 }}
        >
          {/* Background Reset Text - Bottom Right */}
          <View className="absolute bottom-2 right-6">
            <Text className="text-gray-400 text-6xl font-black tracking-wider opacity-20">
              RESET
            </Text>
          </View>

          <View className="flex-row items-center mb-6 z-10 pt-2">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <View className="flex-row items-center">
              <Image
                source={require("../../assets/images/logoWhite.png")}
                className="w-8 h-8 mr-2"
                resizeMode="contain"
              />
              <Text className="text-white text-lg font-bold">UNITRACK</Text>
            </View>
          </View>

          <View className="z-10 pr-8">
            <Text className="text-white text-2xl font-bold mb-2">
              {forgotTitle}
            </Text>
            <Text className="text-white/80 text-sm leading-5">
              {forgotSubtitle}
            </Text>
          </View>
        </View>

        {/* Scrollable Form Section */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-6 pt-6 justify-between">
              <View className="flex-1">
                {/* Email Field */}
                <View className="mt-2">
                  <Text className="text-gray-700 text-sm font-medium mb-2 px-1">
                    {emailLabel}
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="john@university.edu"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
                    placeholderTextColor="#9CA3AF"
                    style={{ textAlign: "left" }}
                  />
                </View>

                {/* Helper Text */}
                <Text className="text-gray-500 text-xs mt-2 px-1 leading-4">
                  We&apos;ll send you instructions to reset your password
                </Text>
              </View>

              {/* Bottom Section */}
              <View className="pb-6 pt-4">
                {/* Reset Button */}
                <Pressable
                  onPress={handleResetPassword}
                  disabled={!email.trim() || isLoading}
                  className={`${email.trim() && !isLoading ? "bg-black" : "bg-gray-400"} rounded-full py-4 items-center mb-4 flex-row justify-center`}
                >
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-base font-bold tracking-wide">
                    {isLoading ? "Sending..." : resetButton}
                  </Text>
                </Pressable>

                {/* Back to Sign In */}
                <View className="flex-row items-center justify-center">
                  <Pressable onPress={() => router.back()}>
                    <Text className="text-black text-sm font-bold underline">
                      {backToSigninText}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
