import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import TranslationToast from "../components/TranslationToast";
import useTranslationStore from "../store/useTranslationStore";
import "./../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize = useTranslationStore((state) => state.initialize);

  // Initialize translation store on app start
  useEffect(() => {
    initialize();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
      <TranslationToast />
    </ThemeProvider>
  );
}
