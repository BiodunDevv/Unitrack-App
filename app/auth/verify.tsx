import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type?: "registration" | "email" | "reset";
    email?: string;
  }>();
  const {
    verifyRegistration,
    requestVerificationCode,
    verifyEmail,
    registrationToken,
    verificationToken,
    isLoading,
  } = useAuthStore();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const inputs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    const value = text.replace(/\D/g, "").slice(-1);
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputs[index + 1].current?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (code[index] === "" && index > 0) {
      inputs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join("");
    if (otp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid code",
        text2: "Please enter all 6 digits",
      });
      return;
    }

    try {
      if (params.type === "registration") {
        if (!registrationToken) {
          Toast.show({
            type: "error",
            text1: "Invalid session",
            text2: "Please register again",
          });
          router.replace("/auth/signup");
          return;
        }

        await verifyRegistration(registrationToken, otp);

        Toast.show({
          type: "success",
          text1: "Account verified!",
          text2: "You can now sign in",
        });
        router.replace("/auth/signin");
      } else if (params.type === "email") {
        if (!verificationToken) {
          Toast.show({
            type: "error",
            text1: "Invalid session",
            text2: "Please request verification again",
          });
          router.replace("/auth/signin");
          return;
        }

        await verifyEmail(verificationToken, otp);

        Toast.show({
          type: "success",
          text1: "Email verified!",
          text2: "You can now sign in",
        });
        router.replace("/auth/signin");
      } else {
        // For password reset, navigate to reset-password page with the OTP and email
        router.push({
          pathname: "/auth/reset-password",
          params: { otp, email: params.email },
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2:
          error instanceof Error
            ? error.message
            : "Invalid or expired code. Please try again.",
      });
      setCode(["", "", "", "", "", ""]);
      inputs[0].current?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      if (params.type === "email" && params.email) {
        await requestVerificationCode(params.email);
        Toast.show({
          type: "success",
          text1: "Code sent!",
          text2: "Check your email for the new code",
        });
        setCountdown(60);
      } else {
        Toast.show({
          type: "info",
          text1: "Unable to resend",
          text2: "Please request a new code from the previous screen",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Resend failed",
        text2: error instanceof Error ? error.message : "Failed to resend code",
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
          {/* Background VERIFY - Bottom Right */}
          <View className="absolute bottom-2 right-6">
            <Text className="text-gray-400 text-6xl font-black tracking-wider opacity-20">
              VERIFY
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
              Enter Verification Code
            </Text>
            <Text className="text-white/80 text-sm leading-5">
              We sent a 6-digit code to your email. Enter it below to continue.
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-6 justify-between">
          <View>
            <View className="flex-row justify-between">
              {code.map((c, i) => (
                <TextInput
                  key={i}
                  ref={inputs[i]}
                  value={c}
                  onChangeText={(t) => handleChange(t, i)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace") handleBackspace(i);
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  className="w-12 h-14 text-center text-lg bg-gray-50 rounded-lg border border-gray-200"
                  placeholder="-"
                  placeholderTextColor="#9CA3AF"
                />
              ))}
            </View>
          </View>

          <View className="pb-6 pt-4">
            <Pressable
              onPress={handleVerify}
              disabled={isLoading}
              className={`rounded-full py-4 items-center mb-3 flex-row justify-center ${
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
                {isLoading ? "Verifying..." : "Verify Code"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleResend}
              disabled={countdown > 0}
              className="items-center"
            >
              <Text
                className={`text-sm font-medium underline ${
                  countdown > 0 ? "text-gray-400" : "text-black"
                }`}
              >
                {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
