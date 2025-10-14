import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-6">
        <View className="flex-row gap-2 mb-4">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Home
          </Text>
        </View>
        <Text className="text-base text-gray-700 dark:text-gray-300 mt-2">
          Welcome to your app!
        </Text>
      </View>
    </ScrollView>
  );
}
