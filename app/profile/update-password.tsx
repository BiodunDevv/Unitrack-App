import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useProfileStore } from "../../store/useProfileStore";

export default function UpdatePassword() {
  const router = useRouter();
  const { error, updateSuccess, updateProfile, clearError, clearSuccess } =
    useProfileStore();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateSuccess) {
      Toast.show({
        type: "success",
        text1: "Password updated successfully!",
        text2: "Your password has been changed",
      });
      clearSuccess();
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  }, [updateSuccess, clearSuccess, router]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: error,
      });
      clearError();
    }
  }, [error, clearError]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword) {
      Toast.show({
        type: "error",
        text1: "Current password required",
        text2: "Please enter your current password",
      });
      return;
    }

    if (!passwordForm.newPassword) {
      Toast.show({
        type: "error",
        text1: "New password required",
        text2: "Please enter a new password",
      });
      return;
    }

    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      Toast.show({
        type: "error",
        text1: "Invalid password",
        text2: passwordError,
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords don't match",
        text2: "New password and confirmation must match",
      });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      Toast.show({
        type: "error",
        text1: "Same password",
        text2: "New password must be different from current password",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
    } catch {
      // Error handled by useEffect
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (
    password: string
  ): {
    strength: string;
    color: string;
    progress: number;
  } => {
    if (!password) return { strength: "None", color: "#D1D5DB", progress: 0 };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2)
      return { strength: "Weak", color: "#EF4444", progress: 0.33 };
    if (score <= 4)
      return { strength: "Medium", color: "#F59E0B", progress: 0.66 };
    return { strength: "Strong", color: "#10B981", progress: 1 };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const passwordChecks = [
    {
      label: "At least 8 characters",
      met: passwordForm.newPassword.length >= 8,
    },
    {
      label: "One uppercase letter",
      met: /[A-Z]/.test(passwordForm.newPassword),
    },
    {
      label: "One special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="px-6 pt-4 pb-6 border-b border-gray-100">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-4 active:bg-gray-200"
              >
                <Ionicons name="arrow-back" size={22} color="#000000" />
              </Pressable>
              <Text className="text-black text-3xl font-bold mb-2">
                Update Password
              </Text>
              <Text className="text-gray-600 text-base">
                Change your account password
              </Text>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-1 px-6 pt-6 pb-6">
                {/* Current Password */}
                <View className="mb-5">
                  <Text className="text-black text-base font-bold mb-3">
                    Current Password
                  </Text>
                  <View className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 flex-row items-center">
                    <Ionicons name="lock-closed" size={20} color="#000000" />
                    <TextInput
                      value={passwordForm.currentPassword}
                      onChangeText={(text) =>
                        setPasswordForm({ ...passwordForm, currentPassword: text })
                      }
                      placeholder="Enter current password"
                      className="flex-1 ml-3 text-base text-black font-medium"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPasswords.current}
                      editable={!isUpdating}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Pressable
                      onPress={() => togglePasswordVisibility("current")}
                      className="p-2"
                    >
                      <Ionicons
                        name={showPasswords.current ? "eye-off" : "eye"}
                        size={20}
                        color="#6B7280"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* New Password */}
                <View className="mb-5">
                  <Text className="text-black text-base font-bold mb-3">
                    New Password
                  </Text>
                  <View className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 flex-row items-center">
                    <Ionicons name="key" size={20} color="#000000" />
                    <TextInput
                      value={passwordForm.newPassword}
                      onChangeText={(text) =>
                        setPasswordForm({ ...passwordForm, newPassword: text })
                      }
                      placeholder="Enter new password"
                      className="flex-1 ml-3 text-base text-black font-medium"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPasswords.new}
                      editable={!isUpdating}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Pressable
                      onPress={() => togglePasswordVisibility("new")}
                      className="p-2"
                    >
                      <Ionicons
                        name={showPasswords.new ? "eye-off" : "eye"}
                        size={20}
                        color="#6B7280"
                      />
                    </Pressable>
                  </View>

                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword.length > 0 && (
                    <View className="mt-3">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-600 text-sm font-medium">
                          Password Strength
                        </Text>
                        <Text
                          className="text-sm font-bold"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.strength}
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${passwordStrength.progress * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View className="mb-6">
                  <Text className="text-black text-base font-bold mb-3">
                    Confirm New Password
                  </Text>
                  <View className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#000000" />
                    <TextInput
                      value={passwordForm.confirmPassword}
                      onChangeText={(text) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: text })
                      }
                      placeholder="Confirm new password"
                      className="flex-1 ml-3 text-base text-black font-medium"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPasswords.confirm}
                      editable={!isUpdating}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Pressable
                      onPress={() => togglePasswordVisibility("confirm")}
                      className="p-2"
                    >
                      <Ionicons
                        name={showPasswords.confirm ? "eye-off" : "eye"}
                        size={20}
                        color="#6B7280"
                      />
                    </Pressable>
                  </View>
                  {passwordForm.confirmPassword.length > 0 &&
                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <Text className="text-red-600 text-sm mt-2 font-medium">
                        Passwords do not match
                      </Text>
                    )}
                </View>

                {/* Password Requirements */}
                <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
                  <View className="flex-row items-start mb-3">
                    <View className="w-10 h-10 rounded-xl bg-black items-center justify-center mr-3">
                      <Ionicons name="shield-checkmark" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black text-sm font-bold mb-1">
                        Password Requirements
                      </Text>
                      <Text className="text-gray-600 text-xs">
                        Your password must meet the following criteria
                      </Text>
                    </View>
                  </View>
                  <View className="space-y-2">
                    {passwordChecks.map((check, index) => (
                      <View key={index} className="flex-row items-center py-1">
                        <View
                          className={`w-5 h-5 rounded-full items-center justify-center mr-3 ${
                            check.met ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <Ionicons
                            name={check.met ? "checkmark" : "close"}
                            size={12}
                            color="white"
                          />
                        </View>
                        <Text
                          className={`text-sm ${
                            check.met
                              ? "text-green-700 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {check.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Spacer */}
                <View className="flex-1" />

                {/* Action Buttons */}
                <View className="pt-6 pb-4">
                  {/* Update Button */}
                  <Pressable
                    onPress={handleUpdatePassword}
                    disabled={
                      isUpdating ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                    className={`${
                      isUpdating ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                        ? "bg-gray-300"
                        : "bg-black"
                    } rounded-2xl py-4 items-center mb-3 flex-row justify-center`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Ionicons
                      name="shield-checkmark"
                      size={22}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white text-base font-bold">
                      {isUpdating ? "Updating..." : "Update Password"}
                    </Text>
                  </Pressable>

                  {/* Cancel Button */}
                  <Pressable
                    onPress={() => router.back()}
                    disabled={isUpdating}
                    className="bg-gray-100 rounded-2xl py-4 items-center active:bg-gray-200"
                  >
                    <Text className="text-black text-base font-semibold">
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
