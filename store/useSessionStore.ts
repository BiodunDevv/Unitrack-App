import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE_URL = "https://unitrack-backend-hd9s.onrender.com/api";

// Function to get auth token from AsyncStorage
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

// Types
export interface SessionStats {
  total_attendance: number;
  unique_students: number;
  is_currently_active: boolean;
  duration_minutes: number;
  time_remaining: number;
}

export interface Session {
  _id: string;
  course_id: {
    _id: string;
    course_code: string;
    title: string;
    level: number;
  };
  teacher_id: string;
  session_code: string;
  start_ts: string;
  expiry_ts: string;
  lat: number;
  lng: number;
  radius_m: number;
  nonce: string;
  is_active: boolean;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  stats: SessionStats;
}

export interface SessionPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export interface SessionSummary {
  total_sessions: number;
  active_sessions: number;
  expired_sessions: number;
}

interface SessionApiResponse {
  success: boolean;
  data: {
    sessions: Session[];
    pagination: SessionPagination;
    summary: SessionSummary;
  };
  message?: string;
}

interface SessionState {
  // State
  sessions: Session[];
  currentSession: Session | null;
  pagination: SessionPagination | null;
  summary: SessionSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getAllSessions: (
    page?: number,
    limit?: number,
    status?: string,
    courseId?: string,
    search?: string
  ) => Promise<void>;
  getSessionDetails: (sessionId: string) => Promise<void>;
  startAttendanceSession: (
    courseId: string,
    params: {
      lat: number;
      lng: number;
      radius_m: number;
      duration_minutes: number;
    }
  ) => Promise<any>;
  markStudentAttendance: (
    courseId: string,
    sessionId: string,
    studentId: string,
    status: "present" | "absent",
    reason: string
  ) => Promise<void>;
  bulkMarkAttendance: (
    courseId: string,
    sessionId: string,
    students: {
      studentId: string;
      status: "present" | "absent";
      reason: string;
    }[]
  ) => Promise<any>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentSession: (session: Session | null) => void;
}

// Helper function to check for success response
const isSuccessResponse = (response: SessionApiResponse): boolean => {
  return response.success === true && Boolean(response.data);
};

// Helper function for API calls with authentication
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // Initial State
      sessions: [],
      currentSession: null,
      pagination: null,
      summary: null,
      isLoading: false,
      error: null,

      // Actions
      getAllSessions: async (
        page = 1,
        limit = 20,
        status,
        courseId,
        search
      ) => {
        set({ isLoading: true, error: null });
        try {
          // Build query parameters
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          if (status && status !== "all") {
            params.append("status", status);
          }
          if (courseId) {
            params.append("course_id", courseId);
          }
          if (search) {
            params.append("search", search);
          }

          const response: SessionApiResponse = await apiCall(
            `/sessions/lecturer/all?${params.toString()}`
          );

          console.log("Fetched sessions:", response);

          if (isSuccessResponse(response)) {
            set({
              sessions: response.data.sessions || [],
              pagination: response.data.pagination || null,
              summary: response.data.summary || null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch sessions");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch sessions",
            isLoading: false,
          });
          throw error;
        }
      },

      getSessionDetails: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const response: {
            success: boolean;
            data: Session;
            message?: string;
          } = await apiCall(`/sessions/lecturer/${sessionId}/details`);

          console.log("Session details:", response);

          if (response.success && response.data) {
            set({
              currentSession: response.data,
              isLoading: false,
            });
          } else {
            throw new Error(
              response.message || "Failed to fetch session details"
            );
          }
        } catch (error) {
          console.error("getSessionDetails error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch session details",
            isLoading: false,
          });
          throw error;
        }
      },

      startAttendanceSession: async (courseId, params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}/sessions`, {
            method: "POST",
            body: JSON.stringify(params),
          });

          console.log("Session started:", response);

          if (response.success || response.data) {
            set({ isLoading: false });
            return response;
          } else {
            throw new Error(
              response.message || "Failed to start attendance session"
            );
          }
        } catch (error) {
          console.error("startAttendanceSession error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to start session",
            isLoading: false,
          });
          throw error;
        }
      },

      markStudentAttendance: async (
        courseId,
        sessionId,
        studentId,
        status,
        reason
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/students/bulk-mark`,
            {
              method: "PATCH",
              body: JSON.stringify({
                sessionId,
                students: [
                  {
                    studentId,
                    status,
                    reason,
                  },
                ],
              }),
            }
          );

          console.log("Manual mark attendance response:", response);

          // Check for success
          const isSuccess =
            response.success ||
            response.message?.toLowerCase().includes("success") ||
            (response.summary && response.results);

          if (isSuccess) {
            set({ isLoading: false });
            return response;
          } else {
            throw new Error(
              response.message || "Failed to mark student attendance"
            );
          }
        } catch (error) {
          console.error("markStudentAttendance error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to mark attendance",
            isLoading: false,
          });
          throw error;
        }
      },

      bulkMarkAttendance: async (courseId, sessionId, students) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/students/bulk-mark`,
            {
              method: "PATCH",
              body: JSON.stringify({
                sessionId,
                students,
              }),
            }
          );

          console.log("Bulk mark attendance response:", response);

          // Check for bulk attendance specific success criteria
          const isBulkAttendanceSuccess =
            response.summary &&
            response.results &&
            typeof response.summary.total_processed === "number" &&
            typeof response.summary.successful === "number";

          if (response.success || response.data || isBulkAttendanceSuccess) {
            set({ isLoading: false });
            return response;
          } else {
            throw new Error(
              response.message || "Failed to mark bulk attendance"
            );
          }
        } catch (error) {
          console.error("bulkMarkAttendance error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to mark bulk attendance",
            isLoading: false,
          });
          throw error;
        }
      },

      // Utility Actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setCurrentSession: (session: Session | null) =>
        set({ currentSession: session }),
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
        pagination: state.pagination,
        summary: state.summary,
      }),
    }
  )
);
