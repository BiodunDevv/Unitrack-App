import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";
import { useSessionStore } from "../../store/useSessionStore";

export default function Sessions() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    sessions,
    isLoading,
    error,
    pagination,
    summary,
    getAllSessions,
    clearError,
  } = useSessionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch sessions on component mount
  useEffect(() => {
    getAllSessions(
      currentPage,
      10,
      statusFilter === "all" ? undefined : statusFilter
    );
  }, [getAllSessions, currentPage, statusFilter]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
      });
      clearError();
    }
  }, [error, clearError]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getAllSessions(
        1,
        10,
        statusFilter === "all" ? undefined : statusFilter
      );
      setCurrentPage(1);
    } finally {
      setRefreshing(false);
    }
  }, [getAllSessions, statusFilter]);

  // Filter sessions based on search query
  const filteredSessions = searchQuery
    ? sessions.filter(
        (session) =>
          session.course_id.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          session.course_id.course_code
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          session.session_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  // Format level for display
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

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Format time remaining
  const formatTimeRemaining = (minutes: number) => {
    if (minutes <= 0) return "Expired";
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
  };

  // Format date with day
  const formatDateWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-black text-2xl font-bold mb-1">
          Session Management
        </Text>
        <Text className="text-gray-600 text-sm mb-3">
          {getGreeting()}, {user?.name || "Lecturer"}
        </Text>

        {/* Start Session Button */}
        <Pressable
          onPress={() => router.push("/session/start" as any)}
          className="bg-black rounded-lg py-3 px-4 flex-row items-center justify-center active:bg-gray-800"
        >
          <Ionicons name="play-circle" size={20} color="#FFFFFF" />
          <Text className="text-white text-base font-semibold ml-2">
            Start Session
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#000000"]}
            tintColor="#000000"
          />
        }
      >
        {/* Search and Filter */}
        <View className="p-4">
          <View className="bg-white rounded-lg border border-gray-200 mb-3">
            <View className="flex-row items-center px-4 py-3">
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                placeholder="Search sessions..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-base text-black"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Filter Button */}
          <Pressable
            onPress={() => setShowFilterMenu(!showFilterMenu)}
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex-row items-center justify-between mb-3"
          >
            <View className="flex-row items-center">
              <Ionicons name="filter" size={20} color="#000000" />
              <Text className="text-black text-sm font-medium ml-2">
                {statusFilter === "all"
                  ? "All Sessions"
                  : statusFilter === "active"
                    ? "Active Only"
                    : "Expired Only"}
              </Text>
            </View>
            <Ionicons
              name={showFilterMenu ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </Pressable>

          {/* Filter Menu */}
          {showFilterMenu && (
            <View className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden">
              <Pressable
                onPress={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                  setShowFilterMenu(false);
                }}
                className={`px-4 py-3 ${statusFilter === "all" ? "bg-gray-50" : ""}`}
              >
                <Text
                  className={`text-sm ${statusFilter === "all" ? "text-black font-semibold" : "text-gray-600"}`}
                >
                  All Sessions
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setStatusFilter("active");
                  setCurrentPage(1);
                  setShowFilterMenu(false);
                }}
                className={`px-4 py-3 border-t border-gray-100 ${statusFilter === "active" ? "bg-gray-50" : ""}`}
              >
                <Text
                  className={`text-sm ${statusFilter === "active" ? "text-black font-semibold" : "text-gray-600"}`}
                >
                  Active Only
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setStatusFilter("expired");
                  setCurrentPage(1);
                  setShowFilterMenu(false);
                }}
                className={`px-4 py-3 border-t border-gray-100 ${statusFilter === "expired" ? "bg-gray-50" : ""}`}
              >
                <Text
                  className={`text-sm ${statusFilter === "expired" ? "text-black font-semibold" : "text-gray-600"}`}
                >
                  Expired Only
                </Text>
              </Pressable>
            </View>
          )}

          {/* Search Results Counter */}
          {searchQuery && !isLoading && (
            <Text className="text-gray-600 text-sm mb-3">
              {filteredSessions.length} result
              {filteredSessions.length !== 1 ? "s" : ""} found
            </Text>
          )}
        </View>

        {/* Stats Cards */}
        <View className="px-4 pb-4">
          <View className="flex-row mb-3">
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200 mr-2">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 text-xs font-medium">
                  Total Sessions
                </Text>
                <Ionicons name="calendar" size={16} color="#6B7280" />
              </View>
              <Text className="text-black text-2xl font-bold">
                {isLoading ? "..." : summary?.total_sessions || 0}
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 text-xs font-medium">
                  Active
                </Text>
                <Ionicons name="pulse" size={16} color="#10B981" />
              </View>
              <Text className="text-green-600 text-2xl font-bold">
                {isLoading ? "..." : summary?.active_sessions || 0}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-lg p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-500 text-xs font-medium">
                Expired Sessions
              </Text>
              <Ionicons name="timer" size={16} color="#6B7280" />
            </View>
            <Text className="text-gray-600 text-2xl font-bold">
              {isLoading ? "..." : summary?.expired_sessions || 0}
            </Text>
          </View>
        </View>

        {/* Sessions List */}
        <View className="px-4 pb-6">
          {isLoading ? (
            <View className="bg-white rounded-lg p-12 items-center justify-center border border-gray-200">
              <ActivityIndicator size="large" color="#000000" />
              <Text className="text-gray-600 mt-4">Loading sessions...</Text>
            </View>
          ) : filteredSessions.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center border border-gray-200">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-black text-lg font-semibold mt-4 mb-2">
                {searchQuery ? "No sessions found" : "No sessions yet"}
              </Text>
              <Text className="text-gray-600 text-center text-sm mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start an attendance session from your course"}
              </Text>
            </View>
          ) : (
            filteredSessions.map((session) => (
              <Pressable
                key={session._id}
                onPress={() => router.push(`/session/${session._id}` as any)}
                className="bg-white rounded-lg p-4 mb-3 border border-gray-200 active:bg-gray-50"
              >
                {/* Session Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-black text-base font-bold mb-1">
                      {session.course_id.title}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {session.course_id.course_code} •{" "}
                      {formatLevel(session.course_id.level)}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      session.is_active && session.stats.time_remaining > 0
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        session.is_active && session.stats.time_remaining > 0
                          ? "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {session.is_active && session.stats.time_remaining > 0
                        ? "Active"
                        : "Expired"}
                    </Text>
                  </View>
                </View>

                {/* Session Code */}
                <View className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  <Text className="text-black text-center font-mono text-lg font-bold">
                    {session.session_code}
                  </Text>
                </View>

                {/* Session Stats */}
                <View className="flex-row justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="people" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {session.stats.total_attendance} (
                      {session.stats.unique_students} unique)
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {formatDuration(session.stats.duration_minutes)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="timer" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {formatTimeRemaining(session.stats.time_remaining)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {session.radius_m}m
                    </Text>
                  </View>
                </View>

                {/* Started Date */}
                <View className="border-t border-gray-100 pt-3 mt-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-500 text-xs flex-1">
                      Started: {formatDateWithDay(session.start_ts)} at{" "}
                      {new Date(session.start_ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Pressable
                      onPress={() =>
                        router.push(`/session/${session._id}` as any)
                      }
                      className="bg-black px-4 py-2 rounded-lg active:bg-gray-800 ml-3"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-white text-xs font-semibold mr-1">
                          View
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={12}
                          color="white"
                        />
                      </View>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))
          )}

          {/* Pagination Controls */}
          {!searchQuery && pagination && pagination.total_pages > 1 && (
            <View className="mt-4">
              <View className="bg-white rounded-lg p-4 border border-gray-200">
                <Text className="text-gray-600 text-sm text-center mb-3">
                  Page {pagination.current_page} of {pagination.total_pages} •{" "}
                  {pagination.total_items} total sessions
                </Text>
                <View className="flex-row items-center justify-between">
                  <Pressable
                    onPress={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className={`flex-1 mr-2 py-3 rounded-lg flex-row items-center justify-center ${
                      currentPage === 1
                        ? "bg-gray-100"
                        : "bg-black active:bg-gray-800"
                    }`}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={currentPage === 1 ? "#9CA3AF" : "#FFFFFF"}
                    />
                    <Text
                      className={`font-semibold ml-2 ${
                        currentPage === 1 ? "text-gray-400" : "text-white"
                      }`}
                    >
                      Previous
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setCurrentPage((prev) =>
                        Math.min(pagination.total_pages, prev + 1)
                      )
                    }
                    disabled={currentPage === pagination.total_pages}
                    className={`flex-1 ml-2 py-3 rounded-lg flex-row items-center justify-center ${
                      currentPage === pagination.total_pages
                        ? "bg-gray-100"
                        : "bg-black active:bg-gray-800"
                    }`}
                  >
                    <Text
                      className={`font-semibold mr-2 ${
                        currentPage === pagination.total_pages
                          ? "text-gray-400"
                          : "text-white"
                      }`}
                    >
                      Next
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={
                        currentPage === pagination.total_pages
                          ? "#9CA3AF"
                          : "#FFFFFF"
                      }
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
