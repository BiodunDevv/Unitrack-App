import { Tabs } from "expo-router";
import Toast from "react-native-toast-message";
import { AnimatedTabBar } from "../../components/AnimatedTabBar";

export default function TabLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="Courses" />
        <Tabs.Screen name="Sessions" />
        <Tabs.Screen name="ShareStudents" />
        <Tabs.Screen name="Profile" />
      </Tabs>
      <Toast />
    </>
  );
}
