import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslatedTexts } from "../../hooks/useTranslation";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [
    forgotTitle,
    forgotSubtitle,
    emailLabel,
    resetButton,
    backToSigninText,
  ] = useTranslatedTexts([
    "RESET YOUR PASSWORD",
    "Enter your email address and we'll send you a link to reset your password",
    "Email",
    "SEND RESET LINK",
    "Back to Sign In",
  ]);

  const handleResetPassword = () => {
    // Handle password reset logic
    console.log("Reset password for:", email);
    // Show success message or navigate
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 bg-white">
        {/* Black Header - Bigger */}
        <View className="bg-black pb-12 px-6 relative h-[30%]">
          {/* Background Reset Text - Bottom Right */}
          <View className="absolute bottom-4 right-6">
            <Text className="text-gray-400 text-8xl font-black tracking-wider opacity-20">
              RESET
            </Text>
          </View>

          <View className="flex-row items-center mb-8 z-10">
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

          <View className="z-10">
            <Text className="text-white text-3xl font-bold mb-3">
              {forgotTitle}
            </Text>
            <Text className="text-white/80 text-base leading-6">
              {forgotSubtitle}
            </Text>
          </View>
        </View>

        {/* Form Section - Flex to fill remaining space */}
        <View className="flex-1 px-6 pt-8 justify-between">
          <View className="flex-1">
            {/* Email Field */}
            <View className="mt-4">
              <Text className="text-gray-700 text-sm font-medium mb-2 px-1">
                {emailLabel}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 rounded-lg px-4 py-4 text-base border border-gray-200"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Helper Text */}
            <Text className="text-gray-500 text-sm mt-3 px-1">
              We'll send you instructions to reset your password
            </Text>
          </View>

          {/* Bottom Section */}
          <View className="pb-8">
            {/* Reset Button */}
            <Pressable
              onPress={handleResetPassword}
              disabled={!email.trim()}
              className={`${email.trim() ? "bg-black" : "bg-gray-400"} rounded-full py-4 items-center mb-6`}
            >
              <Text className="text-white text-base font-bold tracking-wide">
                {resetButton}
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
      </View>
    </SafeAreaView>
  );
}
