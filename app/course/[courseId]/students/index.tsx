import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useCourseStore } from "../../../../store/useCourseStore";

export default function AllStudents() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const {
    currentCourse,
    students,
    isLoading,
    getCourse,
    removeStudentFromCourse,
    bulkRemoveStudentsFromCourse,
    removeAllStudentsFromCourse,
  } = useCourseStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(
    null
  );
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    if (courseId) {
      getCourse(courseId);
    }
  }, [courseId, getCourse]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getCourse(courseId);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    Alert.alert(
      "Remove Student",
      `Are you sure you want to remove ${studentName} from this course?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingStudentId(studentId);
            try {
              await removeStudentFromCourse(courseId, studentId);
              Toast.show({
                type: "success",
                text1: "Student removed successfully",
              });
              await getCourse(courseId);
            } catch {
              Toast.show({
                type: "error",
                text1: "Failed to remove student",
              });
            } finally {
              setRemovingStudentId(null);
            }
          },
        },
      ]
    );
  };

  // Bulk select handlers
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student._id));
    }
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) return;

    Alert.alert(
      "Remove Selected Students",
      `Are you sure you want to remove ${selectedStudents.length} selected student${selectedStudents.length === 1 ? "" : "s"} from this course? This will also delete their attendance records.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsBulkDeleting(true);
            try {
              const result = await bulkRemoveStudentsFromCourse(
                courseId,
                selectedStudents
              );
              Toast.show({
                type: "success",
                text1: `${result.summary.successful} student${result.summary.successful === 1 ? "" : "s"} removed successfully`,
              });
              setSelectedStudents([]);
              await getCourse(courseId);
            } catch {
              Toast.show({
                type: "error",
                text1: "Failed to remove students",
              });
            } finally {
              setIsBulkDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Delete all handler
  const handleDeleteAll = () => {
    Alert.alert(
      "Remove All Students",
      `Are you sure you want to remove ALL ${students.length} students from this course? This will also delete all attendance records. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove All",
          style: "destructive",
          onPress: async () => {
            setIsBulkDeleting(true);
            try {
              const result = await removeAllStudentsFromCourse(courseId);
              Toast.show({
                type: "success",
                text1: `All ${result.summary.total_students_removed} students removed successfully`,
              });
              setSelectedStudents([]);
              await getCourse(courseId);
            } catch {
              Toast.show({
                type: "error",
                text1: "Failed to remove all students",
              });
            } finally {
              setIsBulkDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Filter students
  const filteredStudents = searchQuery
    ? students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.matric_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  if (isLoading && !currentCourse) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-700 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!currentCourse) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-gray-700 mb-4">Course not found</Text>
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
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setIsSearchFocused(false);
        }}
      >
        <View className="flex-1">
          {/* Fixed Header */}
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Pressable
                  onPress={() => router.back()}
                  className="mr-3 w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <Ionicons name="arrow-back" size={20} color="#000000" />
                </Pressable>
                <View className="flex-1">
                  <Text className="text-black text-lg font-bold">
                    All Students
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {currentCourse.course_code}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Search Bar and Add Button */}
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row gap-2">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2.5">
                <Ionicons name="search" size={18} color="#65676B" />
                <TextInput
                  placeholder="Search students..."
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
              <Pressable
                onPress={() =>
                  router.push(`/course/${courseId}/students/add` as any)
                }
                className="bg-black rounded-full px-4 py-2.5 flex-row items-center justify-center"
              >
                <Ionicons name="add" size={18} color="white" />
                <Text className="text-white text-sm font-semibold ml-1">
                  Add
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Bulk Actions */}
            {!isLoading && filteredStudents.length > 0 && !isSearchFocused && (
              <View className="px-4 pt-3">
                <View className="bg-white rounded-lg p-3 border border-gray-200">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-black text-sm font-semibold">
                      {selectedStudents.length} of {filteredStudents.length}{" "}
                      selected
                    </Text>
                    <View className="flex-row gap-2">
                      {selectedStudents.length > 0 && (
                        <Pressable
                          onPress={() => setSelectedStudents([])}
                          className="bg-gray-100 rounded-lg px-3 py-1.5"
                        >
                          <Text className="text-black text-xs font-semibold">
                            Clear
                          </Text>
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleSelectAllStudents}
                        className="bg-gray-100 rounded-lg px-3 py-1.5"
                      >
                        <Text className="text-black text-xs font-semibold">
                          {selectedStudents.length === filteredStudents.length
                            ? "Deselect All"
                            : "Select All"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handleBulkDelete}
                      disabled={selectedStudents.length === 0 || isBulkDeleting}
                      className={`flex-1 rounded-lg px-3 py-2 flex-row items-center justify-center border ${
                        selectedStudents.length === 0 || isBulkDeleting
                          ? "bg-gray-100 border-gray-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      {isBulkDeleting ? (
                        <ActivityIndicator size="small" color="#DC2626" />
                      ) : (
                        <>
                          <Ionicons
                            name="trash"
                            size={16}
                            color={
                              selectedStudents.length === 0
                                ? "#9CA3AF"
                                : "#DC2626"
                            }
                          />
                          <Text
                            className={`text-xs font-semibold ml-1 ${
                              selectedStudents.length === 0
                                ? "text-gray-400"
                                : "text-red-600"
                            }`}
                          >
                            Delete ({selectedStudents.length})
                          </Text>
                        </>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={handleDeleteAll}
                      disabled={isBulkDeleting}
                      className={`rounded-lg px-3 py-2 flex-row items-center justify-center border ${
                        isBulkDeleting
                          ? "bg-gray-100 border-gray-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      {isBulkDeleting ? (
                        <ActivityIndicator size="small" color="#DC2626" />
                      ) : (
                        <>
                          <Ionicons
                            name="trash-bin"
                            size={16}
                            color="#DC2626"
                          />
                          <Text className="text-red-600 text-xs font-semibold ml-1">
                            Delete All
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* Stats Summary */}
            {!isSearchFocused && (
              <View className="px-4 pt-3">
                <View className="bg-white rounded-lg p-3 border border-gray-200">
                  <View className="flex-row gap-2">
                    <View className="flex-1 bg-gray-50 rounded-lg p-3">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-gray-500 text-xs mb-1">
                            Total Students
                          </Text>
                          <Text className="text-black text-xl font-bold">
                            {filteredStudents.length}
                          </Text>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
                          <Ionicons name="people" size={18} color="white" />
                        </View>
                      </View>
                    </View>

                    {searchQuery && (
                      <View className="flex-1 bg-gray-50 rounded-lg p-3">
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-gray-500 text-xs mb-1">
                              Filtered
                            </Text>
                            <Text className="text-black text-xl font-bold">
                              {filteredStudents.length}/{students.length}
                            </Text>
                          </View>
                          <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                            <Ionicons name="search" size={18} color="white" />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Loading Overlay for subsequent loads */}
            {isLoading && students.length > 0 && (
              <View className="px-4 pt-3">
                <View className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex-row items-center">
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text className="text-blue-900 text-sm font-semibold ml-2">
                    Updating students...
                  </Text>
                </View>
              </View>
            )}

            {/* Students List */}
            <View className="px-4 pt-3 pb-6">
              {isLoading && students.length === 0 ? (
                <View className="bg-white rounded-lg p-8 border border-gray-200">
                  <View className="items-center">
                    <ActivityIndicator size="large" color="#000" />
                    <Text className="text-gray-600 text-sm mt-4">
                      Loading students...
                    </Text>
                  </View>
                </View>
              ) : filteredStudents.length > 0 ? (
                <View className="bg-white rounded-lg border border-gray-200">
                  {filteredStudents.map((student, index) => (
                    <View
                      key={student._id}
                      className={`flex-row items-center px-4 py-3 ${
                        removingStudentId === student._id ? "opacity-50" : ""
                      } ${
                        selectedStudents.includes(student._id)
                          ? "bg-gray-50"
                          : "bg-white"
                      } ${
                        index < filteredStudents.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Checkbox and Student Info - Clickable Area */}
                      <Pressable
                        onPress={() => handleSelectStudent(student._id)}
                        className="flex-1 flex-row items-center"
                      >
                        {/* Checkbox */}
                        <View
                          className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                            selectedStudents.includes(student._id)
                              ? "bg-black border-black"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedStudents.includes(student._id) && (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color="white"
                            />
                          )}
                        </View>

                        {/* Avatar - Opens Details */}
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/course/${courseId}/student/${student._id}` as any
                            );
                          }}
                          className="mr-3"
                        >
                          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                            <Ionicons name="person" size={20} color="#4B5563" />
                          </View>
                        </Pressable>

                        {/* Student Info */}
                        <View className="flex-1">
                          <Text
                            className="text-black font-semibold text-sm mb-0.5"
                            numberOfLines={1}
                          >
                            {student.name}
                          </Text>
                          <Text
                            className="text-gray-500 text-xs"
                            numberOfLines={1}
                          >
                            {student.matric_no} • {student.email}
                          </Text>
                        </View>
                      </Pressable>

                      {/* Delete Button */}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveStudent(student._id, student.name);
                        }}
                        disabled={removingStudentId === student._id}
                        className="ml-2 p-2"
                      >
                        {removingStudentId === student._id ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#EF4444"
                          />
                        )}
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-lg p-8 border border-gray-200">
                  <View className="items-center">
                    <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                      <Ionicons name="search" size={32} color="#9CA3AF" />
                    </View>
                    <Text className="text-black text-base font-semibold mb-1">
                      {searchQuery
                        ? "No students found"
                        : "No students enrolled"}
                    </Text>
                    <Text className="text-gray-500 text-sm text-center">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Students will appear here once enrolled"}
                    </Text>
                    {searchQuery && (
                      <Pressable
                        onPress={() => setSearchQuery("")}
                        className="bg-black rounded-lg px-4 py-2 mt-4"
                      >
                        <Text className="text-white text-sm font-semibold">
                          Clear Search
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
