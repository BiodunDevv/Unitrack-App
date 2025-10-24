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
    <View className="flex-1">
      <SafeAreaView className="bg-white" edges={["top"]} />
      <StatusBar style="dark" />
      <View className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              {/* Header */}
              <View className="bg-white px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => router.back()}
                    className="mr-4 active:opacity-70"
                  >
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                  </Pressable>
                  <Text className="text-black text-xl font-bold">
                    Update Password
                  </Text>
                </View>
              </View>

              <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="flex-1 p-4 pb-6">
                  {/* Current Password */}
                  <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                    <Text className="text-gray-500 text-xs font-medium mb-3 uppercase">
                      Current Password
                    </Text>
                    <View className="bg-gray-50 rounded-lg px-4 py-3 flex-row items-center border border-gray-200">
                      <Ionicons name="lock-closed" size={18} color="#6B7280" />
                      <TextInput
                        value={passwordForm.currentPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: text,
                          })
                        }
                        placeholder="Enter current password"
                        className="flex-1 ml-3 text-base text-black"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPasswords.current}
                        editable={!isUpdating}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Pressable
                        onPress={() => togglePasswordVisibility("current")}
                        className="ml-2 active:opacity-70"
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
                  <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                    <Text className="text-gray-500 text-xs font-medium mb-3 uppercase">
                      New Password
                    </Text>
                    <View className="bg-gray-50 rounded-lg px-4 py-3 flex-row items-center border border-gray-200">
                      <Ionicons name="key" size={18} color="#6B7280" />
                      <TextInput
                        value={passwordForm.newPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: text,
                          })
                        }
                        placeholder="Enter new password"
                        className="flex-1 ml-3 text-base text-black"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPasswords.new}
                        editable={!isUpdating}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Pressable
                        onPress={() => togglePasswordVisibility("new")}
                        className="ml-2 active:opacity-70"
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
                          <Text className="text-gray-600 text-xs font-medium">
                            Password Strength
                          </Text>
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.strength}
                          </Text>
                        </View>
                        <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
                  <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                    <Text className="text-gray-500 text-xs font-medium mb-3 uppercase">
                      Confirm New Password
                    </Text>
                    <View className="bg-gray-50 rounded-lg px-4 py-3 flex-row items-center border border-gray-200">
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#6B7280"
                      />
                      <TextInput
                        value={passwordForm.confirmPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: text,
                          })
                        }
                        placeholder="Confirm new password"
                        className="flex-1 ml-3 text-base text-black"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPasswords.confirm}
                        editable={!isUpdating}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Pressable
                        onPress={() => togglePasswordVisibility("confirm")}
                        className="ml-2 active:opacity-70"
                      >
                        <Ionicons
                          name={showPasswords.confirm ? "eye-off" : "eye"}
                          size={20}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                    {passwordForm.confirmPassword.length > 0 &&
                      passwordForm.newPassword !==
                        passwordForm.confirmPassword && (
                        <Text className="text-red-600 text-xs mt-2">
                          Passwords do not match
                        </Text>
                      )}
                  </View>

                  {/* Password Requirements */}
                  <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                    <View className="flex-row items-center mb-3">
                      <Ionicons
                        name="shield-checkmark"
                        size={20}
                        color="#000000"
                      />
                      <Text className="text-black text-sm font-semibold ml-2">
                        Password Requirements
                      </Text>
                    </View>
                    <View>
                      {passwordChecks.map((check, index) => (
                        <View
                          key={index}
                          className="flex-row items-center py-1.5"
                        >
                          <View
                            className={`w-4 h-4 rounded-full items-center justify-center mr-3 ${
                              check.met ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <Ionicons
                              name={check.met ? "checkmark" : "close"}
                              size={10}
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
                  <View className="pt-6">
                    {/* Update Button */}
                    <Pressable
                      onPress={handleUpdatePassword}
                      disabled={
                        isUpdating ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword ||
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                      }
                      className={`${
                        isUpdating ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword ||
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                          ? "bg-gray-300"
                          : "bg-black active:bg-gray-800"
                      } rounded-lg py-3.5 items-center mb-2 flex-row justify-center`}
                    >
                      {isUpdating && (
                        <ActivityIndicator
                          size="small"
                          color="white"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text className="text-white text-base font-semibold">
                        {isUpdating ? "Updating..." : "Update Password"}
                      </Text>
                    </Pressable>

                    {/* Cancel Button */}
                    <Pressable
                      onPress={() => router.back()}
                      disabled={isUpdating}
                      className="bg-white rounded-lg py-3.5 items-center border border-gray-300 active:bg-gray-50"
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
      </View>
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </View>
  );
}
