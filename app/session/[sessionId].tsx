import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { BulkAttendanceModal } from "../../components/BulkAttendanceModal";
import { ManualAttendanceModal } from "../../components/ManualAttendanceModal";
import { useSessionStore } from "../../store/useSessionStore";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://localhost:3000/api";

// Get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    const authStorage = await AsyncStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }
  return null;
};

interface Student {
  _id: string;
  name: string;
  email: string;
  matric_no: string;
  level: number;
  attendance_status: "present" | "absent" | "rejected" | "manual_present";
  submitted_at: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  distance_from_session_m: number | null;
}

interface SessionDetail {
  session: {
    _id: string;
    course_id: {
      _id: string;
      course_code: string;
      title: string;
    };
    teacher_id: {
      _id: string;
      name: string;
      email: string;
    };
    session_code: string;
    start_ts: string;
    expiry_ts: string;
    lat: number;
    lng: number;
    radius_m: number;
    is_active: boolean;
    is_expired: boolean;
  };
  students: {
    all: Student[];
    present: Student[];
    absent: Student[];
  };
  statistics: {
    total_enrolled: number;
    total_submissions: number;
    present_count: number;
    absent_count: number;
    attendance_rate: number;
    submission_rate: number;
  };
}

export default function SessionDetailPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const {
    markStudentAttendance,
    bulkMarkAttendance,
    isLoading: storeLoading,
  } = useSessionStore();

  const [sessionData, setSessionData] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual attendance modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Bulk attendance modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // End session state
  const [isEndingSession, setIsEndingSession] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setIsLoading(true);
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        setSessionData(data);
      } catch (err) {
        console.error("Session details fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  // Handler for manual attendance
  const handleManualAttendance = (student: Student) => {
    setSelectedStudent(student);
    setManualModalOpen(true);
  };

  const handleSubmitManualAttendance = async (
    status: "present" | "absent",
    reason: string
  ) => {
    if (!selectedStudent || !sessionData) return;

    const courseId = sessionData.session.course_id._id;

    try {
      await markStudentAttendance(
        courseId,
        sessionId,
        selectedStudent._id,
        status,
        reason
      );

      Toast.show({
        type: "success",
        text1: "Attendance Marked",
        text2: `${selectedStudent.name} marked as ${status}`,
      });

      // Refresh session data
      await refreshSessionData();
      setSelectedStudent(null);
      setManualModalOpen(false);
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark attendance",
      });
    }
  };

  // Handlers for bulk attendance
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleBulkAttendance = () => {
    if (selectedStudents.length === 0) {
      Toast.show({
        type: "warning",
        text1: "No Students Selected",
        text2: "Please select students first",
      });
      return;
    }
    setBulkModalOpen(true);
  };

  const handleSubmitBulkAttendance = async (
    status: "present" | "absent",
    reason: string
  ) => {
    if (!sessionData) return;

    const courseId = sessionData.session.course_id._id;

    // Build students array for bulk marking
    const students = selectedStudents.map((studentId) => ({
      studentId,
      status,
      reason,
    }));

    try {
      await bulkMarkAttendance(courseId, sessionId, students);

      Toast.show({
        type: "success",
        text1: "Bulk Attendance Marked",
        text2: `${selectedStudents.length} students marked as ${status}`,
      });

      // Refresh session data
      await refreshSessionData();
      setSelectedStudents([]);
      setIsSelectionMode(false);
      setBulkModalOpen(false);
    } catch (error) {
      console.error("Failed to bulk mark attendance:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark bulk attendance",
      });
    }
  };

  // Refresh session data
  const refreshSessionData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      }
    } catch (error) {
      console.error("Failed to refresh session data:", error);
    }
  };

  // End session manually
  const handleEndSession = async () => {
    if (!sessionData) return;

    setIsEndingSession(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionId}/end`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to end session");
      }

      Toast.show({
        type: "success",
        text1: "Session Ended",
        text2: "The attendance session has been closed",
      });

      await refreshSessionData();
    } catch (error) {
      console.error("Failed to end session:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error instanceof Error ? error.message : "Failed to end session",
      });
    } finally {
      setIsEndingSession(false);
    }
  };

  // Handler to open Google Maps
  const openInGoogleMaps = () => {
    if (!sessionData?.session) return;

    const { lat, lng } = sessionData.session;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Google Maps:", err)
    );
  };

  const formatDateTimeWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="text-gray-600 mt-4">Loading session...</Text>
      </SafeAreaView>
    );
  }

  if (error || !sessionData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
            <Text className="text-black text-xl font-bold ml-4">Error</Text>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-red-600 text-lg font-semibold mt-4 text-center">
            {error || "Session not found"}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-black rounded-lg px-6 py-3 mt-6"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { session, students, statistics } = sessionData;

  return (
    <View className="flex-1">
      <SafeAreaView className="bg-white" edges={["top"]} />
      <StatusBar style="dark" />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center mb-3"
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text className="text-black text-2xl font-bold mb-1">
            Session Details
          </Text>
          <Text className="text-gray-600 text-sm">
            {session.course_id.course_code} - {session.course_id.title}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Session Info Card */}
          <View className="p-4">
            <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-black text-lg font-bold">
                  Session Information
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    session.is_active && !session.is_expired
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      session.is_active && !session.is_expired
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {session.is_active && !session.is_expired
                      ? "Active"
                      : "Expired"}
                  </Text>
                </View>
              </View>

              {/* Session Code */}
              <View className="bg-gray-50 rounded-lg px-4 py-3 mb-3">
                <Text className="text-gray-500 text-xs font-medium mb-1">
                  SESSION CODE
                </Text>
                <Text className="text-black text-center font-mono text-2xl font-bold">
                  {session.session_code}
                </Text>
              </View>

              {/* Details Grid */}
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="person" size={16} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs">Teacher</Text>
                    <Text className="text-black text-sm font-medium">
                      {session.teacher_id.name}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs">Start Time</Text>
                    <Text className="text-black text-sm font-medium">
                      {formatDateTimeWithDay(session.start_ts)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs">End Time</Text>
                    <Text className="text-black text-sm font-medium">
                      {formatDateTimeWithDay(session.expiry_ts)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs">Location</Text>
                    <Text className="text-black text-sm font-medium">
                      {session.lat.toFixed(6)}, {session.lng.toFixed(6)}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Radius: {session.radius_m}m
                    </Text>
                  </View>
                </View>
              </View>

              {/* End Session Button */}
              {session.is_active && !session.is_expired && (
                <Pressable
                  onPress={handleEndSession}
                  disabled={isEndingSession}
                  className={`rounded-lg px-4 py-3 flex-row items-center justify-center mt-3 border ${
                    isEndingSession
                      ? "bg-gray-200 border-gray-300"
                      : "bg-red-600 border-red-600 active:bg-red-700"
                  }`}
                >
                  {isEndingSession ? (
                    <>
                      <ActivityIndicator size="small" color="#6B7280" />
                      <Text className="text-gray-600 text-sm font-bold ml-2">
                        Ending Session...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="stop-circle" size={18} color="white" />
                      <Text className="text-white text-sm font-bold ml-2">
                        End Session Now
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>

            {/* Statistics Cards */}
            <View className="flex-row mb-3">
              <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200 mr-2">
                <Text className="text-gray-500 text-xs font-medium mb-2">
                  Enrolled
                </Text>
                <Text className="text-black text-2xl font-bold">
                  {statistics.total_enrolled}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                <Text className="text-gray-500 text-xs font-medium mb-2">
                  Present
                </Text>
                <Text className="text-green-600 text-2xl font-bold">
                  {statistics.present_count}
                </Text>
              </View>
            </View>

            <View className="flex-row mb-3">
              <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200 mr-2">
                <Text className="text-gray-500 text-xs font-medium mb-2">
                  Absent
                </Text>
                <Text className="text-orange-600 text-2xl font-bold">
                  {statistics.absent_count}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                <Text className="text-gray-500 text-xs font-medium mb-2">
                  Rate
                </Text>
                <Text className="text-black text-2xl font-bold">
                  {statistics.attendance_rate}%
                </Text>
              </View>
            </View>

            {/* Location Card */}
            <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <Text className="text-black text-lg font-bold mb-3">
                Session Location
              </Text>
              <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <View className="flex-row items-start mb-3">
                  <Ionicons name="location" size={20} color="#000000" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs mb-1">
                      GPS Coordinates
                    </Text>
                    <Text className="text-black text-sm font-mono font-semibold">
                      {session.lat.toFixed(6)}, {session.lng.toFixed(6)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-start">
                  <Ionicons name="radio-outline" size={20} color="#000000" />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs mb-1">
                      Attendance Radius
                    </Text>
                    <Text className="text-black text-sm font-semibold">
                      {session.radius_m} meters
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={openInGoogleMaps}
                  className="bg-black rounded-lg px-4 py-3 mt-4 active:bg-gray-800"
                >
                  <Text className="text-white text-center font-semibold">
                    Open in Google Maps
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Students List */}
            <View className="bg-white rounded-lg p-4 border border-gray-200">
              {/* Header with Selection Controls */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-black text-lg font-bold">
                  Attendance Records ({students.all.length})
                </Text>
                {students.all.length > 0 && (
                  <Pressable
                    onPress={toggleSelectionMode}
                    className={`rounded-lg px-3 py-2 ${
                      isSelectionMode
                        ? "bg-red-50 border border-red-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelectionMode ? "text-red-700" : "text-blue-700"
                      }`}
                    >
                      {isSelectionMode ? "Cancel Selection" : "Select Students"}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Bulk Actions Bar */}
              {isSelectionMode && students.all.length > 0 && (
                <View className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-black text-sm font-semibold">
                      {selectedStudents.length} of {students.all.length}{" "}
                      selected
                    </Text>
                    <View className="flex-row gap-2">
                      {selectedStudents.length > 0 && (
                        <Pressable
                          onPress={() => setSelectedStudents([])}
                          className="bg-white rounded-lg px-3 py-1.5 border border-gray-200"
                        >
                          <Text className="text-black text-xs font-semibold">
                            Clear
                          </Text>
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() => {
                          if (selectedStudents.length === students.all.length) {
                            setSelectedStudents([]);
                          } else {
                            setSelectedStudents(students.all.map((s) => s._id));
                          }
                        }}
                        className="bg-white rounded-lg px-3 py-1.5 border border-gray-200"
                      >
                        <Text className="text-black text-xs font-semibold">
                          {selectedStudents.length === students.all.length
                            ? "Deselect All"
                            : "Select All"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <Pressable
                    onPress={handleBulkAttendance}
                    disabled={selectedStudents.length === 0 || storeLoading}
                    className={`rounded-lg px-4 py-2.5 flex-row items-center justify-center ${
                      selectedStudents.length === 0 || storeLoading
                        ? "bg-gray-200"
                        : "bg-green-600 active:bg-green-700"
                    }`}
                  >
                    {storeLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-done"
                          size={18}
                          color="white"
                        />
                        <Text className="text-white text-sm font-bold ml-2">
                          Mark {selectedStudents.length} Student
                          {selectedStudents.length !== 1 ? "s" : ""}
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}

              {/* Students List */}
              {students.all.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text className="text-gray-600 text-center mt-4">
                    No students enrolled
                  </Text>
                </View>
              ) : (
                students.all.map((student, index) => (
                  <Pressable
                    key={student._id}
                    onPress={() => {
                      if (isSelectionMode) {
                        toggleStudentSelection(student._id);
                      }
                    }}
                    className={`border-t border-gray-100 pt-3 pb-3 ${
                      index === 0 ? "border-t-0 pt-0" : ""
                    } ${
                      selectedStudents.includes(student._id) ? "bg-blue-50" : ""
                    }`}
                    style={
                      index === 0 ? { borderTopWidth: 0, paddingTop: 0 } : {}
                    }
                  >
                    <View className="flex-row items-center gap-3">
                      {/* Checkbox for selection mode */}
                      {isSelectionMode && (
                        <View
                          className={`w-6 h-6 rounded border-2 items-center justify-center ${
                            selectedStudents.includes(student._id)
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {selectedStudents.includes(student._id) && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          )}
                        </View>
                      )}

                      {/* Avatar */}
                      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                        <Ionicons name="person" size={18} color="#4B5563" />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-black text-sm font-semibold">
                              {student.name}
                            </Text>
                            <Text className="text-gray-600 text-xs">
                              {student.matric_no}
                            </Text>
                          </View>
                          <View
                            className={`px-3 py-1 rounded-full ${
                              student.attendance_status === "present" ||
                              student.attendance_status === "manual_present"
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                student.attendance_status === "present" ||
                                student.attendance_status === "manual_present"
                                  ? "text-green-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {student.attendance_status === "manual_present"
                                ? "MANUAL"
                                : student.attendance_status.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {student.submitted_at && (
                          <View className="flex-row items-center">
                            <Ionicons name="time" size={12} color="#6B7280" />
                            <Text className="text-gray-500 text-xs ml-1">
                              {formatDateTimeWithDay(student.submitted_at)}
                            </Text>
                          </View>
                        )}

                        {student.distance_from_session_m !== null && (
                          <View className="flex-row items-center mt-1">
                            <Ionicons
                              name="location"
                              size={12}
                              color="#6B7280"
                            />
                            <Text className="text-gray-500 text-xs ml-1">
                              Distance:{" "}
                              {Math.round(student.distance_from_session_m)}m
                            </Text>
                          </View>
                        )}

                        {/* Manual Attendance Button */}
                        {!isSelectionMode && (
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              handleManualAttendance(student);
                            }}
                            className="bg-blue-600 rounded-lg px-3 py-2 mt-3 active:bg-blue-700"
                          >
                            <View className="flex-row items-center justify-center">
                              <Ionicons
                                name="create-outline"
                                size={14}
                                color="#FFFFFF"
                              />
                              <Text className="text-white text-xs font-semibold ml-1">
                                Mark Manually
                              </Text>
                            </View>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* Manual Attendance Modal */}
        <ManualAttendanceModal
          isOpen={manualModalOpen}
          onClose={() => {
            setManualModalOpen(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleSubmitManualAttendance}
          student={selectedStudent}
          isLoading={storeLoading}
          sessionCode={session.session_code}
          courseName={`${session.course_id.course_code} - ${session.course_id.title}`}
        />

        {/* Bulk Attendance Modal */}
        <BulkAttendanceModal
          isOpen={bulkModalOpen}
          onClose={() => {
            setBulkModalOpen(false);
          }}
          onSubmit={handleSubmitBulkAttendance}
          students={students.all.filter((s) =>
            selectedStudents.includes(s._id)
          )}
          isLoading={storeLoading}
          sessionCode={session.session_code}
          courseName={`${session.course_id.course_code} - ${session.course_id.title}`}
        />

        {/* Toast Component */}
        <Toast />
      </View>
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </View>
  );
}
