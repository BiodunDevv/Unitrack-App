import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";
import "./../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Initialize stores on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/verify" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="current-user" options={{ gestureEnabled: false }} />
        <Stack.Screen name="Submit/SubmitAttendance" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
      <Toast topOffset={60} />
    </ThemeProvider>
  );
}
