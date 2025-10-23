import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourseStore } from "../../../../store/useCourseStore";

export default function StudentAttendance() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;
  const studentId = params.studentId as string;

  const { currentCourse, students, isLoading, getCourse } = useCourseStore();
  const [refreshing, setRefreshing] = useState(false);

  // Find the current student
  const student = students?.find((s) => s._id === studentId);

  useEffect(() => {
    if (courseId) {
      getCourse(courseId);
    }
  }, [courseId, getCourse]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCourse(courseId);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading && !student) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-700 mt-4">Loading student data...</Text>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Student Not Found
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          The student you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-black rounded-full px-6 py-3"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white">
        {/* Fixed Header */}
        <View className="bg-black px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-4">
              <Pressable onPress={() => router.back()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              <Text
                className="text-white text-lg font-bold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Student Profile
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white text-sm font-bold mr-2">
                UNITRACK
              </Text>
              <Image
                source={require("../../../../assets/images/logoWhite.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Student Info Card */}
          <View className="bg-gradient-to-br from-blue-50 to-indigo-50 mx-6 mt-6 rounded-2xl p-6 border border-blue-200">
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-blue-600 items-center justify-center mb-4">
                <Ionicons name="person" size={48} color="white" />
              </View>
              <Text className="text-blue-900 text-2xl font-bold text-center mb-2">
                {student.name}
              </Text>
              <View className="bg-blue-100 rounded-full px-4 py-2 mb-2">
                <Text className="text-blue-700 text-sm font-bold">
                  {student.matric_no}
                </Text>
              </View>
              <Text className="text-blue-600 text-sm">{student.email}</Text>
              {student.phone && (
                <Text className="text-blue-600 text-sm mt-1">
                  {student.phone}
                </Text>
              )}
            </View>

            <View className="bg-white/50 rounded-xl p-4">
              <Text className="text-blue-900 text-sm font-semibold mb-2">
                Enrollment Details
              </Text>
              <View className="flex-row justify-between py-2 border-b border-blue-100">
                <Text className="text-blue-700 text-sm">Enrolled Since:</Text>
                <Text className="text-blue-900 text-sm font-semibold">
                  {formatDate(student.createdAt)}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-blue-700 text-sm">Last Updated:</Text>
                <Text className="text-blue-900 text-sm font-semibold">
                  {formatDate(student.updatedAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Course Info Card */}
          {currentCourse && (
            <View className="bg-gradient-to-br from-purple-50 to-pink-50 mx-6 mt-4 rounded-2xl p-5 border border-purple-200">
              <View className="flex-row items-center mb-3">
                <Ionicons name="book" size={24} color="#9333EA" />
                <Text className="text-purple-900 text-lg font-bold ml-2">
                  Enrolled In
                </Text>
              </View>
              <View className="bg-white/50 rounded-xl p-4">
                <Text className="text-purple-800 text-lg font-bold mb-1">
                  {currentCourse.course_code}
                </Text>
                <Text className="text-purple-700 text-sm mb-3">
                  {currentCourse.title}
                </Text>
                <View className="flex-row justify-between">
                  <Text className="text-purple-600 text-xs">Level:</Text>
                  <Text className="text-purple-900 text-xs font-semibold">
                    {currentCourse.level}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Attendance Feature Coming Soon */}
          <View className="bg-gray-50 mx-6 mt-4 mb-6 rounded-2xl p-6 border border-gray-200">
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-yellow-100 items-center justify-center mb-3">
                <Ionicons name="time-outline" size={32} color="#F59E0B" />
              </View>
              <Text className="text-gray-900 text-lg font-bold mb-2">
                Attendance Records
              </Text>
              <Text className="text-gray-600 text-sm text-center mb-4">
                Full attendance history and statistics will be available soon
              </Text>
              <View className="bg-yellow-50 rounded-lg px-4 py-2 border border-yellow-200">
                <Text className="text-yellow-700 text-xs font-semibold">
                  Feature Coming Soon
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
