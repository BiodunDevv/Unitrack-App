import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useStudentShareStore } from "../../../../store/useStudentShareStore";

export default function CourseStudentsPage() {
  const router = useRouter();
  const { teacherId, courseId } = useLocalSearchParams();

  const {
    students,
    teacherCourses,
    myCourses,
    isLoadingStudents,
    getTeacherStudents,
    getMyCourses,
    requestStudents,
  } = useStudentShareStore();

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [message, setMessage] = useState("");

  const currentCourse = teacherCourses.find((c) => c._id === courseId);

  useEffect(() => {
    if (teacherId && courseId) {
      getTeacherStudents(teacherId as string, courseId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, courseId]);

  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.matric_no.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s._id));
    }
  };

  const handleRequestStudents = async () => {
    if (!selectedCourse) {
      Toast.show({
        type: "error",
        text1: "Please select a course",
      });
      return;
    }

    setIsRequesting(true);

    try {
      await requestStudents({
        target_teacher_id: teacherId as string,
        target_course_id: courseId as string,
        my_course_id: selectedCourse,
        student_ids: selectedStudents,
        message: message.trim(),
      });

      Toast.show({
        type: "success",
        text1: `Successfully requested ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}!`,
      });

      setSelectedStudents([]);
      setShowCourseModal(false);
      setSelectedCourse("");
      setMessage("");
      router.back();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send request";

      if (
        errorMessage.toLowerCase().includes("pending request") ||
        errorMessage.includes("already have a pending request")
      ) {
        Toast.show({
          type: "info",
          text1: "Pending request exists",
          text2: "Please wait for it to be processed",
        });
        setShowCourseModal(false);
        return;
      }

      Toast.show({
        type: "error",
        text1: errorMessage,
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const openCourseModal = async () => {
    await getMyCourses();
    setShowCourseModal(true);
  };

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
              Course Students
            </Text>
            {currentCourse && (
              <Text className="text-gray-500 text-sm">
                {currentCourse.course_code} - {currentCourse.title}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Stats */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-sm text-gray-600 mb-1">Total</Text>
              <Text className="text-2xl font-bold text-black">
                {students.length}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-sm text-gray-600 mb-1">Selected</Text>
              <Text className="text-2xl font-bold text-black">
                {selectedStudents.length}
              </Text>
            </View>
          </View>

          {/* Search and Actions */}
          <View className="gap-3 mb-4">
            <View className="bg-white border border-gray-200 rounded-lg">
              <View className="flex-row items-center px-3 py-2">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-base text-black"
                  placeholder="Search students..."
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

            {filteredStudents.length > 0 && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleSelectAll}
                  className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-4 active:bg-gray-50"
                >
                  <Text className="text-center text-sm font-semibold text-black">
                    {selectedStudents.length === filteredStudents.length
                      ? "Deselect All"
                      : "Select All"}
                  </Text>
                </Pressable>

                {selectedStudents.length > 0 && (
                  <Pressable
                    onPress={openCourseModal}
                    className="flex-1 bg-black rounded-lg py-2 px-4 active:bg-gray-800"
                  >
                    <Text className="text-center text-sm font-semibold text-white">
                      Request ({selectedStudents.length})
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Students List */}
          {isLoadingStudents ? (
            <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
              <ActivityIndicator size="large" color="#000000" />
              <Text className="text-gray-500 mt-4">Loading students...</Text>
            </View>
          ) : filteredStudents.length === 0 ? (
            <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                No students found
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                {searchQuery
                  ? `No students match "${searchQuery}"`
                  : "This course has no students yet"}
              </Text>
            </View>
          ) : (
            <View className="bg-white rounded-lg border border-gray-200">
              {filteredStudents.map((student, index) => (
                <Pressable
                  key={student._id}
                  onPress={() => {
                    if (selectedStudents.includes(student._id)) {
                      setSelectedStudents((prev) =>
                        prev.filter((id) => id !== student._id)
                      );
                    } else {
                      setSelectedStudents((prev) => [...prev, student._id]);
                    }
                  }}
                  className={`p-4 flex-row items-center ${
                    index !== filteredStudents.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  } active:bg-gray-50`}
                >
                  <View
                    className={`w-5 h-5 rounded mr-3 border-2 items-center justify-center ${
                      selectedStudents.includes(student._id)
                        ? "bg-black border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedStudents.includes(student._id) && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-black mb-1">
                      {student.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-0.5">
                      {student.matric_no}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {student.email}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Course Selection Modal */}
      <Modal
        visible={showCourseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCourseModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-black">
                  Select Your Course
                </Text>
                <Pressable
                  onPress={() => setShowCourseModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#000000" />
                </Pressable>
              </View>
              <Text className="text-sm text-gray-500 mt-1">
                Choose which course to add {selectedStudents.length} student
                {selectedStudents.length !== 1 ? "s" : ""} to
              </Text>
            </View>

            <ScrollView
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            >
              <View className="p-4">
                {myCourses.map((course) => (
                  <Pressable
                    key={course._id}
                    onPress={() => setSelectedCourse(course._id)}
                    className={`p-4 rounded-lg mb-2 border ${
                      selectedCourse === course._id
                        ? "bg-black border-black"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold mb-1 ${
                        selectedCourse === course._id
                          ? "text-white"
                          : "text-black"
                      }`}
                    >
                      {course.course_code}
                    </Text>
                    <Text
                      className={`text-sm ${
                        selectedCourse === course._id
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      {course.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-200">
              <Text className="text-sm font-semibold text-black mb-2">
                Message (Optional)
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base text-black mb-4"
                placeholder="Add a message to your request..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowCourseModal(false)}
                  className="flex-1 bg-gray-100 rounded-lg py-3 active:bg-gray-200"
                >
                  <Text className="text-center text-base font-semibold text-black">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleRequestStudents}
                  disabled={isRequesting || !selectedCourse}
                  className={`flex-1 rounded-lg py-3 ${
                    isRequesting || !selectedCourse
                      ? "bg-gray-400"
                      : "bg-black active:bg-gray-800"
                  }`}
                >
                  {isRequesting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-center text-base font-semibold text-white">
                      Send Request
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
