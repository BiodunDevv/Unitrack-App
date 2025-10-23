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
import { useCourseStore } from "../../store/useCourseStore";

export default function CourseDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const {
    currentCourse,
    students,
    sessions,
    stats,
    isLoading,
    getCourse,
    endSessionEarly,
    removeStudentFromCourse,
    setCurrentCourse,
  } = useCourseStore();

  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "sessions"
  >("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (courseId) {
      // Clear current course data to show loading state
      setCurrentCourse(null);
      getCourse(courseId);
    }
  }, [courseId, getCourse, setCurrentCourse]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getCourse(courseId);
    } finally {
      setRefreshing(false);
    }
  };

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

  const formatDateWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEndSession = (sessionId: string) => {
    Alert.alert(
      "End Session",
      "Are you sure you want to end this session? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            try {
              await endSessionEarly(sessionId);
              Toast.show({
                type: "success",
                text1: "Session ended successfully",
              });
              getCourse(courseId);
            } catch {
              Toast.show({
                type: "error",
                text1: "Failed to end session",
              });
            }
          },
        },
      ]
    );
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
            try {
              await removeStudentFromCourse(courseId, studentId);
              Toast.show({
                type: "success",
                text1: "Student removed successfully",
              });
              // Reload course data to update student count
              await getCourse(courseId);
            } catch {
              Toast.show({
                type: "error",
                text1: "Failed to remove student",
              });
            }
          },
        },
      ]
    );
  };

  const filteredStudents = studentSearchQuery
    ? students.filter(
        (student) =>
          student.name
            .toLowerCase()
            .includes(studentSearchQuery.toLowerCase()) ||
          student.matric_no
            .toLowerCase()
            .includes(studentSearchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
      )
    : students;

  const filteredSessions = sessionSearchQuery
    ? sessions.filter(
        (session) =>
          (session.session_code &&
            session.session_code
              .toLowerCase()
              .includes(sessionSearchQuery.toLowerCase())) ||
          session._id
            .toLowerCase()
            .includes(sessionSearchQuery.toLowerCase()) ||
          (session.status &&
            session.status
              .toLowerCase()
              .includes(sessionSearchQuery.toLowerCase()))
      )
    : sessions;

  const recentSessions = sessions.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Pressable
                  onPress={() => router.back()}
                  className="mr-3 w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <Ionicons name="arrow-back" size={20} color="#000000" />
                </Pressable>
                <View className="flex-1">
                  <Text
                    className="text-black text-lg font-bold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {currentCourse?.title || "Loading..."}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {currentCourse?.course_code || ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Scrollable area starts from tabs */}
          <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Tabs */}
            <View className="bg-white px-4 pt-3 pb-2 border-b border-gray-200">
              <View className="flex-row gap-1">
                <Pressable
                  onPress={() => setActiveTab("overview")}
                  className={`flex-1 py-2.5 border-b-2 ${
                    activeTab === "overview"
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      activeTab === "overview" ? "text-black" : "text-gray-500"
                    }`}
                  >
                    Overview
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveTab("students")}
                  className={`flex-1 py-2.5 border-b-2 ${
                    activeTab === "students"
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      activeTab === "students" ? "text-black" : "text-gray-500"
                    }`}
                  >
                    Students
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveTab("sessions")}
                  className={`flex-1 py-2.5 border-b-2 ${
                    activeTab === "sessions"
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      activeTab === "sessions" ? "text-black" : "text-gray-500"
                    }`}
                  >
                    Sessions
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Search Bar - Visible on Students or Sessions tab */}
            {(activeTab === "students" || activeTab === "sessions") && (
              <View className="bg-white px-4 py-3">
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                  <Ionicons name="search" size={18} color="#65676B" />
                  <TextInput
                    placeholder={
                      activeTab === "students"
                        ? "Search students..."
                        : "Search sessions..."
                    }
                    value={
                      activeTab === "students"
                        ? studentSearchQuery
                        : sessionSearchQuery
                    }
                    onChangeText={(text) => {
                      if (activeTab === "students") {
                        setStudentSearchQuery(text);
                      } else {
                        setSessionSearchQuery(text);
                      }
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 ml-2 text-sm text-black"
                    placeholderTextColor="#65676B"
                  />
                  {((activeTab === "students" &&
                    studentSearchQuery.length > 0) ||
                    (activeTab === "sessions" &&
                      sessionSearchQuery.length > 0)) && (
                    <Pressable
                      onPress={() => {
                        if (activeTab === "students") {
                          setStudentSearchQuery("");
                        } else {
                          setSessionSearchQuery("");
                        }
                      }}
                    >
                      <Ionicons name="close-circle" size={18} color="#65676B" />
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* Stats Cards */}
            {!(
              (activeTab === "students" || activeTab === "sessions") &&
              isSearchFocused
            ) && (
              <View className="bg-white px-4 py-3">
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-gray-500 text-xs mb-1">
                          Students
                        </Text>
                        <Text className="text-black text-xl font-bold">
                          {stats?.total_students || students.length}
                        </Text>
                      </View>
                      <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
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
                          {stats?.active_sessions || 0}
                        </Text>
                      </View>
                      <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
                        <Ionicons name="time" size={18} color="white" />
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-gray-500 text-xs mb-1">Rate</Text>
                        <Text className="text-black text-xl font-bold">
                          {stats?.average_attendance_rate
                            ? Math.round(stats.average_attendance_rate)
                            : 0}
                          %
                        </Text>
                      </View>
                      <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                        <Ionicons name="bar-chart" size={18} color="white" />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View className="px-4">
              {isLoading && !refreshing && !currentCourse ? (
                <View className="flex-1 items-center justify-center py-20">
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="text-gray-600 mt-4">
                    Loading course details...
                  </Text>
                </View>
              ) : !currentCourse ? (
                <View className="flex-1 items-center justify-center py-20">
                  <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                    <Ionicons name="alert-circle" size={40} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-900 text-xl font-bold mb-2">
                    Course not found
                  </Text>
                  <Pressable
                    onPress={() => router.back()}
                    className="bg-black rounded-full px-6 py-3 mt-4"
                  >
                    <Text className="text-white font-bold">Go Back</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <View className="pb-6">
                      {/* Course Info */}
                      <View className="bg-white rounded-lg mb-3 border border-gray-200">
                        <View className="px-4 py-3 border-b border-gray-100">
                          <Text className="text-black text-base font-semibold">
                            Course Information
                          </Text>
                        </View>
                        <View>
                          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                            <Text className="text-gray-600 text-sm">
                              Course Code
                            </Text>
                            <Text className="text-black font-semibold">
                              {currentCourse.course_code}
                            </Text>
                          </View>
                          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                            <Text className="text-gray-600 text-sm">Level</Text>
                            <Text className="text-black font-semibold">
                              {formatLevel(currentCourse.level)}
                            </Text>
                          </View>
                          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                            <Text className="text-gray-600 text-sm">
                              Instructor
                            </Text>
                            <Text className="text-black font-semibold">
                              {currentCourse.teacher_id.name}
                            </Text>
                          </View>
                          <View className="flex-row justify-between items-center px-4 py-3">
                            <Text className="text-gray-600 text-sm">
                              Created
                            </Text>
                            <Text className="text-black font-semibold">
                              {formatDateWithDay(currentCourse.created_at)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Recent Sessions */}
                      <View className="bg-white rounded-lg border border-gray-200">
                        <View className="px-4 py-3 border-b border-gray-100">
                          <Text className="text-black text-base font-semibold">
                            Recent Sessions
                          </Text>
                        </View>
                        {recentSessions.length > 0 ? (
                          <View>
                            {recentSessions.map((session, index) => (
                              <View
                                key={session._id}
                                className={`px-4 py-3 ${
                                  index < recentSessions.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                                }`}
                              >
                                <View className="flex-row items-center justify-between mb-1">
                                  <Text className="text-black font-semibold">
                                    {session.session_code ||
                                      session._id.slice(-6)}
                                  </Text>
                                  <View
                                    className={`rounded-full px-2 py-1 ${
                                      session.is_active ||
                                      session.status === "active"
                                        ? "bg-green-100"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    <Text
                                      className={`text-xs font-medium ${
                                        session.is_active ||
                                        session.status === "active"
                                          ? "text-green-700"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {session.is_active
                                        ? "Active"
                                        : session.status || "Ended"}
                                    </Text>
                                  </View>
                                </View>
                                <Text className="text-gray-600 text-xs">
                                  {formatDateWithDay(
                                    session.start_time || session.created_at
                                  )}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View className="px-4 py-8">
                            <Text className="text-gray-500 text-sm text-center">
                              No sessions yet
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {activeTab === "students" && (
                    <View className="pb-6">
                      {/* Students List */}
                      {filteredStudents.length > 0 ? (
                        <>
                          <View className="bg-white rounded-lg border border-gray-200 mb-3">
                            {filteredStudents
                              .slice(0, 6)
                              .map((student, index) => (
                                <Pressable
                                  key={student._id}
                                  onPress={() =>
                                    router.push(
                                      `/course/${courseId}/student/${student._id}` as any
                                    )
                                  }
                                  className={`flex-row items-center px-4 py-3 ${
                                    index <
                                    Math.min(filteredStudents.length, 6) - 1
                                      ? "border-b border-gray-100"
                                      : ""
                                  }`}
                                >
                                  {/* Avatar */}
                                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
                                    <Ionicons
                                      name="person"
                                      size={20}
                                      color="#4B5563"
                                    />
                                  </View>

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
                                      {student.matric_no}
                                    </Text>
                                  </View>

                                  {/* Delete Button */}
                                  <Pressable
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      handleRemoveStudent(
                                        student._id,
                                        student.name
                                      );
                                    }}
                                    className="ml-2 p-2"
                                  >
                                    <Ionicons
                                      name="trash-outline"
                                      size={18}
                                      color="#EF4444"
                                    />
                                  </Pressable>
                                </Pressable>
                              ))}
                          </View>

                          {/* View All Button */}
                          {(filteredStudents.length > 6 ||
                            (!studentSearchQuery && students.length > 0)) && (
                            <Pressable
                              onPress={() =>
                                router.push(
                                  `/course/${courseId}/students` as any
                                )
                              }
                              className="bg-white rounded-lg py-3 items-center border border-gray-200"
                            >
                              <Text className="text-black text-sm font-semibold">
                                View All{" "}
                                {filteredStudents.length > 0
                                  ? filteredStudents.length
                                  : students.length}{" "}
                                Students
                              </Text>
                            </Pressable>
                          )}
                        </>
                      ) : (
                        <View className="bg-white rounded-lg p-8 border border-gray-200">
                          <View className="items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                              <Ionicons
                                name="people-outline"
                                size={32}
                                color="#9CA3AF"
                              />
                            </View>
                            <Text className="text-black text-base font-semibold mb-1">
                              {studentSearchQuery
                                ? "No students found"
                                : "No students enrolled yet"}
                            </Text>
                            <Text className="text-gray-500 text-sm text-center mb-4">
                              {studentSearchQuery
                                ? "Try adjusting your search terms"
                                : "Start by adding students to this course"}
                            </Text>
                            {!studentSearchQuery && (
                              <Pressable
                                onPress={() =>
                                  router.push(
                                    `/course/${courseId}/students/add` as any
                                  )
                                }
                                className="bg-black rounded-lg px-6 py-3 flex-row items-center"
                              >
                                <Ionicons
                                  name="add-circle-outline"
                                  size={18}
                                  color="white"
                                />
                                <Text className="text-white text-sm font-semibold ml-2">
                                  Add Students
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {activeTab === "sessions" && (
                    <View className="pb-6">
                      {filteredSessions.length > 0 ? (
                        <View className="bg-white rounded-lg border border-gray-200">
                          {filteredSessions.map((session, index) => (
                            <View
                              key={session._id}
                              className={`px-4 py-3 ${
                                index < filteredSessions.length - 1
                                  ? "border-b border-gray-100"
                                  : ""
                              }`}
                            >
                              {/* Session Header */}
                              <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-black font-semibold">
                                  {session.session_code ||
                                    session._id.slice(-6)}
                                </Text>
                                <View
                                  className={`rounded-full px-2 py-1 ${
                                    session.is_active ||
                                    session.status === "active"
                                      ? "bg-green-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      session.is_active ||
                                      session.status === "active"
                                        ? "text-green-700"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {session.is_active
                                      ? "Active"
                                      : session.status || "Ended"}
                                  </Text>
                                </View>
                              </View>

                              {/* Session Details */}
                              <View className="mb-2">
                                <Text className="text-gray-500 text-xs mb-0.5">
                                  Started:{" "}
                                  {formatDateWithDay(
                                    session.start_time || session.created_at
                                  )}
                                </Text>
                                <Text className="text-gray-500 text-xs">
                                  Expires:{" "}
                                  {formatDateWithDay(
                                    session.expiry_time || session.expires_at
                                  )}
                                </Text>
                              </View>

                              {/* End Session Button */}
                              {(session.is_active ||
                                session.status === "active") && (
                                <Pressable
                                  onPress={() => handleEndSession(session._id)}
                                  className="bg-red-50 rounded-lg py-2 items-center border border-red-200"
                                >
                                  <Text className="text-red-600 font-semibold text-sm">
                                    End Session
                                  </Text>
                                </Pressable>
                              )}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View className="bg-white rounded-lg p-8 border border-gray-200">
                          <View className="items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                              <Ionicons
                                name="time-outline"
                                size={32}
                                color="#9CA3AF"
                              />
                            </View>
                            <Text className="text-black text-base font-semibold mb-1">
                              {sessionSearchQuery
                                ? "No sessions found"
                                : "No sessions created yet"}
                            </Text>
                            <Text className="text-gray-500 text-sm text-center">
                              {sessionSearchQuery
                                ? "Try adjusting your search terms"
                                : "Sessions will appear here once created"}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Floating Edit Course Button - Better positioning for mobile */}
      <Pressable
        onPress={() => router.push(`/course/edit?courseId=${courseId}` as any)}
        className="absolute bottom-20 right-6 bg-black w-14 h-14 rounded-full items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="create-outline" size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}
