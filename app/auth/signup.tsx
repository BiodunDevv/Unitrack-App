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

export default function SignupScreen() {
  const router = useRouter();
  const { registerTeacher, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signupTitle = "CREATE YOUR UNITRACK ID";
  const signupSubtitle =
    "Get attendance updates, class schedules and more info on your favorite courses";
  const firstNameLabel = "First Name";
  const lastNameLabel = "Last Name";
  const emailLabel = "Email";
  const passwordLabel = "Password";
  const passwordHint =
    "Password must be at least 8 character long and include 1 capital letter and 1 symbol";
  const agreeText = "I agree to the";
  const termsText = "Terms";
  const andText = "and";
  const privacyText = "Privacy Policy";
  const createAccountButton = "CREATE ACCOUNT";
  const haveAccountText = "Already have an account?";
  const signinText = "Sign In";

  const handleSignup = async () => {
    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please fill in all fields",
      });
      return;
    }

    if (!agreeToTerms) {
      Toast.show({
        type: "error",
        text1: "Terms required",
        text2: "Please agree to the terms and privacy policy",
      });
      return;
    }

    // Basic password validation
    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Weak password",
        text2: "Password must be at least 8 characters",
      });
      return;
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await registerTeacher({
        name: fullName,
        email,
        password,
        role: "teacher",
      });

      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: "Please verify your email",
      });

      // Navigate to verify page with registration type
      router.push({
        pathname: "/auth/verify",
        params: { type: "registration" },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2:
          error instanceof Error
            ? error.message
            : "Failed to create account. Please try again.",
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
          {/* Background Join Text - Bottom Right */}
          <View className="absolute bottom-2 right-6">
            <Text className="text-gray-400 text-7xl font-black tracking-wider opacity-20">
              JOIN
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
              {signupTitle}
            </Text>
            <Text className="text-white/80 text-sm leading-5">
              {signupSubtitle}
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
                <View className="flex gap-3">
                  {/* First Name */}
                  <View>
                    <Text className="text-gray-700 text-sm font-medium mb-2 px-1">
                      {firstNameLabel}
                    </Text>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="John"
                      className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Last Name */}
                  <View>
                    <Text className="text-gray-700 text-sm font-medium mb-2 px-1">
                      {lastNameLabel}
                    </Text>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Doe"
                      className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

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

                {/* Password Hint */}
                <Text className="text-gray-500 text-xs mt-2 px-1 leading-4">
                  {passwordHint}
                </Text>

                {/* Terms Agreement */}
                <View className="flex-row items-start mt-4">
                  <Pressable
                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                    className="mr-3 mt-0.5"
                  >
                    <View
                      className={`w-5 h-5 border-2 ${agreeToTerms ? "bg-black border-black" : "border-gray-400"} rounded-sm items-center justify-center`}
                    >
                      {agreeToTerms && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                  </Pressable>
                  <View className="flex-1">
                    <Text className="text-gray-700 text-xs leading-4">
                      {agreeText}{" "}
                      <Text className="text-black underline font-medium">
                        {termsText}
                      </Text>{" "}
                      {andText}{" "}
                      <Text className="text-black underline font-medium">
                        {privacyText}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom Section */}
              <View className="pb-6 pt-4">
                {/* Create Account Button */}
                <Pressable
                  onPress={handleSignup}
                  disabled={!agreeToTerms || isLoading}
                  className={`${agreeToTerms && !isLoading ? "bg-black" : "bg-gray-400"} rounded-full py-4 items-center mb-4 flex-row justify-center`}
                >
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-base font-bold tracking-wide">
                    {isLoading ? "Creating account..." : createAccountButton}
                  </Text>
                </Pressable>

                {/* Have Account Section */}
                <View className="flex-row items-center justify-center">
                  <Text className="text-gray-600 text-sm">
                    {haveAccountText}{" "}
                  </Text>
                  <Pressable onPress={() => router.push("/auth/signin")}>
                    <Text className="text-black text-sm font-bold underline">
                      {signinText}
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
