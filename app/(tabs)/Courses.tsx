import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";

export default function Courses() {
  const router = useRouter();
  const {
    courses,
    totalStudents,
    totalActiveSessions,
    pagination,
    isLoading,
    getAllCourses,
    setCurrentPage,
    deleteCourse,
  } = useCourseStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    getAllCourses();
  }, [getAllCourses]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getAllCourses();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCourses = searchQuery
    ? courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.course_code
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.level.toString().includes(searchQuery)
      )
    : courses;

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

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCourse(courseId);
              Toast.show({
                type: "success",
                text1: "Course deleted successfully",
              });
              getAllCourses();
            } catch {
              Toast.show({
                type: "error",
                text1: "Failed to delete course",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setIsSearchFocused(false);
        }}
      >
        <View className="flex-1">
          {/* Header - Facebook Style */}
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-black text-2xl font-bold">Courses</Text>
              <Pressable
                onPress={() => router.push("/course/create" as any)}
                className="bg-black rounded-full w-9 h-9 items-center justify-center"
              >
                <Ionicons name="add" size={22} color="white" />
              </Pressable>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <Ionicons name="search" size={18} color="#65676B" />
              <TextInput
                placeholder="Search courses..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 ml-2 text-sm text-black"
                placeholderTextColor="#65676B"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#65676B" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Stats Cards - Hide when search is focused */}
            {!isSearchFocused && (
              <View className="bg-white px-4 py-4 mb-2">
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-gray-500 text-xs mb-1">
                          Courses
                        </Text>
                        <Text className="text-black text-xl font-bold">
                          {pagination?.totalCourses || 0}
                        </Text>
                      </View>
                      <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
                        <Ionicons name="book" size={18} color="white" />
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-gray-500 text-xs mb-1">
                          Students
                        </Text>
                        <Text className="text-black text-xl font-bold">
                          {totalStudents}
                        </Text>
                      </View>
                      <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                        <Ionicons name="people" size={18} color="white" />
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-gray-500 text-xs mb-1">
                          Active
                        </Text>
                        <Text className="text-black text-xl font-bold">
                          {totalActiveSessions}
                        </Text>
                      </View>
                      <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
                        <Ionicons name="time" size={18} color="white" />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Courses List Content */}
            <View className="px-4">
              {isLoading && !refreshing ? (
                <View className="flex-1 items-center justify-center py-20">
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="text-gray-600 mt-4">Loading courses...</Text>
                </View>
              ) : filteredCourses.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                    <Ionicons name="book-outline" size={40} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-900 text-xl font-bold mb-2">
                    {searchQuery ? "No courses found" : "No courses yet"}
                  </Text>
                  <Text className="text-gray-600 text-center mb-6">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Get started by creating your first course"}
                  </Text>
                </View>
              ) : (
                <View className="pb-6">
                  {filteredCourses.map((course) => (
                    <Pressable
                      key={course._id}
                      onPress={() =>
                        router.push(`/course/${course._id}` as any)
                      }
                      className="bg-white rounded-lg mb-2 border border-gray-200 active:bg-gray-50"
                    >
                      {/* Course Header */}
                      <View className="p-4">
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-black text-base font-bold mb-1">
                              {course.title}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                              {course.course_code} • {formatLevel(course.level)}
                            </Text>
                          </View>
                          {course.has_active_session && (
                            <View className="bg-green-100 rounded-full px-2 py-1 flex-row items-center">
                              <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                              <Text className="text-green-700 text-xs font-semibold">
                                Live
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row items-center gap-4 mt-2">
                          <View className="flex-row items-center">
                            <Ionicons name="people" size={16} color="#65676B" />
                            <Text className="text-gray-600 text-sm ml-1">
                              {course.student_count || 0}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color="#65676B"
                            />
                            <Text className="text-gray-600 text-sm ml-1">
                              {course.active_sessions_count || 0} active
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Divider */}
                      <View className="h-px bg-gray-100" />

                      {/* Action Buttons */}
                      <View className="flex-row items-center">
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/course/${course._id}/students` as any
                            );
                          }}
                          className="flex-1 py-2.5 flex-row items-center justify-center active:bg-gray-50"
                        >
                          <Ionicons
                            name="people-outline"
                            size={18}
                            color="#050505"
                          />
                          <Text className="text-black text-sm font-medium ml-1">
                            Students
                          </Text>
                        </Pressable>

                        <View className="w-px h-6 bg-gray-200" />

                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/course/edit?courseId=${course._id}` as any
                            );
                          }}
                          className="flex-1 py-2.5 flex-row items-center justify-center active:bg-gray-50"
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color="#050505"
                          />
                          <Text className="text-black text-sm font-medium ml-1">
                            Edit
                          </Text>
                        </Pressable>

                        <View className="w-px h-6 bg-gray-200" />

                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course._id, course.title);
                          }}
                          className="flex-1 py-2.5 flex-row items-center justify-center active:bg-gray-50"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#DC2626"
                          />
                          <Text className="text-red-600 text-sm font-medium ml-1">
                            Delete
                          </Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && !searchQuery && (
                    <View className="flex-row items-center justify-center gap-2 mt-4 bg-white rounded-lg py-3">
                      <Pressable
                        onPress={() =>
                          setCurrentPage(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrev}
                        className={`w-9 h-9 rounded-full items-center justify-center ${
                          pagination.hasPrev ? "bg-gray-100" : "bg-gray-50"
                        }`}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color={pagination.hasPrev ? "#000000" : "#9CA3AF"}
                        />
                      </Pressable>
                      <Text className="text-gray-600 text-sm mx-2">
                        {pagination.currentPage} / {pagination.totalPages}
                      </Text>
                      <Pressable
                        onPress={() =>
                          setCurrentPage(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNext}
                        className={`w-9 h-9 rounded-full items-center justify-center ${
                          pagination.hasNext ? "bg-gray-100" : "bg-gray-50"
                        }`}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={pagination.hasNext ? "#000000" : "#9CA3AF"}
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
