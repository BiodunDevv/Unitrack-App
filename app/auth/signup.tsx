import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslatedTexts } from "../../hooks/useTranslation";

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [
    signupTitle,
    signupSubtitle,
    firstNameLabel,
    lastNameLabel,
    emailLabel,
    passwordLabel,
    passwordHint,
    agreeText,
    termsText,
    andText,
    privacyText,
    createAccountButton,
    haveAccountText,
    signinText,
  ] = useTranslatedTexts([
    "CREATE YOUR UNITRACK ID",
    "Get attendance updates, class schedules and more info on your favorite courses",
    "First Name",
    "Last Name",
    "Email",
    "Password",
    "Password must be at least 8 character long and include 1 capital letter and 1 symbol",
    "I agree to the",
    "Terms",
    "and",
    "Privacy Policy",
    "CREATE ACCOUNT",
    "Already have an account?",
    "Sign In",
  ]);

  const handleSignup = () => {
    // Handle signup logic
    console.log("Signup:", { firstName, lastName, email, password });
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 bg-white">
        {/* Black Header - Bigger */}
        <View className="bg-black pb-12 px-6 relative h-[30%]">
          {/* Background Join Text - Bottom Right */}
          <View className="absolute bottom-4 right-6">
            <Text className="text-gray-400 text-8xl font-black tracking-wider opacity-20">
              JOIN
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
              {signupTitle}
            </Text>
            <Text className="text-white/80 text-base leading-6">
              {signupSubtitle}
            </Text>
          </View>
        </View>

        {/* Form Section - Flex to fill remaining space */}
        <View className="flex-1 px-6 pt-8 justify-between">
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
                  className="bg-gray-50 rounded-lg px-4 py-4 text-base border border-gray-200"
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
                  className="bg-gray-50 rounded-lg px-4 py-4 text-base border border-gray-200"
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

            {/* Password Hint */}
            <Text className="text-gray-500 text-xs mt-3 px-1">
              {passwordHint}
            </Text>

            {/* Terms Agreement */}
            <View className="flex-row items-start mt-6">
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
                <Text className="text-gray-700 text-sm leading-5">
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
          <View className="pb-8">
            {/* Create Account Button */}
            <Pressable
              onPress={handleSignup}
              disabled={!agreeToTerms}
              className={`${agreeToTerms ? "bg-black" : "bg-gray-400"} rounded-full py-4 items-center mb-6`}
            >
              <Text className="text-white text-base font-bold tracking-wide">
                {createAccountButton}
              </Text>
            </Pressable>

            {/* Have Account Section */}
            <View className="flex-row items-center justify-center">
              <Text className="text-gray-600 text-sm">{haveAccountText} </Text>
              <Pressable onPress={() => router.push("/auth/signin")}>
                <Text className="text-black text-sm font-bold underline">
                  {signinText}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
