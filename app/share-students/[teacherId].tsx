import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStudentShareStore } from "../../store/useStudentShareStore";

export default function TeacherDetailPage() {
  const router = useRouter();
  const { teacherId } = useLocalSearchParams();

  const { teachers, teacherCourses, isLoadingCourses, getTeacherCourses } =
    useStudentShareStore();

  const [searchQuery, setSearchQuery] = useState("");

  const teacher = teachers.find((t) => t._id === teacherId);

  useEffect(() => {
    if (teacherId) {
      getTeacherCourses(teacherId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const filteredCourses = teacherCourses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (!teacher) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="person-outline" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            Teacher not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 bg-black rounded-lg px-6 py-3 active:bg-gray-800"
          >
            <Text className="text-white text-base font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center mb-3">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3 active:bg-gray-200"
          >
            <Ionicons name="arrow-back" size={20} color="#000000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-black text-xl font-bold">
              {teacher.name}&apos;s Courses
            </Text>
            <Text className="text-gray-500 text-sm">{teacher.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Stats Cards */}
          <View className="flex-row flex-wrap gap-3 mb-4">
            <View className="flex-1 min-w-[45%] bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Courses</Text>
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                  <Ionicons name="book" size={16} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-black">
                {teacherCourses.length}
              </Text>
              <Text className="text-xs text-gray-500">Total courses</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Students</Text>
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                  <Ionicons name="people" size={16} color="#10B981" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-black">
                {teacherCourses.reduce(
                  (total, course) => total + (course.student_count || 0),
                  0
                )}
              </Text>
              <Text className="text-xs text-gray-500">Total students</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="bg-white border border-gray-200 rounded-lg mb-3">
            <View className="flex-row items-center px-3 py-2">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-base text-black"
                placeholder="Search courses..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Courses List */}
          {isLoadingCourses ? (
            <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
              <ActivityIndicator size="large" color="#000000" />
              <Text className="text-gray-500 mt-4">Loading courses...</Text>
            </View>
          ) : filteredCourses.length === 0 ? (
            <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
              <Ionicons name="book-outline" size={48} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                No courses found
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                {searchQuery
                  ? `No courses match "${searchQuery}"`
                  : "This teacher has no courses available"}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredCourses.map((course) => (
                <Pressable
                  key={course._id}
                  onPress={() =>
                    router.push(
                      `/share-students/${teacherId}/course/${course._id}` as any
                    )
                  }
                  className="bg-white rounded-lg p-4 border border-gray-200 active:bg-gray-50"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View className="bg-blue-100 px-2 py-1 rounded mr-2">
                          <Text className="text-xs font-semibold text-blue-800">
                            {course.course_code}
                          </Text>
                        </View>
                        {course.level && (
                          <View className="bg-gray-100 px-2 py-1 rounded">
                            <Text className="text-xs font-semibold text-gray-800">
                              {formatLevel(course.level)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-base font-semibold text-black mb-1">
                        {course.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {course.student_count || 0} students
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
