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

export default function SigninScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const signinTitle = "WELCOME BACK TO UNITRACK";
  const signinSubtitle =
    "Sign in to track your attendance and view your academic progress";
  const emailLabel = "Email";
  const passwordLabel = "Password";
  const forgotPasswordText = "Forgot Password?";
  const signinButton = "SIGN IN";
  const noAccountText = "Don't have an account?";
  const signupText = "Sign Up";

  const handleSignin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please enter both email and password",
      });
      return;
    }

    try {
      await login(email, password);
      Toast.show({
        type: "success",
        text1: "Welcome back!",
        text2: "Login successful",
      });
      router.replace("/current-user");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2:
          error instanceof Error ? error.message : "Invalid email or password",
      });
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white">
        {/* Black Header */}
        <View
          className="bg-black px-6 pt-4 pb-8 relative"
          style={{ minHeight: 200 }}
        >
          {/* Decorative LOGIN - Bottom Right */}
          <View className="absolute bottom-2 right-6">
            <Text className="text-gray-400 text-7xl font-black tracking-wider opacity-20">
              LOGIN
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
              {signinTitle}
            </Text>
            <Text className="text-white/80 text-sm leading-5">
              {signinSubtitle}
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
                {/* Form Fields */}
                <View className="flex gap-5">
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
                      className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Password */}
                  <View>
                    <Text className="text-gray-700 text-sm font-medium mb-2 px-1">
                      {passwordLabel}
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        className="flex-1 px-4 py-3 text-base"
                        placeholderTextColor="#9CA3AF"
                        style={{ textAlign: "left" }}
                      />
                      <Pressable
                        onPress={() => setShowPassword((s) => !s)}
                        className="px-3"
                        accessibilityLabel={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Forgot Password */}
                <View className="items-end mt-3">
                  <Pressable onPress={handleForgotPassword}>
                    <Text className="text-black text-sm font-medium underline">
                      {forgotPasswordText}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Bottom Section */}
              <View className="pb-6 pt-4">
                {/* Sign In Button */}
                <Pressable
                  onPress={handleSignin}
                  disabled={isLoading}
                  className={`rounded-full py-4 items-center mb-4 flex-row justify-center ${
                    isLoading ? "bg-gray-400" : "bg-black"
                  }`}
                >
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-base font-bold tracking-wide">
                    {isLoading ? "Signing in..." : signinButton}
                  </Text>
                </Pressable>

                {/* No Account Section */}
                <View className="flex-row items-center justify-center">
                  <Text className="text-gray-600 text-sm">
                    {noAccountText}{" "}
                  </Text>
                  <Pressable onPress={() => router.push("/auth/signup")}>
                    <Text className="text-black text-sm font-bold underline">
                      {signupText}
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
