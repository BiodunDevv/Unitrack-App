import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const router = useRouter();

  // Static English text
  const welcomeSubtitle = "Smart Attendance Management System for Universities";
  const signupText = "Create Account";
  const signinText = "Sign In";
  const termsText = "By continuing, you agree to our";
  const userAgreementText = "User Agreement";
  const andText = "and";
  const privacyPolicyText = "Privacy Policy";
  const infoText =
    "Students can submit attendance without creating an account. Just tap and go!";
  const quickAttendanceBtnText = "Quick Attendance";

  useEffect(() => {
    // On mount, check if quick attendance flag is set
    AsyncStorage.getItem("@unitrack_quick_attendance").then((flag) => {
      if (flag === "true") {
        router.replace("/Submit/SubmitAttendance");
      }
    });
  }, [router]);

  const handleSignup = () => {
    router.push("/auth/signup");
  };

  const handleSignin = () => {
    router.push("/auth/signin");
  };

  const handleQuickAttendance = async () => {
    await AsyncStorage.setItem("@unitrack_quick_attendance", "true");
    router.replace("/Submit/SubmitAttendance");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Logo Section */}
        <View className="items-center justify-center px-6 pt-12 pb-8">
          <View className="w-24 h-24 items-center justify-center mb-6">
            <Image
              source={require("../../assets/images/logoDark.png")}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>
          <Text className="text-black text-3xl font-bold mb-2 text-center">
            UNITRACK
          </Text>
          <Text className="text-gray-600 text-sm leading-5 text-center px-4">
            {welcomeSubtitle}
          </Text>
        </View>

        {/* Main Content Card */}
        <View className="flex-1 px-6">
          <View className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Info Banner - Students Don't Need Account */}
            <View className="bg-blue-50 rounded-lg p-4 flex-row items-start border border-blue-200 mb-6">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="information" size={18} color="#2563EB" />
              </View>
              <Text className="flex-1 text-blue-800 text-xs leading-5">
                {infoText}
              </Text>
            </View>

            {/* Action Buttons */}
            <View>
              {/* Sign In Button - Primary */}
              <Pressable
                onPress={handleSignin}
                className="bg-black rounded-lg py-3 mb-3 flex-row items-center justify-center"
              >
                <MaterialIcons
                  name="login"
                  size={18}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-sm font-semibold">
                  {signinText}
                </Text>
              </Pressable>

              {/* Create Account Button */}
              <Pressable
                onPress={handleSignup}
                className="bg-white rounded-lg py-3 mb-3 flex-row items-center justify-center border border-gray-300"
              >
                <Ionicons
                  name="person-add"
                  size={18}
                  color="#000"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-gray-900 text-sm font-semibold">
                  {signupText}
                </Text>
              </Pressable>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="px-3 text-gray-500 text-xs font-medium">
                  OR
                </Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              {/* Quick Attendance Button */}
              <Pressable
                onPress={handleQuickAttendance}
                className="bg-gray-100 rounded-lg py-3 flex-row items-center justify-center border border-gray-200"
              >
                <Ionicons
                  name="flash"
                  size={18}
                  color="#000"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-black text-center text-sm font-semibold">
                  {quickAttendanceBtnText}
                </Text>
              </Pressable>

              {/* Terms and Privacy */}
              <View className="items-center px-2 mt-6">
                <Text className="text-gray-500 text-xs text-center leading-5">
                  {termsText}{" "}
                  <Text className="text-gray-900 font-semibold">
                    {userAgreementText}
                  </Text>{" "}
                  {andText}{" "}
                  <Text className="text-gray-900 font-semibold">
                    {privacyPolicyText}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </View>
    </SafeAreaView>
  );
}
