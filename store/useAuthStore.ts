import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://localhost:3000";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
  isVerified: boolean;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  registrationToken: string | null;
  verificationToken: string | null;
  isAuthenticated: boolean;

  // Actions
  registerTeacher: (data: RegisterTeacherData) => Promise<void>;
  verifyRegistration: (registrationToken: string, otp: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  requestVerificationCode: (
    email: string,
    verificationToken?: string
  ) => Promise<void>;
  verifyEmail: (verificationToken: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordResetOTP: (email: string) => Promise<void>;
  verifyOTPAndResetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  clearTokens: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

interface RegisterTeacherData {
  name: string;
  email: string;
  password: string;
  role: "teacher";
}

interface ApiResponse<T = any> {
  message: string;
  data?: T;
  user?: User;
  token?: string;
  registrationToken?: string;
  verificationToken?: string;
  userType?: string;
  success?: boolean;
  error?: string;
}

// Helper function to check if API response indicates success
const isSuccessResponse = (response: ApiResponse): boolean => {
  return (
    response.success === true ||
    response.message?.toLowerCase().includes("success") ||
    response.message?.toLowerCase().includes("successful") ||
    response.message?.toLowerCase().includes("otp has been sent") ||
    response.message?.toLowerCase().includes("if the email exists") ||
    Boolean(response.token) ||
    Boolean(response.registrationToken) ||
    Boolean(response.verificationToken)
  );
};

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: true,
      error: null,
      registrationToken: null,
      verificationToken: null,
      isAuthenticated: false,

      // Check authentication on app load
      checkAuth: async () => {
        const token = get().token;
        const user = get().user;
        if (token && user) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      },

      // Actions
      registerTeacher: async (data: RegisterTeacherData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE_URL}/auth/register_teacher`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          );

          const responseData = await response.json();
          console.log("Registration response:", responseData);

          if (response.ok) {
            if (
              responseData.registrationToken ||
              responseData.message?.includes("success")
            ) {
              set({
                registrationToken: responseData.registrationToken,
                isLoading: false,
              });
            } else {
              throw new Error(responseData.message || "Registration failed");
            }
          } else {
            const errorMessage =
              responseData.error ||
              responseData.message ||
              "Registration failed";
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw new Error(errorMessage);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      verifyRegistration: async (registrationToken: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/auth/verify_registration", {
            method: "POST",
            body: JSON.stringify({ registrationToken, otp }),
          });

          if (isSuccessResponse(response)) {
            set({
              registrationToken: null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Verification failed");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();
          console.log("Login response:", { status: response.status, data });

          if (response.ok) {
            if (data.token && data.user) {
              set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              throw new Error(data.message || "Login failed");
            }
          } else {
            if (data.error === "Email not verified" && data.verificationToken) {
              set({
                verificationToken: data.verificationToken,
                error: data.error,
                isLoading: false,
              });
            } else {
              set({
                error: data.error || data.message || "Login failed",
                isLoading: false,
              });
              throw new Error(data.error || data.message || "Login failed");
            }
          }
        } catch (error) {
          console.error("Login error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      requestVerificationCode: async (
        email: string,
        verificationToken?: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/auth/request_verification_code", {
            method: "POST",
            body: JSON.stringify({
              email,
              verificationToken: verificationToken || get().verificationToken,
            }),
          });

          if (isSuccessResponse(response)) {
            set({
              verificationToken:
                response.verificationToken || get().verificationToken,
              isLoading: false,
            });
          } else {
            throw new Error(
              response.message || "Failed to request verification code"
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to request verification code",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyEmail: async (verificationToken: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/auth/verify_email", {
            method: "POST",
            body: JSON.stringify({ verificationToken, otp }),
          });

          if (isSuccessResponse(response)) {
            if (response.token && response.user) {
              set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                verificationToken: null,
                isLoading: false,
              });
            } else {
              set({
                verificationToken: null,
                isLoading: false,
              });
            }
          } else {
            throw new Error(response.message || "Email verification failed");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Email verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token;
          if (token) {
            await apiCall("/auth/logout", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            registrationToken: null,
            verificationToken: null,
            isLoading: false,
            error: null,
          });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            registrationToken: null,
            verificationToken: null,
            isLoading: false,
            error: null,
          });
        }
      },

      requestPasswordResetOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/auth/request_otp", {
            method: "POST",
            body: JSON.stringify({ email, purpose: "password_reset" }),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
          } else {
            throw new Error(
              response.message || "Failed to request password reset"
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to request password reset",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyOTPAndResetPassword: async (
        email: string,
        otp: string,
        newPassword: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/auth/verify_otp", {
            method: "POST",
            body: JSON.stringify({
              email,
              otp,
              purpose: "password_reset",
              newPassword,
            }),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
          } else {
            throw new Error(response.message || "Password reset failed");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Password reset failed",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      clearTokens: () =>
        set({
          registrationToken: null,
          verificationToken: null,
        }),

      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = Boolean(state.user && state.token);
          state.isLoading = false;
        }
      },
    }
  )
);

export type { RegisterTeacherData, User };
