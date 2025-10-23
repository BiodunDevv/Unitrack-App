import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
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
            <Text className="text-black text-lg font-semibold">
              Verify Code
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-6 justify-between">
          <View>
            {/* Welcome Text */}
            <View className="mb-6">
              <Text className="text-black text-2xl font-bold mb-2">
                Enter Verification Code
              </Text>
              <Text className="text-gray-600 text-sm leading-5">
                We sent a 6-digit code to your email. Enter it below to
                continue.
              </Text>
            </View>

            {/* Code Input */}
            <View className="bg-white rounded-lg border border-gray-200 p-4">
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
                    className="w-11 h-12 text-center text-base bg-gray-50 rounded-lg border border-gray-200 text-black font-semibold"
                    placeholder="-"
                    placeholderTextColor="#9CA3AF"
                  />
                ))}
              </View>
            </View>
          </View>

          <View className="pb-6 pt-4">
            <Pressable
              onPress={handleVerify}
              disabled={isLoading}
              className={`rounded-lg py-3 items-center mb-3 flex-row justify-center ${
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
                {isLoading ? "Verifying..." : "Verify Code"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleResend}
              disabled={countdown > 0}
              className="items-center"
            >
              <Text
                className={`text-sm font-semibold ${
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
