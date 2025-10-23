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
              <Text className="text-black text-lg font-semibold">Sign In</Text>
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
                    {signinTitle}
                  </Text>
                  <Text className="text-gray-600 text-sm leading-5">
                    {signinSubtitle}
                  </Text>
                </View>

                {/* Form Fields */}
                <View className="bg-white rounded-lg border border-gray-200 p-4">
                  {/* Email */}
                  <View className="mb-4">
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
                    />
                  </View>

                  {/* Password */}
                  <View>
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                      {passwordLabel}
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
                        accessibilityLabel={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={18}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Forgot Password */}
                  <View className="items-end mt-3">
                    <Pressable onPress={handleForgotPassword}>
                      <Text className="text-black text-sm font-semibold">
                        {forgotPasswordText}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Bottom Section */}
              <View className="pb-6 pt-4">
                {/* Sign In Button */}
                <Pressable
                  onPress={handleSignin}
                  disabled={isLoading}
                  className={`rounded-lg py-3 items-center mb-4 flex-row justify-center ${
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
                  <Text className="text-white text-sm font-semibold">
                    {isLoading ? "Signing in..." : signinButton}
                  </Text>
                </Pressable>

                {/* No Account Section */}
                <View className="flex-row items-center justify-center">
                  <Text className="text-gray-600 text-sm">
                    {noAccountText}{" "}
                  </Text>
                  <Pressable onPress={() => router.push("/auth/signup")}>
                    <Text className="text-black text-sm font-semibold">
                      {signupText}
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
