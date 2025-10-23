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
export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  display_order: number;
  tags: string[];
  created_by: {
    _id: string;
    name: string;
  };
  view_count: number;
  last_updated: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQCategory {
  category: string;
  description: string;
  count: number;
  latest_update: string;
}

export interface SupportInfo {
  categories: Record<string, string>;
  priorities: Record<string, string>;
  guidelines: string[];
  contact_tips: string[];
}

export interface ContactRequest {
  name: string;
  email: string;
  user_type: "student" | "teacher" | "admin";
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  message: string;
  phone?: string;
}

export interface CreateFAQData {
  question: string;
  answer: string;
  category: string;
  display_order?: number;
  tags?: string[];
}

interface HelpState {
  // FAQ State
  faqs: FAQ[];
  categories: FAQCategory[];
  currentFAQ: FAQ | null;
  supportInfo: SupportInfo | null;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // FAQ Actions
  getAllFAQs: (
    page?: number,
    limit?: number,
    category?: string,
    search?: string
  ) => Promise<void>;
  getFAQCategories: () => Promise<void>;
  getFAQ: (faqId: string) => Promise<void>;
  createFAQ: (faqData: CreateFAQData) => Promise<void>;
  updateFAQ: (faqId: string, faqData: Partial<CreateFAQData>) => Promise<void>;
  deleteFAQ: (faqId: string) => Promise<void>;

  // Support Actions
  getSupportInfo: () => Promise<void>;
  submitContactRequest: (request: ContactRequest) => Promise<void>;

  // Utility Actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to check for success response
const isSuccessResponse = (response: any): boolean => {
  return (
    response.success === true ||
    response.message?.toLowerCase().includes("success")
  );
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

export const useHelpStore = create<HelpState>()(
  persist(
    (set, get) => ({
      // Initial State with sample FAQs
      faqs: [
        {
          _id: "1",
          question: "How do I mark attendance?",
          answer:
            "To mark attendance, open the session and click the 'Mark Attendance' button. Make sure you're within the session radius.",
          category: "attendance",
          is_active: true,
          display_order: 1,
          tags: ["attendance", "session", "mark"],
          created_by: { _id: "admin", name: "Admin" },
          view_count: 45,
          last_updated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "2",
          question: "What should I do if I can't access the system?",
          answer:
            "If you can't access the system, try clearing your app cache, check your internet connection, or contact technical support.",
          category: "technical",
          is_active: true,
          display_order: 2,
          tags: ["technical", "access", "login", "troubleshooting"],
          created_by: { _id: "admin", name: "Admin" },
          view_count: 32,
          last_updated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "3",
          question: "How do I generate attendance reports?",
          answer:
            "Go to your course dashboard, select the session, and tap 'Download Report'. You can choose between detailed PDF or summary formats.",
          category: "reports",
          is_active: true,
          display_order: 3,
          tags: ["reports", "pdf", "download", "attendance"],
          created_by: { _id: "admin", name: "Admin" },
          view_count: 28,
          last_updated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "4",
          question: "How do I reset my password?",
          answer:
            "Tap 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your email.",
          category: "security",
          is_active: true,
          display_order: 4,
          tags: ["password", "reset", "security", "login"],
          created_by: { _id: "admin", name: "Admin" },
          view_count: 67,
          last_updated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      categories: [
        {
          category: "attendance",
          description: "Attendance related questions",
          count: 1,
          latest_update: new Date().toISOString(),
        },
        {
          category: "technical",
          description: "Technical support questions",
          count: 1,
          latest_update: new Date().toISOString(),
        },
        {
          category: "reports",
          description: "Report generation and download",
          count: 1,
          latest_update: new Date().toISOString(),
        },
        {
          category: "security",
          description: "Security and access questions",
          count: 1,
          latest_update: new Date().toISOString(),
        },
      ],
      currentFAQ: null,
      supportInfo: {
        categories: {
          technical: "Technical issues and bugs",
          attendance: "Attendance tracking problems",
          security: "Security and access issues",
          reports: "Report generation and downloads",
          general: "General inquiries",
        },
        priorities: {
          low: "General questions, not urgent",
          medium: "Important but not blocking work",
          high: "Blocking work, needs attention",
          urgent: "Critical issue, immediate help needed",
        },
        guidelines: [
          "Provide detailed description of the issue",
          "Include screenshots if possible",
          "Mention the course code if relevant",
          "Check FAQ before contacting support",
          "Response time varies by priority level",
        ],
        contact_tips: [
          "Use clear and concise language",
          "Provide steps to reproduce the issue",
          "Include device and app version info",
        ],
      },
      isLoading: false,
      isSubmitting: false,
      error: null,

      // FAQ Actions
      getAllFAQs: async (page = 1, limit = 100, category, search) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(category && { category }),
            ...(search && { search }),
          });

          const response = await apiCall(`/faq?${params}`);

          if (isSuccessResponse(response)) {
            set({
              faqs: response.data?.faqs || response.faqs || get().faqs,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch FAQs");
          }
        } catch (error) {
          console.error("FAQ Fetch Error:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch FAQs",
            isLoading: false,
          });
          // Keep sample FAQs on error
        }
      },

      getFAQCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/faq/categories");

          if (isSuccessResponse(response)) {
            set({
              categories: response.data.categories || get().categories,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch categories");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch categories",
            isLoading: false,
          });
        }
      },

      getFAQ: async (faqId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/faq/${faqId}`);

          if (isSuccessResponse(response)) {
            set({
              currentFAQ: response.data.faq,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch FAQ");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch FAQ",
            isLoading: false,
          });
          throw error;
        }
      },

      createFAQ: async (faqData) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await apiCall("/faq", {
            method: "POST",
            body: JSON.stringify(faqData),
          });

          if (isSuccessResponse(response)) {
            set({ isSubmitting: false });
            // Refresh FAQs list
            get().getAllFAQs();
          } else {
            throw new Error(response.message || "Failed to create FAQ");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create FAQ",
            isSubmitting: false,
          });
          throw error;
        }
      },

      updateFAQ: async (faqId, faqData) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await apiCall(`/faq/${faqId}`, {
            method: "PUT",
            body: JSON.stringify(faqData),
          });

          if (isSuccessResponse(response)) {
            set({ isSubmitting: false });
            // Refresh FAQs list
            get().getAllFAQs();
          } else {
            throw new Error(response.message || "Failed to update FAQ");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update FAQ",
            isSubmitting: false,
          });
          throw error;
        }
      },

      deleteFAQ: async (faqId) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await apiCall(`/faq/${faqId}`, {
            method: "DELETE",
          });

          if (isSuccessResponse(response)) {
            set({ isSubmitting: false });
            // Refresh FAQs list
            get().getAllFAQs();
          } else {
            throw new Error(response.message || "Failed to delete FAQ");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete FAQ",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Support Actions
      getSupportInfo: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/support/info");

          if (isSuccessResponse(response)) {
            set({
              supportInfo: response.data,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch support info");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch support info",
            isLoading: false,
          });
          // Keep default supportInfo
        }
      },

      submitContactRequest: async (request) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await apiCall("/support/contact", {
            method: "POST",
            body: JSON.stringify(request),
          });

          if (isSuccessResponse(response)) {
            set({ isSubmitting: false });
          } else {
            throw new Error(
              response.message || "Failed to submit contact request"
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to submit contact request",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Utility Actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "help-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        faqs: state.faqs,
        categories: state.categories,
        supportInfo: state.supportInfo,
      }),
    }
  )
);
