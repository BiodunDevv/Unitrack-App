import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubmitAttendance() {
  const router = useRouter();

  const handleBack = async () => {
    await AsyncStorage.removeItem("@unitrack_quick_attendance");
    router.replace("/auth");
  };

  return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center">
      <View className="bg-white rounded-3xl px-8 py-10 w-11/12 items-center shadow-lg">
        <Text className="text-black text-2xl font-bold mb-4">
          Quick Attendance
        </Text>
        <Text className="text-gray-700 text-base mb-8 text-center">
          Your attendance has been submitted! 🎉
        </Text>
        <Pressable
          onPress={handleBack}
          className="bg-black rounded-full px-8 py-3 mt-4"
        >
          <Text className="text-white text-base font-bold">Back to Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
