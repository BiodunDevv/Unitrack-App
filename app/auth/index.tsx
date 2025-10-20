import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const router = useRouter();

  // Static English text
  const welcomeTitle = "WELCOME TO UNITRACK";
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
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <View className="flex-1">
        {/* Top Bar (language removed) */}
        <View className="px-6 pt-4 pb-2" />

        {/* Black Background Section with Logo */}
        <View
          className="items-center justify-center px-6"
          style={{ minHeight: 300 }}
        >
          <View className="w-36 h-36 items-center justify-center mb-4">
            <Image
              source={require("../../assets/images/logoWhite.png")}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>
          <Text className="text-white text-2xl font-bold mb-2 text-center">
            {welcomeTitle}
          </Text>
          <Text className="text-white/80 text-sm leading-5 text-center">
            {welcomeSubtitle}
          </Text>
        </View>

        {/* UNITRACK Text Above White Card */}
        <View
          className="items-center shadow-lg mb-4"
          style={{ marginBottom: -18, zIndex: 10 }}
        >
          <View className="bg-black px-8 py-2 rounded-full">
            <Text className="text-white text-xl font-bold tracking-wider">
              UNITRACK
            </Text>
          </View>
        </View>

        {/* White Bottom Card */}
        <View className="bg-white rounded-t-[40px] pt-10 pb-8 px-8 flex-1">
          <View className="flex-1 justify-between">
            {/* Info Banner - Students Don't Need Account */}
            <View className="bg-gray-50 rounded-2xl p-4 flex-row items-start border border-gray-200 mb-2">
              <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-3 mt-0.5">
                <Ionicons name="information" size={20} color="white" />
              </View>
              <Text className="flex-1 text-gray-700 text-xs font-medium leading-5">
                {infoText}
              </Text>
            </View>

            {/* Action Buttons */}
            <View>
              {/* Sign In Button - Primary */}
              <Pressable
                onPress={handleSignin}
                className="bg-black rounded-full py-4 mb-3 flex-row items-center justify-center shadow-sm"
              >
                <MaterialIcons
                  name="login"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-white text-base font-bold">
                  {signinText}
                </Text>
              </Pressable>

              {/* Create Account Button */}
              <Pressable
                onPress={handleSignup}
                className="bg-white rounded-full py-4 mb-3 flex-row items-center justify-center border-2 border-gray-300"
              >
                <Ionicons
                  name="person-add"
                  size={20}
                  color="#000"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-gray-900 text-base font-bold">
                  {signupText}
                </Text>
              </Pressable>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="px-4 text-gray-500 text-xs font-medium uppercase">
                  OR
                </Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Quick Attendance Button - Accent */}
              <Pressable
                onPress={handleQuickAttendance}
                className="bg-black rounded-full py-4 mb-4 flex-row items-center justify-center shadow-sm"
              >
                <Ionicons
                  name="flash"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-white text-center text-base font-bold">
                  {quickAttendanceBtnText}
                </Text>
              </Pressable>

              {/* Terms and Privacy */}
              <View className="items-center px-2 mt-2">
                <Text className="text-gray-500 text-xs text-center leading-5">
                  {termsText}{" "}
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
      </View>
    </SafeAreaView>
  );
}
