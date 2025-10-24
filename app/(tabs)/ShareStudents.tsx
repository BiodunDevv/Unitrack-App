import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useAuthStore } from "../../store/useAuthStore";
import { useStudentShareStore } from "../../store/useStudentShareStore";

export default function ShareStudents() {
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    teachers,
    summary,
    isLoadingTeachers,
    getTeachers,
    getIncomingRequests,
    getOutgoingRequests,
  } = useStudentShareStore();

  const [activeTab, setActiveTab] = useState<
    "teachers" | "incoming" | "outgoing"
  >("teachers");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch initial data
  useEffect(() => {
    getTeachers();
    getIncomingRequests();
    getOutgoingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-black text-xl font-bold mb-1">
          Share Students
        </Text>
        <Text className="text-gray-500 text-sm">
          {getGreeting()}, {user?.name || "Teacher"}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="p-4">
          <View className="flex-row flex-wrap gap-3 mb-4">
            <View className="flex-1 min-w-[45%] bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Incoming</Text>
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                  <Ionicons name="arrow-down" size={16} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-black">
                {summary?.pending_incoming || 0}
              </Text>
              <Text className="text-xs text-gray-500">Pending requests</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Outgoing</Text>
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                  <Ionicons name="arrow-up" size={16} color="#10B981" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-black">
                {summary?.pending_outgoing || 0}
              </Text>
              <Text className="text-xs text-gray-500">Sent requests</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Teachers</Text>
                <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                  <Ionicons name="people" size={16} color="#A855F7" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-black">
                {teachers.length}
              </Text>
              <Text className="text-xs text-gray-500">Available</Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
            <Pressable
              onPress={() => setActiveTab("teachers")}
              className={`flex-1 py-2 rounded-md ${
                activeTab === "teachers" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  activeTab === "teachers" ? "text-black" : "text-gray-500"
                }`}
              >
                Teachers
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("incoming")}
              className={`flex-1 py-2 rounded-md ${
                activeTab === "incoming" ? "bg-white" : "bg-transparent"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className={`text-center text-sm font-semibold ${
                    activeTab === "incoming" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Incoming
                </Text>
                {(summary?.pending_incoming || 0) > 0 && (
                  <View className="ml-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {summary?.pending_incoming}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("outgoing")}
              className={`flex-1 py-2 rounded-md ${
                activeTab === "outgoing" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  activeTab === "outgoing" ? "text-black" : "text-gray-500"
                }`}
              >
                Outgoing
              </Text>
            </Pressable>
          </View>

          {/* Teachers Tab Content */}
          {activeTab === "teachers" && (
            <View>
              {/* Search Bar */}
              <View className="bg-white border border-gray-200 rounded-lg mb-3">
                <View className="flex-row items-center px-3 py-2">
                  <Ionicons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-base text-black"
                    placeholder="Search teachers..."
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

              {/* Teachers List */}
              {isLoadingTeachers ? (
                <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="text-gray-500 mt-4">
                    Loading teachers...
                  </Text>
                </View>
              ) : filteredTeachers.length === 0 ? (
                <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                    No teachers found
                  </Text>
                  <Text className="text-sm text-gray-500 text-center">
                    {searchQuery
                      ? `No teachers match "${searchQuery}"`
                      : "No teachers available for sharing"}
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {filteredTeachers.map((teacher) => (
                    <Pressable
                      key={teacher._id}
                      onPress={() =>
                        router.push(`/share-students/${teacher._id}` as any)
                      }
                      className="bg-white rounded-lg p-4 border border-gray-200 active:bg-gray-50"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                              <Ionicons
                                name="person"
                                size={20}
                                color="#000000"
                              />
                            </View>
                            <View className="flex-1">
                              <Text className="text-base font-semibold text-black">
                                {teacher.name}
                              </Text>
                              <Text className="text-sm text-gray-500">
                                {teacher.email}
                              </Text>
                            </View>
                          </View>
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
          )}

          {/* Incoming Tab Content */}
          {activeTab === "incoming" && (
            <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
              <Ionicons name="mail-outline" size={48} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                Coming Soon
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Incoming requests feature will be available soon
              </Text>
            </View>
          )}

          {/* Outgoing Tab Content */}
          {activeTab === "outgoing" && (
            <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
              <Ionicons name="send-outline" size={48} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                Coming Soon
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Outgoing requests feature will be available soon
              </Text>
            </View>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
