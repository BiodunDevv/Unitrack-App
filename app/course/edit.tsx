import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";

export default function EditCourse() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const { currentCourse, isLoading, getCourse, updateCourse } =
    useCourseStore();

  const [courseForm, setCourseForm] = useState({
    title: "",
    level: 100,
  });

  useEffect(() => {
    if (courseId) {
      getCourse(courseId);
    }
  }, [courseId, getCourse]);

  useEffect(() => {
    if (currentCourse) {
      setCourseForm({
        title: currentCourse.title,
        level: currentCourse.level,
      });
    }
  }, [currentCourse]);

  const formatLevel = (level: number) => {
    const levelMap: { [key: number]: string } = {
      100: "1st Year",
      200: "2nd Year",
      300: "3rd Year",
      400: "4th Year",
      500: "5th Year",
      600: "6th Year",
    };
    return levelMap[level] || `Level ${level}`;
  };

  const handleUpdateCourse = async () => {
    if (!courseForm.title.trim()) {
      Alert.alert("Error", "Please fill in the course title");
      return;
    }

    try {
      await updateCourse(courseId, {
        title: courseForm.title.trim(),
        level: courseForm.level,
      });
      // Reload the course data to update the details page
      await getCourse(courseId);
      Toast.show({
        type: "success",
        text1: "Course updated successfully!",
      });
      router.back();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update course";
      Alert.alert("Error", errorMessage);
    }
  };

  if (!currentCourse) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-700">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header - Facebook Style */}
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Pressable
                  onPress={() => router.back()}
                  className="mr-3 w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <Ionicons name="arrow-back" size={20} color="#000000" />
                </Pressable>
                <Text className="text-black text-lg font-bold">
                  Edit Course
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-4 pt-3 pb-6">
              {/* Course Information Card */}
              <View className="bg-white rounded-lg mb-3 border border-gray-200">
                <View className="px-4 py-3 border-b border-gray-100">
                  <Text className="text-black text-base font-semibold">
                    Course Information
                  </Text>
                </View>

                <View className="px-4 py-3">
                  {/* Course Code (Read-only) */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-semibold text-sm mb-2">
                      Course Code (Cannot be changed)
                    </Text>
                    <View className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
                      <Text className="text-gray-600 font-semibold">
                        {currentCourse.course_code}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">
                      Course code is permanent and cannot be modified
                    </Text>
                  </View>

                  {/* Course Title */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-semibold text-sm mb-2">
                      Course Title *
                    </Text>
                    <TextInput
                      value={courseForm.title}
                      onChangeText={(text) =>
                        setCourseForm({ ...courseForm, title: text })
                      }
                      placeholder="e.g., Introduction to Computer Science"
                      className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-sm text-black"
                      placeholderTextColor="#9CA3AF"
                      multiline
                    />
                    <Text className="text-gray-500 text-xs mt-1">
                      The full name/title of the course
                    </Text>
                  </View>

                  {/* Academic Level */}
                  <View>
                    <Text className="text-gray-700 font-semibold text-sm mb-2">
                      Academic Level *
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {[100, 200, 300, 400, 500, 600].map((level) => (
                        <Pressable
                          key={level}
                          onPress={() =>
                            setCourseForm({ ...courseForm, level })
                          }
                          className={`flex-1 min-w-[100px] rounded-lg px-4 py-3 border ${
                            courseForm.level === level
                              ? "bg-black border-black"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <Text
                            className={`text-center font-semibold text-sm ${
                              courseForm.level === level
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {level}
                          </Text>
                          <Text
                            className={`text-center text-xs mt-1 ${
                              courseForm.level === level
                                ? "text-white/80"
                                : "text-gray-500"
                            }`}
                          >
                            {formatLevel(level)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <Text className="text-gray-500 text-xs mt-2">
                      Select the academic level for this course
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => router.back()}
                  className="flex-1 bg-white border border-gray-200 rounded-lg py-3 items-center"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleUpdateCourse}
                  disabled={isLoading}
                  className={`flex-1 rounded-lg py-3 items-center ${
                    isLoading ? "bg-gray-400" : "bg-black"
                  }`}
                >
                  {isLoading ? (
                    <Text className="text-white font-semibold">
                      Updating...
                    </Text>
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark" size={18} color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Update Course
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
