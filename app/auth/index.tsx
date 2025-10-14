import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LanguageSelector from "../../components/LanguageSelector";
import { useTranslatedTexts } from "../../hooks/useTranslation";

export default function AuthScreen() {
  const router = useRouter();

  // Translate all text
  const [
    welcomeTitle,
    welcomeSubtitle,
    signupText,
    signinText,
    quickAttendanceText,
    quickAttendanceSubtext,
    termsText,
    userAgreementText,
    andText,
    privacyPolicyText,
    infoText,
  ] = useTranslatedTexts([
    "WELCOME TO UNITRACK",
    "Smart Attendance Management System for Universities",
    "Create Account",
    "Sign In",
    "Quick Attendance",
    "No account needed • Quick check-in",
    "By continuing, you agree to our",
    "User Agreement",
    "and",
    "Privacy Policy",
    "Students can submit attendance without creating an account. Just tap and go!",
  ]);

  const handleSignup = () => {
    router.push("/auth/signup");
  };

  const handleSignin = () => {
    router.push("/auth/signin");
  };

  const handleQuickAttendance = () => {
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 bg-white">
        {/* Language Selector - Top Right */}
        <View className="absolute top-4 right-6 z-20">
          <LanguageSelector />
        </View>

        {/* Black Header - Bigger */}
        <View className="bg-black pb-12 px-6 relative h-[40%]">
          {/* Background Welcome Text - Bottom Right */}
          <View className="absolute bottom-4 right-6">
            <Text className="text-gray-400 text-8xl font-black -tracking-normal opacity-20">
              UNI
            </Text>
          </View>

          <View className="flex-row items-center mb-8 z-10 mt-8">
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
              {welcomeTitle}
            </Text>
            <Text className="text-white/80 text-base leading-6">
              {welcomeSubtitle}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="flex-1 px-6 pt-8 justify-between">
          <View className="flex-1">
            {/* Info Banner - Students Don't Need Account */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-8 flex-row items-center border border-gray-200">
              <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-3">
                <Ionicons name="information" size={20} color="white" />
              </View>
              <Text className="flex-1 text-gray-800 text-sm font-medium leading-5">
                {infoText}
              </Text>
            </View>
          </View>

          {/* Bottom Section - Action Buttons */}
          <View className="pb-8">
            {/* Sign Up Button - Primary */}
            <Pressable
              onPress={handleSignup}
              className="bg-black rounded-full py-4 mb-4 flex-row items-center justify-center"
            >
              <Ionicons
                name="person-add"
                size={22}
                color="white"
                style={{ marginRight: 10 }}
              />
              <Text className="text-white text-center text-base font-bold">
                {signupText}
              </Text>
            </Pressable>

            {/* Sign In Button - Secondary */}
            <Pressable
              onPress={handleSignin}
              className="bg-white rounded-full py-4 mb-4 flex-row items-center justify-center border-2 border-gray-300"
            >
              <MaterialIcons
                name="login"
                size={22}
                color="#000"
                style={{ marginRight: 10 }}
              />
              <Text className="text-gray-900 text-base font-bold">
                {signinText}
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-4 text-gray-500 text-xs font-medium">OR</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Quick Attendance Button - Accent */}
            <Pressable
              onPress={handleQuickAttendance}
              className="bg-black rounded-full py-4 mb-4 flex-row items-center justify-center"
            >
              <Ionicons
                name="flash"
                size={22}
                color="white"
                style={{ marginRight: 10 }}
              />
              <View>
                <Text className="text-white text-center text-base font-bold">
                  {quickAttendanceText}
                </Text>
                <Text className="text-white/80 text-xs text-center mt-0.5">
                  {quickAttendanceSubtext}
                </Text>
              </View>
            </Pressable>

            {/* Terms and Privacy */}
            <View className="items-center px-4 mt-2">
              <Text className="text-gray-600 text-xs text-center leading-5">
                {termsText}
                {"\n"}
                <Text className="text-gray-800 font-semibold">
                  {userAgreementText}
                </Text>{" "}
                {andText}{" "}
                <Text className="text-gray-800 font-semibold">
                  {privacyPolicyText}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
