import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: "present" | "absent", reason: string) => Promise<void>;
  students: Student[];
  isLoading: boolean;
  sessionCode: string;
  courseName: string;
}

export function BulkAttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  students,
  isLoading,
  sessionCode,
  courseName,
}: BulkAttendanceModalProps) {
  const [status, setStatus] = useState<"present" | "absent">("present");
  const [reason, setReason] = useState("Network issues");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setReasonError("Please provide a reason for manual attendance marking");
      return;
    }

    if (reason.trim().length < 5) {
      setReasonError("Reason must be at least 5 characters long");
      return;
    }

    setReasonError(null);

    try {
      await onSubmit(status, reason.trim());
      handleClose();
    } catch (error) {
      console.error("Failed to submit bulk attendance:", error);
    }
  };

  const handleClose = () => {
    setStatus("present");
    setReason("Network issues");
    setReasonError(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setStatus("present");
      setReason("Network issues");
      setReasonError(null);
    }
  }, [isOpen]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <SafeAreaView
          edges={["bottom"]}
          className="bg-white rounded-t-3xl max-h-[90%]"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-black text-xl font-bold">
                  Bulk Mark Attendance
                </Text>
                <Pressable
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <Ionicons name="close" size={20} color="#000000" />
                </Pressable>
              </View>

              <Text className="text-gray-600 text-sm mb-4">
                Mark {students.length} selected student
                {students.length !== 1 ? "s" : ""} at once
              </Text>

              {/* Selected Students Summary */}
              <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="people" size={20} color="#2563EB" />
                  <Text className="text-blue-900 text-sm font-semibold ml-2">
                    {students.length} student{students.length !== 1 ? "s" : ""}{" "}
                    selected
                  </Text>
                </View>
                <View className="max-h-32">
                  <ScrollView showsVerticalScrollIndicator={true}>
                    {students.map((student, index) => (
                      <View
                        key={student._id}
                        className={`flex-row items-center justify-between py-2 ${
                          index !== students.length - 1
                            ? "border-b border-blue-200"
                            : ""
                        }`}
                      >
                        <View className="flex-1">
                          <Text className="text-blue-900 text-sm">
                            {student.name}
                          </Text>
                          <Text className="text-blue-700 text-xs">
                            {student.matric_no}
                          </Text>
                        </View>
                        <View className="bg-blue-100 px-2 py-1 rounded">
                          <Text className="text-blue-700 text-xs font-semibold">
                            L{student.level}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Status Selection */}
              <View className="mb-4">
                <Text className="text-black text-sm font-semibold mb-3">
                  Mark all students as
                </Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setStatus("present")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                      status === "present"
                        ? "bg-green-50 border-green-500"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={status === "present" ? "#10B981" : "#6B7280"}
                      />
                      <Text
                        className={`ml-2 font-semibold ${
                          status === "present"
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        Present
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setStatus("absent")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                      status === "absent"
                        ? "bg-red-50 border-red-500"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={status === "absent" ? "#EF4444" : "#6B7280"}
                      />
                      <Text
                        className={`ml-2 font-semibold ${
                          status === "absent" ? "text-red-700" : "text-gray-600"
                        }`}
                      >
                        Absent
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Reason Input */}
              <View className="mb-4">
                <Text className="text-black text-sm font-semibold mb-2">
                  Reason for Bulk Marking{" "}
                  <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={(text) => {
                    setReason(text);
                    if (reasonError) setReasonError(null);
                  }}
                  placeholder="e.g., Network issue affecting multiple students, System error"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={`bg-white border rounded-lg p-3 text-black ${
                    reasonError ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {reasonError && (
                  <Text className="text-red-600 text-xs mt-2">
                    {reasonError}
                  </Text>
                )}
                <Text className="text-gray-500 text-xs mt-2">
                  This reason will be applied to all selected students
                </Text>
              </View>

              {/* Session Info */}
              <View className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-6">
                <Text className="text-gray-900 text-sm font-semibold mb-1">
                  {courseName}
                </Text>
                <Text className="text-gray-600 text-xs">
                  Session: {sessionCode}
                </Text>
              </View>

              {/* Warning */}
              <View className="bg-orange-50 rounded-lg p-3 border border-orange-200 mb-6">
                <View className="flex-row">
                  <Ionicons
                    name="warning"
                    size={16}
                    color="#EA580C"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <Text className="text-orange-900 text-xs flex-1">
                    This will update attendance status for {students.length}{" "}
                    student{students.length !== 1 ? "s" : ""}. This action
                    cannot be undone.
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleClose}
                  disabled={isLoading}
                  className="flex-1 bg-gray-100 py-3 px-4 rounded-lg active:bg-gray-200"
                >
                  <Text className="text-black text-center font-semibold">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading || !reason.trim()}
                  className={`flex-1 py-3 px-4 rounded-lg ${
                    isLoading || !reason.trim()
                      ? "bg-gray-300"
                      : status === "present"
                        ? "bg-green-600 active:bg-green-700"
                        : "bg-red-600 active:bg-red-700"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    {!isLoading && (
                      <Ionicons
                        name={status === "present" ? "checkmark-done" : "close"}
                        size={20}
                        color="#FFFFFF"
                      />
                    )}
                    <Text className="text-white font-bold ml-2">
                      {isLoading ? "Processing..." : `Mark All ${status}`}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
