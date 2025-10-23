import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../../../store/useCourseStore";

export default function AddStudents() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const {
    currentCourse,
    allCourses,
    courses,
    isLoading,
    getCourse,
    getAllCourses,
    addSingleStudent,
    addBulkStudents,
    copyStudentsFromCourse,
  } = useCourseStore();

  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "copy">(
    "single"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single student form
  const [studentForm, setStudentForm] = useState({
    matric_no: "",
    name: "",
    email: "",
  });

  // Bulk upload state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    size: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Copy students state
  const [selectedSourceCourse, setSelectedSourceCourse] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [copyResults, setCopyResults] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      getCourse(courseId);
      getAllCourses(); // Fetch all courses for copy feature
    }
  }, [courseId, getCourse, getAllCourses]);

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

  // Get available courses for copying (exclude current course)
  const availableCourses = (allCourses?.length ? allCourses : courses).filter(
    (course) => course._id !== courseId
  );

  // Filter courses based on search
  const filteredCourses = courseSearchQuery
    ? availableCourses.filter(
        (course) =>
          course.course_code
            .toLowerCase()
            .includes(courseSearchQuery.toLowerCase()) ||
          course.title
            .toLowerCase()
            .includes(courseSearchQuery.toLowerCase()) ||
          course.level.toString().includes(courseSearchQuery)
      )
    : availableCourses;

  // Copy students from another course
  const handleCopyStudents = async () => {
    if (!selectedSourceCourse) {
      Alert.alert("Error", "Please select a source course");
      return;
    }

    setIsSubmitting(true);
    try {
      const results = await copyStudentsFromCourse(
        selectedSourceCourse,
        courseId
      );
      setCopyResults(results);

      Toast.show({
        type: "success",
        text1: "Students copied successfully!",
        text2: `${results.summary?.added || 0} students added, ${results.summary?.skipped || 0} already enrolled`,
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to copy students");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add single student
  const handleAddSingleStudent = async () => {
    if (
      !studentForm.name.trim() ||
      !studentForm.matric_no.trim() ||
      !studentForm.email.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentForm.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await addSingleStudent(courseId, {
        matric_no: studentForm.matric_no,
        name: studentForm.name,
        email: studentForm.email,
      });

      Toast.show({
        type: "success",
        text1: "Student added successfully!",
        text2: `${studentForm.name} has been enrolled in the course`,
      });

      // Reset form
      setStudentForm({
        matric_no: "",
        name: "",
        email: "",
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pick CSV file (supports multiple formats)
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "application/csv",
          "text/x-csv",
          "application/x-csv",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile({
        name: file.name,
        uri: file.uri,
        size: file.size || 0,
      });
    } catch {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  // Process and upload CSV
  const handleBulkUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select a CSV file");
      return;
    }

    setIsProcessing(true);

    try {
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(selectedFile.uri);

      // Detect delimiter (comma, semicolon, tab, or pipe)
      const firstLine = fileContent.split("\n")[0];
      let delimiter = ",";
      if (firstLine.includes(";")) delimiter = ";";
      else if (firstLine.includes("\t")) delimiter = "\t";
      else if (firstLine.includes("|")) delimiter = "|";

      // Parse CSV with detected delimiter
      const lines = fileContent
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.replace(/\r/g, "")); // Remove carriage returns

      if (lines.length < 2) {
        throw new Error("CSV file is empty or invalid");
      }

      // Parse header
      const headers = lines[0]
        .split(delimiter)
        .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

      // Validate headers
      const requiredHeaders = ["matric_no", "name", "email"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required columns: ${missingHeaders.join(", ")}. Expected format: matric_no,name,email`
        );
      }

      // Parse students
      const students: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(delimiter)
          .map((v) => v.trim().replace(/['"]/g, "")); // Remove quotes
        const student: any = {};

        headers.forEach((header, index) => {
          student[header] = values[index] || "";
        });

        // Validate required fields
        if (student.matric_no && student.name && student.email) {
          students.push({
            matric_no: student.matric_no.trim().toUpperCase(),
            name: student.name.trim(),
            email: student.email.trim().toLowerCase(),
          });
        }
      }

      if (students.length === 0) {
        throw new Error("No valid students found in CSV file");
      }

      // Show confirmation
      Alert.alert(
        "Confirm Upload",
        `Found ${students.length} valid student${students.length === 1 ? "" : "s"}. Do you want to proceed?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upload",
            onPress: async () => {
              await uploadStudents(students);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to process CSV file");
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload students to API
  const uploadStudents = async (students: any[]) => {
    setIsSubmitting(true);

    try {
      const data = await addBulkStudents(courseId, students);

      Toast.show({
        type: "success",
        text1: "Students uploaded successfully!",
        text2: `${data.summary?.successful || students.length} student${students.length === 1 ? "" : "s"} added to the course`,
      });

      // Reset file selection
      setSelectedFile(null);

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload students");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // Download CSV template
  const downloadTemplate = () => {
    Alert.alert(
      "CSV Template Format",
      "Create a CSV file with these columns (in this order):\n\nmatric_no,name,email\n\nExample:\nBu22csc1001,John Doe,john.doe@email.com\nBu22csc1002,Jane Smith,jane.smith@email.com\nBu22csc1003,Bob Johnson,bob.johnson@email.com\n\nAll fields are required.\nSupported delimiters: comma (,), semicolon (;), tab, or pipe (|)",
      [{ text: "OK" }]
    );
  };

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header  */}
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
                      Add Students
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {currentCourse.course_code}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView
              className="flex-1 bg-gray-50"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Course Info */}
              <View className="px-4 pt-3">
                <View className="bg-white rounded-lg p-3 border border-gray-200">
                  <Text className="text-gray-500 text-xs mb-1">
                    Adding students to
                  </Text>
                  <Text className="text-black text-base font-semibold">
                    {currentCourse.title}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {formatLevel(currentCourse.level)}
                  </Text>
                </View>
              </View>

              {/* Tabs */}
              <View className="bg-white px-4 pt-3 pb-2 border-b border-gray-200 mt-3">
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setActiveTab("single")}
                    className={`flex-1 py-2 border-b-2 ${
                      activeTab === "single"
                        ? "border-black"
                        : "border-transparent"
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${
                        activeTab === "single" ? "text-black" : "text-gray-500"
                      }`}
                    >
                      Single
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setActiveTab("bulk")}
                    className={`flex-1 py-2 border-b-2 ${
                      activeTab === "bulk"
                        ? "border-black"
                        : "border-transparent"
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${
                        activeTab === "bulk" ? "text-black" : "text-gray-500"
                      }`}
                    >
                      Bulk CSV
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setActiveTab("copy")}
                    className={`flex-1 py-2 border-b-2 ${
                      activeTab === "copy"
                        ? "border-black"
                        : "border-transparent"
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${
                        activeTab === "copy" ? "text-black" : "text-gray-500"
                      }`}
                    >
                      Copy Course
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Tab Content */}
              <View className="px-4 pt-3 pb-6">
                {activeTab === "single" ? (
                  // Single Student Form
                  <View className="bg-white rounded-lg border border-gray-200">
                    <View className="px-4 py-3 border-b border-gray-100">
                      <Text className="text-black text-base font-semibold">
                        Student Information
                      </Text>
                    </View>

                    <View className="px-4 py-3">
                      {/* Matric Number */}
                      <View className="mb-4">
                        <Text className="text-gray-700 font-semibold text-sm mb-2">
                          Matric Number *
                        </Text>
                        <TextInput
                          value={studentForm.matric_no}
                          onChangeText={(text) =>
                            setStudentForm({
                              ...studentForm,
                              matric_no: text.toUpperCase(),
                            })
                          }
                          placeholder="e.g., Bu22csc1001"
                          className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-sm font-mono text-black"
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="characters"
                        />
                      </View>

                      {/* Full Name */}
                      <View className="mb-4">
                        <Text className="text-gray-700 font-semibold text-sm mb-2">
                          Full Name *
                        </Text>
                        <TextInput
                          value={studentForm.name}
                          onChangeText={(text) =>
                            setStudentForm({ ...studentForm, name: text })
                          }
                          placeholder="e.g., John Doe"
                          className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-sm text-black"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>

                      {/* Email */}
                      <View className="mb-4">
                        <Text className="text-gray-700 font-semibold text-sm mb-2">
                          Email Address *
                        </Text>
                        <TextInput
                          value={studentForm.email}
                          onChangeText={(text) =>
                            setStudentForm({
                              ...studentForm,
                              email: text.toLowerCase(),
                            })
                          }
                          placeholder="e.g., john.doe@example.com"
                          className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-sm text-black"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      {/* Auto-added Level Info */}
                      <View className="mb-4 bg-green-50 rounded-lg p-3 border border-green-200">
                        <View className="flex-row items-center">
                          <View className="bg-green-100 rounded-full p-2 mr-3">
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color="#16A34A"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-green-800 font-semibold text-sm">
                              Auto Level Assignment
                            </Text>
                            <Text className="text-green-600 text-xs mt-1">
                              The student&apos;s level will be automatically
                              determined from their matric number.
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row gap-3 mt-2">
                        <Pressable
                          onPress={() => {
                            setStudentForm({
                              matric_no: "",
                              name: "",
                              email: "",
                            });
                          }}
                          className="flex-1 bg-white rounded-lg py-3 border border-gray-300"
                        >
                          <Text className="text-gray-700 font-semibold text-center text-sm">
                            Clear
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={handleAddSingleStudent}
                          disabled={isSubmitting}
                          className={`flex-1 rounded-lg py-3 ${
                            isSubmitting ? "bg-gray-400" : "bg-black"
                          }`}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                          ) : (
                            <Text className="text-white font-semibold text-center text-sm">
                              Add Student
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : activeTab === "bulk" ? (
                  // Bulk Upload
                  <View className="bg-white rounded-lg border border-gray-200">
                    {/* Instructions */}
                    <View className="px-4 py-3 border-b border-gray-100">
                      <View className="flex-row items-start">
                        <Ionicons
                          name="information-circle"
                          size={20}
                          color="#2563EB"
                        />
                        <Text className="text-black text-base font-semibold ml-2 flex-1">
                          CSV Upload Instructions
                        </Text>
                      </View>
                    </View>

                    <View className="px-4 py-3">
                      <Text className="text-gray-700 text-sm mb-3">
                        Upload a CSV file with columns in this order:
                      </Text>
                      <View className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                        <Text className="text-gray-700 text-xs font-mono mb-2">
                          matric_no,name,email
                        </Text>
                        <Text className="text-gray-500 text-xs font-mono mb-1">
                          Bu22csc1001,John Doe,john.doe@email.com
                        </Text>
                        <Text className="text-gray-500 text-xs font-mono mb-1">
                          Bu22csc1002,Jane Smith,jane.smith@email.com
                        </Text>
                        <Text className="text-gray-500 text-xs font-mono">
                          Bu22csc1003,Bob Johnson,bob.johnson@email.com
                        </Text>
                      </View>
                      <Text className="text-gray-600 text-xs mb-3">
                        • All fields are required{"\n"}• Supports comma,
                        semicolon, tab, or pipe delimiters{"\n"}• First row must
                        be headers{"\n"}• Level will be added automatically (
                        {formatLevel(currentCourse?.level || 0)})
                      </Text>
                      <Pressable
                        onPress={downloadTemplate}
                        className="bg-black rounded-lg py-2.5 px-4 mb-3"
                      >
                        <View className="flex-row items-center justify-center">
                          <Ionicons name="download" size={16} color="white" />
                          <Text className="text-white text-sm font-semibold ml-2">
                            Download Template
                          </Text>
                        </View>
                      </Pressable>
                    </View>

                    {/* Auto-added Level Info */}
                    <View className="mx-4 mb-3 bg-green-50 rounded-lg p-3 border border-green-200">
                      <View className="flex-row items-center">
                        <View className="bg-green-100 rounded-full p-2 mr-3">
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#16A34A"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-green-800 font-semibold text-sm">
                            Level Automatically Added
                          </Text>
                          <Text className="text-green-600 text-xs mt-1">
                            All students will be enrolled at{" "}
                            {formatLevel(currentCourse?.level || 0)}
                          </Text>
                          <Text className="text-green-800 font-semibold text-sm">
                            Level Automatically Added
                          </Text>
                          <Text className="text-green-600 text-xs mt-1">
                            All students will be enrolled at{" "}
                            {formatLevel(currentCourse?.level || 0)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* File Upload */}
                    <View className="px-4 py-3 border-t border-gray-100">
                      <Text className="text-black text-sm font-semibold mb-3">
                        Upload CSV File
                      </Text>

                      {!selectedFile ? (
                        <Pressable
                          onPress={handlePickDocument}
                          className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 items-center"
                        >
                          <Ionicons
                            name="cloud-upload-outline"
                            size={40}
                            color="#9CA3AF"
                          />
                          <Text className="text-gray-700 text-sm font-semibold mt-2">
                            Select CSV File
                          </Text>
                          <Text className="text-gray-500 text-xs mt-1">
                            Tap to browse files
                          </Text>
                        </Pressable>
                      ) : (
                        <View className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center flex-1">
                              <View className="bg-green-100 rounded-full p-2">
                                <Ionicons
                                  name="document-text"
                                  size={18}
                                  color="#16A34A"
                                />
                              </View>
                              <View className="ml-3 flex-1">
                                <Text
                                  className="text-gray-900 font-semibold text-sm"
                                  numberOfLines={1}
                                >
                                  {selectedFile.name}
                                </Text>
                                <Text className="text-gray-500 text-xs">
                                  {(selectedFile.size / 1024).toFixed(2)} KB
                                </Text>
                              </View>
                            </View>
                            <Pressable
                              onPress={handleRemoveFile}
                              className="bg-red-100 rounded-full p-2 ml-2"
                            >
                              <Ionicons
                                name="close"
                                size={18}
                                color="#DC2626"
                              />
                            </Pressable>
                          </View>

                          {/* Upload Button */}
                          <Pressable
                            onPress={handleBulkUpload}
                            disabled={isProcessing || isSubmitting}
                            className={`rounded-lg py-3 items-center ${
                              isProcessing || isSubmitting
                                ? "bg-gray-400"
                                : "bg-black"
                            }`}
                          >
                            {isProcessing || isSubmitting ? (
                              <View className="flex-row items-center">
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white text-sm font-semibold ml-2">
                                  {isProcessing
                                    ? "Processing..."
                                    : "Uploading..."}
                                </Text>
                              </View>
                            ) : (
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="cloud-upload"
                                  size={18}
                                  color="white"
                                />
                                <Text className="text-white text-sm font-semibold ml-2">
                                  Upload Students
                                </Text>
                              </View>
                            )}
                          </Pressable>
                        </View>
                      )}

                      <Text className="text-gray-500 text-xs mt-2 text-center">
                        Supported: CSV, TSV, TXT • Delimiters: , ; | tab
                      </Text>
                    </View>
                  </View>
                ) : (
                  // Copy from Another Course
                  <View className="bg-white rounded-lg border border-gray-200">
                    {/* Instructions */}
                    <View className="px-4 py-3 border-b border-gray-100">
                      <View className="flex-row items-start">
                        <Ionicons
                          name="copy-outline"
                          size={20}
                          color="#7C3AED"
                        />
                        <Text className="text-black text-base font-semibold ml-2 flex-1">
                          Copy Students from Course
                        </Text>
                      </View>
                    </View>

                    <View className="px-4 py-3">
                      <Text className="text-gray-700 text-sm mb-3">
                        Select a course to copy all its enrolled students. Only
                        students not already enrolled will be added.
                      </Text>
                      <Text className="text-gray-600 text-xs mb-3">
                        • Students will be enrolled at{" "}
                        {formatLevel(currentCourse?.level || 0)}
                        {"\n"}• Duplicate students will be skipped automatically
                      </Text>
                    </View>

                    {/* Course Selection */}
                    <View className="px-4 py-3 border-t border-gray-100">
                      <Text className="text-black text-sm font-semibold mb-3">
                        Select Source Course
                      </Text>

                      {/* Search Bar */}
                      {availableCourses.length > 3 && (
                        <View className="mb-3">
                          <View className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-2.5 flex-row items-center">
                            <Ionicons name="search" size={16} color="#9CA3AF" />
                            <TextInput
                              value={courseSearchQuery}
                              onChangeText={setCourseSearchQuery}
                              placeholder="Search courses..."
                              className="flex-1 ml-2 text-sm text-black"
                              placeholderTextColor="#9CA3AF"
                            />
                            {courseSearchQuery && (
                              <Pressable
                                onPress={() => setCourseSearchQuery("")}
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={16}
                                  color="#9CA3AF"
                                />
                              </Pressable>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Course List */}
                      <ScrollView className="max-h-80 mb-3">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course, index) => (
                            <Pressable
                              key={course._id}
                              onPress={() =>
                                setSelectedSourceCourse(course._id)
                              }
                              className={`p-3 flex-row items-center justify-between ${
                                index < filteredCourses.length - 1
                                  ? "border-b border-gray-100"
                                  : ""
                              } ${
                                selectedSourceCourse === course._id
                                  ? "bg-gray-50"
                                  : ""
                              }`}
                            >
                              <View className="flex-row items-center flex-1">
                                <View className="bg-black rounded px-2 py-1 mr-2">
                                  <Text className="text-white text-xs font-semibold">
                                    {course.course_code}
                                  </Text>
                                </View>
                                <View className="bg-gray-100 rounded px-2 py-1 mr-2">
                                  <Text className="text-gray-700 text-xs font-semibold">
                                    {formatLevel(course.level)}
                                  </Text>
                                </View>
                                <Text
                                  className="text-gray-900 text-sm flex-1"
                                  numberOfLines={1}
                                >
                                  {course.title}
                                </Text>
                              </View>
                              {selectedSourceCourse === course._id && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color="#16A34A"
                                />
                              )}
                            </Pressable>
                          ))
                        ) : (
                          <View className="py-8 items-center">
                            <Ionicons
                              name="school-outline"
                              size={36}
                              color="#9CA3AF"
                            />
                            <Text className="text-gray-600 text-sm mt-2">
                              {courseSearchQuery
                                ? "No courses found"
                                : "No other courses available"}
                            </Text>
                          </View>
                        )}
                      </ScrollView>

                      {/* Copy Results */}
                      {copyResults && (
                        <View className="bg-green-50 rounded-lg p-3 border border-green-200 mb-3">
                          <Text className="text-green-800 font-semibold text-sm mb-2">
                            Copy Results
                          </Text>
                          <View className="space-y-1">
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-green-700 text-xs">
                                Students copied:
                              </Text>
                              <Text className="text-green-900 font-semibold text-xs">
                                {copyResults.summary?.added || 0}
                              </Text>
                            </View>
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-green-700 text-xs">
                                Already enrolled:
                              </Text>
                              <Text className="text-orange-600 font-semibold text-xs">
                                {copyResults.summary?.skipped || 0}
                              </Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-green-700 text-xs">
                                Total processed:
                              </Text>
                              <Text className="text-green-900 font-semibold text-xs">
                                {copyResults.summary?.total_processed || 0}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {/* Copy Button */}
                      <Pressable
                        onPress={handleCopyStudents}
                        disabled={!selectedSourceCourse || isSubmitting}
                        className={`rounded-lg py-3 items-center ${
                          !selectedSourceCourse || isSubmitting
                            ? "bg-gray-400"
                            : "bg-black"
                        }`}
                      >
                        {isSubmitting ? (
                          <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="white" />
                            <Text className="text-white text-sm font-semibold ml-2">
                              Copying...
                            </Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center">
                            <Ionicons name="copy" size={18} color="white" />
                            <Text className="text-white text-sm font-semibold ml-2">
                              Copy Students
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
