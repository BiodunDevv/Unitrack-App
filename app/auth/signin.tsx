import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslatedTexts } from "../../hooks/useTranslation";

export default function SigninScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [
    signinTitle,
    signinSubtitle,
    emailLabel,
    passwordLabel,
    forgotPasswordText,
    signinButton,
    noAccountText,
    signupText,
  ] = useTranslatedTexts([
    "WELCOME BACK TO UNITRACK",
    "Sign in to track your attendance and view your academic progress",
    "Email",
    "Password",
    "Forgot Password?",
    "SIGN IN",
    "Don't have an account?",
    "Sign Up",
  ]);

  const handleSignin = () => {
    // Handle signin logic
    console.log("Signin:", { email, password });
    router.replace("/(tabs)");
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 bg-white">
        {/* Black Header - Bigger */}
        <View className="bg-black pb-12 px-6 relative h-[30%]">
          {/* Background Sign Text - Bottom Right */}
          <View className="absolute bottom-4 right-6">
            <Text className="text-gray-400 text-8xl font-black tracking-wider opacity-20">
              SIGN
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
              {signinTitle}
            </Text>
            <Text className="text-white/80 text-base leading-6">
              {signinSubtitle}
            </Text>
          </View>
        </View>

        {/* Form Section - Flex to fill remaining space */}
        <View className="flex-1 px-6 pt-8 justify-between">
          <View className="flex-1">
            {/* Form Fields */}
            <View className="flex gap-6">
              {/* Email */}
              <View>
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

              {/* Password */}
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2 px-1">
                  {passwordLabel}
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  className="bg-gray-50 rounded-lg px-4 py-4 text-base border border-gray-200"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Forgot Password */}
            <View className="items-end mt-4">
              <Pressable onPress={handleForgotPassword}>
                <Text className="text-black text-sm font-medium underline">
                  {forgotPasswordText}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom Section */}
          <View className="pb-8">
            {/* Sign In Button */}
            <Pressable
              onPress={handleSignin}
              className="bg-black rounded-full py-4 items-center mb-6"
            >
              <Text className="text-white text-base font-bold tracking-wide">
                {signinButton}
              </Text>
            </Pressable>

            {/* No Account Section */}
            <View className="flex-row items-center justify-center">
              <Text className="text-gray-600 text-sm">{noAccountText} </Text>
              <Pressable onPress={() => router.push("/auth/signup")}>
                <Text className="text-black text-sm font-bold underline">
                  {signupText}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
