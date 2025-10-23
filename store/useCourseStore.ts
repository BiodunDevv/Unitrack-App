import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "localhost:3000";

// Function to get auth token from auth store
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
interface Course {
  _id: string;
  teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
  course_code: string;
  title: string;
  level: number;
  student_count?: number;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  active_sessions_count?: number;
  has_active_session?: boolean;
  active_sessions?: {
    _id: string;
    session_code: string;
    start_ts: string;
    expiry_ts: string;
  }[];
}

interface Student {
  _id: string;
  matric_no: string;
  name: string;
  email: string;
  phone: string;
  course_id: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  _id: string;
  course_id: string;
  teacher_id: string;
  session_code?: string;
  start_time?: string;
  expiry_time?: string;
  is_active?: boolean;
  is_expired?: boolean;
  lat: number;
  lng: number;
  radius_m: number;
  duration_minutes: number;
  status: "active" | "ended" | "expired";
  created_at: string;
  expires_at: string;
  qr_code: string;
}

interface AttendanceStats {
  total_sessions: number;
  active_sessions: number;
  total_students: number;
  total_attendance_records: number;
  present_count: number;
  absent_count: number;
  rejected_count: number;
  average_attendance_rate: number;
  last_session: string;
  course_activity: {
    sessions_this_week: number;
    sessions_this_month: number;
  };
  attendance_counts: {
    present: number;
    absent: number;
    rejected: number;
    total_submissions: number;
  };
}

interface StudentsData {
  total: number;
  active: number;
  inactive: number;
  list: Student[];
}

interface CopyStudentsResponse {
  message: string;
  addedStudents: {
    _id: string;
    course_id: string;
    student_id: {
      _id: string;
      matric_no: string;
      name: string;
      email: string;
      phone?: string;
      level: number;
    };
    added_by: string;
    added_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }[];
  skippedStudents: {
    matric_no: string;
    name: string;
    reason: string;
  }[];
  summary: {
    total_processed: number;
    added: number;
    skipped: number;
  };
}

interface BulkDeleteResponse {
  message: string;
  summary: {
    total_processed: number;
    successful: number;
    not_found: number;
    failed: number;
    course: {
      id: string;
      title: string;
      course_code: string;
    };
  };
  results: {
    successful: {
      student_id: string;
      name: string;
      email: string;
      matric_no: string;
      attendance_records_cleaned: boolean;
    }[];
    not_found: {
      student_id: string;
      reason: string;
    }[];
    failed: {
      student_id: string;
      error: string;
    }[];
  };
}

interface DeleteAllStudentsResponse {
  message: string;
  summary: {
    total_students_removed: number;
    course: {
      id: string;
      title: string;
      course_code: string;
    };
    deleted_students: {
      id: string;
      name: string;
      email: string;
      matric_no: string;
    }[];
    attendance_records_cleaned: boolean;
  };
}

interface SessionsData {
  total: number;
  active: number;
  expired: number;
  recent: Session[];
  active_sessions: {
    _id: string;
    session_code: string;
    start_time: string;
    expiry_time: string;
  }[];
  pending_sessions: any[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses?: number;
  totalStudents?: number;
  totalSessions?: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  courses?: Course[];
  course?: Course;
  students?: StudentsData | Student[];
  sessions?: SessionsData | Session[];
  session?: Session;
  stats?: AttendanceStats;
  statistics?: AttendanceStats;
  recent_activity?: any[];
  pagination?: Pagination;
  message?: string;
  success?: boolean;
  [key: string]: any;
}

interface CourseState {
  // State
  courses: Course[];
  allCourses: Course[];
  currentCourse: Course | null;
  students: Student[];
  sessions: Session[];
  currentSession: Session | null;
  stats: AttendanceStats | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  coursesPerPage: number;
  totalStudents: number;
  totalActiveSessions: number;

  // Course Management Actions
  createCourse: (courseData: {
    course_code: string;
    title: string;
    level: number;
  }) => Promise<void>;
  getAllCourses: () => Promise<void>;
  getCourse: (courseId: string) => Promise<void>;
  updateCourse: (
    courseId: string,
    data: { title?: string; level?: number }
  ) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  // Client-side pagination actions
  setCurrentPage: (page: number) => void;
  getDisplayedCourses: () => Course[];
  getTotalPages: () => number;

  // Student Management Actions
  getCourseStudents: (
    courseId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  addSingleStudent: (
    courseId: string,
    studentData: {
      matric_no: string;
      name: string;
      email: string;
    }
  ) => Promise<void>;
  addBulkStudents: (
    courseId: string,
    students: {
      matric_no: string;
      name: string;
      email: string;
    }[]
  ) => Promise<any>;
  copyStudentsFromCourse: (
    sourceCourseId: string,
    targetCourseId: string
  ) => Promise<CopyStudentsResponse>;
  removeStudentFromCourse: (
    courseId: string,
    studentId: string
  ) => Promise<void>;
  bulkRemoveStudentsFromCourse: (
    courseId: string,
    studentIds: string[]
  ) => Promise<BulkDeleteResponse>;
  removeAllStudentsFromCourse: (
    courseId: string
  ) => Promise<DeleteAllStudentsResponse>;

  // Session Management Actions
  startAttendanceSession: (
    courseId: string,
    sessionData: {
      lat: number;
      lng: number;
      radius_m: number;
      duration_minutes: number;
    }
  ) => Promise<void>;
  getCourseSessions: (
    courseId: string,
    status?: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  endSessionEarly: (sessionId: string) => Promise<void>;

  // Reports & Analytics Actions
  getCourseStats: (courseId: string) => Promise<void>;

  // Utility Actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentCourse: (course: Course | null) => void;
}

// Helper function to check for success response
const isSuccessResponse = (response: ApiResponse): boolean => {
  return (
    response.success === true ||
    response.message?.toLowerCase().includes("success") ||
    response.message?.toLowerCase().includes("successful") ||
    Boolean(response.course) ||
    Boolean(response.courses) ||
    Boolean(response.students) ||
    Boolean(response.sessions) ||
    Boolean(response.session) ||
    Boolean(response.stats) ||
    Boolean(response.statistics) ||
    Boolean(response.recent_activity !== undefined)
  );
};

// Helper function for API calls with authentication
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
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
      errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      // Initial State
      courses: [],
      allCourses: [],
      currentCourse: null,
      students: [],
      sessions: [],
      currentSession: null,
      stats: null,
      pagination: null,
      isLoading: false,
      error: null,
      currentPage: 1,
      coursesPerPage: 8,
      totalStudents: 0,
      totalActiveSessions: 0,

      // Course Management Actions
      createCourse: async (courseData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/courses", {
            method: "POST",
            body: JSON.stringify(courseData),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            get().getAllCourses();
          } else {
            throw new Error(response.message || "Failed to create course");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create course",
            isLoading: false,
          });
          throw error;
        }
      },

      getAllCourses: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/courses?limit=1000");

          if (isSuccessResponse(response)) {
            const allCourses = response.courses || [];
            const { currentPage, coursesPerPage } = get();

            const totalStudents = allCourses.reduce(
              (sum: number, course: Course) => {
                return sum + (course.student_count || 0);
              },
              0
            );

            const totalActiveSessions = allCourses.reduce(
              (sum: number, course: Course) => {
                return sum + (course.active_sessions_count || 0);
              },
              0
            );

            const startIndex = (currentPage - 1) * coursesPerPage;
            const endIndex = startIndex + coursesPerPage;
            const displayedCourses = allCourses.slice(startIndex, endIndex);

            set({
              allCourses,
              courses: displayedCourses,
              totalStudents,
              totalActiveSessions,
              pagination: {
                currentPage,
                totalPages: Math.ceil(allCourses.length / coursesPerPage),
                totalCourses: allCourses.length,
                hasNext: endIndex < allCourses.length,
                hasPrev: currentPage > 1,
              },
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch courses");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch courses",
            isLoading: false,
          });
          throw error;
        }
      },

      getCourse: async (courseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}`);

          if (isSuccessResponse(response)) {
            const { course, students, sessions, statistics } = response;

            const studentsList = Array.isArray(students)
              ? students
              : students?.list || [];
            const sessionsList = Array.isArray(sessions)
              ? sessions
              : sessions?.recent || [];

            set({
              currentCourse: course || null,
              students: studentsList,
              sessions: sessionsList,
              stats: statistics
                ? {
                    total_sessions: statistics.total_sessions || 0,
                    active_sessions: statistics.active_sessions || 0,
                    total_students: statistics.total_students || 0,
                    total_attendance_records:
                      statistics.total_attendance_records || 0,
                    present_count: statistics.present_count || 0,
                    absent_count: statistics.absent_count || 0,
                    rejected_count: statistics.rejected_count || 0,
                    average_attendance_rate:
                      statistics.average_attendance_rate || 0,
                    last_session: statistics.last_session || "",
                    course_activity: statistics.course_activity || {
                      sessions_this_week: 0,
                      sessions_this_month: 0,
                    },
                    attendance_counts: {
                      present: statistics.present_count || 0,
                      absent: statistics.absent_count || 0,
                      rejected: statistics.rejected_count || 0,
                      total_submissions:
                        statistics.total_attendance_records || 0,
                    },
                  }
                : null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch course");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch course",
            isLoading: false,
          });
          throw error;
        }
      },

      updateCourse: async (courseId, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            get().getAllCourses();
          } else {
            throw new Error(response.message || "Failed to update course");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update course",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteCourse: async (courseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}`, {
            method: "DELETE",
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            get().getAllCourses();
          } else {
            throw new Error(response.message || "Failed to delete course");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete course",
            isLoading: false,
          });
          throw error;
        }
      },

      // Student Management Actions
      getCourseStudents: async (courseId, page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/students?page=${page}&limit=${limit}`
          );

          if (isSuccessResponse(response)) {
            const studentsList = Array.isArray(response.students)
              ? response.students
              : response.students?.list || [];
            set({
              students: studentsList,
              pagination: response.pagination || null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch students");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch students",
            isLoading: false,
          });
          throw error;
        }
      },

      addSingleStudent: async (courseId, studentData) => {
        set({ isLoading: true, error: null });
        try {
          const { currentCourse } = get();
          if (!currentCourse) {
            throw new Error("Course not found. Please reload the page.");
          }

          const response = await apiCall(`/courses/${courseId}/students`, {
            method: "POST",
            body: JSON.stringify({
              matric_no: studentData.matric_no.trim().toUpperCase(),
              name: studentData.name.trim(),
              email: studentData.email.trim().toLowerCase(),
              level: currentCourse.level,
            }),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Refresh course data
            await get().getCourse(courseId);
          } else {
            throw new Error(response.message || "Failed to add student");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add student",
            isLoading: false,
          });
          throw error;
        }
      },

      addBulkStudents: async (courseId, students) => {
        set({ isLoading: true, error: null });
        try {
          const { currentCourse } = get();
          if (!currentCourse) {
            throw new Error("Course not found. Please reload the page.");
          }

          // Add level to each student
          const studentsWithLevel = students.map((student) => ({
            ...student,
            level: currentCourse.level,
          }));

          const response = await apiCall(`/courses/${courseId}/students/bulk`, {
            method: "POST",
            body: JSON.stringify({ students: studentsWithLevel }),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Refresh course data
            await get().getCourse(courseId);
            return response;
          } else {
            throw new Error(response.message || "Failed to upload students");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload students",
            isLoading: false,
          });
          throw error;
        }
      },

      copyStudentsFromCourse: async (sourceCourseId, targetCourseId) => {
        set({ isLoading: true, error: null });
        try {
          const token = await getAuthToken();

          // Use direct fetch to handle special cases
          const response = await fetch(
            `${API_BASE_URL}/courses/${targetCourseId}/copy-students/${sourceCourseId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            }
          );

          const responseData = await response.json();

          // Handle 400 status with "No students found to copy" as special case
          if (!response.ok) {
            if (
              response.status === 400 &&
              responseData.error === "No students found to copy"
            ) {
              set({ isLoading: false });
              return {
                message: "No students to copy from this course",
                summary: {
                  total_processed: 0,
                  added: 0,
                  skipped: 0,
                },
                addedStudents: [],
                skippedStudents: [],
              };
            }

            throw new Error(
              responseData.message ||
                responseData.error ||
                `HTTP error! status: ${response.status}`
            );
          }

          set({ isLoading: false });
          // Refresh target course data
          await get().getCourse(targetCourseId);
          return responseData;
        } catch (error) {
          // If it's our custom "no students" case, don't set it as an error
          if (
            error instanceof Error &&
            error.message === "No students found to copy"
          ) {
            set({ isLoading: false });
            return {
              message: "No students to copy from this course",
              summary: {
                total_processed: 0,
                added: 0,
                skipped: 0,
              },
              addedStudents: [],
              skippedStudents: [],
            };
          }

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to copy students",
            isLoading: false,
          });
          throw error;
        }
      },

      removeStudentFromCourse: async (courseId, studentId) => {
        const currentStudents = get().students;
        const optimisticStudents = currentStudents.filter(
          (student) => student._id !== studentId
        );
        set({ students: optimisticStudents });

        try {
          const response = await apiCall(
            `/courses/${courseId}/students/${studentId}`,
            {
              method: "DELETE",
            }
          );

          if (!isSuccessResponse(response)) {
            set({ students: currentStudents });
            throw new Error(response.message || "Failed to remove student");
          }
        } catch (error) {
          set({ students: currentStudents });
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to remove student",
          });
          throw error;
        }
      },

      bulkRemoveStudentsFromCourse: async (courseId, studentIds) => {
        set({ isLoading: true });

        try {
          const response = await apiCall(`/courses/${courseId}/students/bulk`, {
            method: "DELETE",
            body: JSON.stringify({ student_ids: studentIds }),
          });

          const isBulkDeleteSuccess =
            response.summary &&
            response.results &&
            response.summary.successful >= 0 &&
            typeof response.summary.total_processed === "number";

          if (isSuccessResponse(response) || isBulkDeleteSuccess) {
            // Remove successfully deleted students from local state
            const currentStudents = get().students;
            const deletedStudentIds =
              response.results?.successful?.map((s: any) => s.student_id) || [];
            const updatedStudents = currentStudents.filter(
              (student) => !deletedStudentIds.includes(student._id)
            );
            set({ students: updatedStudents });

            return response as BulkDeleteResponse;
          } else {
            throw new Error(
              response.message || "Failed to bulk remove students"
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to bulk remove students",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeAllStudentsFromCourse: async (courseId) => {
        set({ isLoading: true });

        try {
          const response = await apiCall(`/courses/${courseId}/students/all`, {
            method: "DELETE",
          });

          const isDeleteAllSuccess =
            response.summary &&
            typeof response.summary.total_students_removed === "number";

          if (isSuccessResponse(response) || isDeleteAllSuccess) {
            // Clear all students from local state
            set({ students: [] });

            return response as DeleteAllStudentsResponse;
          } else {
            throw new Error(
              response.message || "Failed to remove all students"
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to remove all students",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Session Management Actions
      startAttendanceSession: async (courseId, sessionData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}/sessions`, {
            method: "POST",
            body: JSON.stringify(sessionData),
          });

          if (isSuccessResponse(response)) {
            set({
              currentSession: response.session || null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to start session");
          }
        } catch (error) {
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

      getCourseSessions: async (
        courseId,
        status = "active",
        page = 1,
        limit = 20
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/sessions?status=${status}&page=${page}&limit=${limit}`
          );

          if (isSuccessResponse(response)) {
            const sessionsList = Array.isArray(response.sessions)
              ? response.sessions
              : response.sessions?.recent || [];
            set({
              sessions: sessionsList,
              pagination: response.pagination || null,
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

      endSessionEarly: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/sessions/${sessionId}/end`, {
            method: "PATCH",
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
          } else {
            throw new Error(response.message || "Failed to end session");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to end session",
            isLoading: false,
          });
          throw error;
        }
      },

      // Reports & Analytics Actions
      getCourseStats: async (courseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/attendance/course/${courseId}/stats`
          );

          if (isSuccessResponse(response)) {
            const statsData = response.statistics || response.stats || null;
            set({
              stats: statsData,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch course stats");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch course stats",
            isLoading: false,
          });
          throw error;
        }
      },

      // Utility Actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setCurrentCourse: (course: Course | null) =>
        set({ currentCourse: course }),

      // Client-side pagination methods
      setCurrentPage: (page: number) => {
        const { allCourses, coursesPerPage } = get();
        const startIndex = (page - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        const displayedCourses = allCourses.slice(startIndex, endIndex);

        const totalStudents = allCourses.reduce((sum, course) => {
          return sum + (course.student_count || 0);
        }, 0);

        const totalActiveSessions = allCourses.reduce((sum, course) => {
          return sum + (course.active_sessions_count || 0);
        }, 0);

        set({
          currentPage: page,
          courses: displayedCourses,
          totalStudents,
          totalActiveSessions,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(allCourses.length / coursesPerPage),
            totalCourses: allCourses.length,
            hasNext: endIndex < allCourses.length,
            hasPrev: page > 1,
          },
        });
      },
      getDisplayedCourses: () => {
        const { allCourses, currentPage, coursesPerPage } = get();
        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        return allCourses.slice(startIndex, endIndex);
      },

      getTotalPages: () => {
        const { allCourses, coursesPerPage } = get();
        return Math.ceil(allCourses.length / coursesPerPage);
      },
    }),
    {
      name: "course-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        courses: state.courses,
        allCourses: state.allCourses,
        currentCourse: state.currentCourse,
        currentPage: state.currentPage,
        coursesPerPage: state.coursesPerPage,
        totalStudents: state.totalStudents,
        totalActiveSessions: state.totalActiveSessions,
      }),
    }
  )
);
