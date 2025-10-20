import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Platform-specific safe area handling
  const tabBarHeight = Platform.OS === "ios" ? 90 : 65 + insets.bottom;

  // Static English labels
  const dashboardText = "Dashboard";
  const coursesText = "Courses";
  const sessionsText = "Sessions";
  const shareStudentsText = "Share Students";
  const profileText = "Profile";

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#1F2937",
          tabBarItemStyle: {
            borderRadius: 200,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingTop: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: dashboardText,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Courses"
          options={{
            title: coursesText,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Sessions"
          options={{
            title: sessionsText,
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "calendar-clock" : "calendar-clock-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ShareStudents"
          options={{
            title: shareStudentsText,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "share-social" : "share-social-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: profileText,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <Toast />
    </>
  );
}
