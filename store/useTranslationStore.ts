import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// Storage keys
const TRANSLATIONS_CACHE_KEY = "@unitrack_translations_cache";
const LANGUAGE_KEY = "@unitrack_selected_language";

// Microsoft Translator API configuration
const TRANSLATOR_API_KEY = process.env.EXPO_PUBLIC_TRANSLATOR_API_KEY;
const TRANSLATOR_REGION = process.env.EXPO_PUBLIC_TRANSLATOR_REGION;
const TRANSLATOR_ENDPOINT = process.env.EXPO_PUBLIC_TRANSLATOR_ENDPOINT;

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { code: "en", name: "English", nativeName: "English" },
  yo: { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  ig: { code: "ig", name: "Igbo", nativeName: "Igbo" },
  ha: { code: "ha", name: "Hausa", nativeName: "Hausa" },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

interface TranslationState {
  // Current selected language
  language: LanguageCode;

  // Cache of translations: { "text|lang": "translated_text" }
  translationsCache: Record<string, string>;

  // Loading state
  isTranslating: boolean;
  isFetchingLanguage: boolean;

  // Error state
  error: string | null;

  // Pending translations to avoid duplicate API calls
  pendingTranslations: Set<string>;

  // Actions
  initialize: () => Promise<void>;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  getCachedTranslation: (
    text: string,
    targetLang: LanguageCode
  ) => string | null;
  saveCachedTranslation: (
    text: string,
    targetLang: LanguageCode,
    translation: string
  ) => Promise<void>;
  translateText: (
    text: string,
    targetLang?: LanguageCode | null
  ) => Promise<string>;
  translateBatch: (
    texts: string[],
    targetLang?: LanguageCode | null
  ) => Promise<string[]>;
  clearCache: () => Promise<void>;
  getCacheSize: () => number;
}

/**
 * Zustand store for managing translations with Microsoft Translator API
 * Features:
 * - Caches translations locally using AsyncStorage
 * - Prevents duplicate API calls
 * - Supports four languages: English, Yoruba, Igbo, Hausa
 * - Shows loading toast when fetching translations
 * - Handles errors gracefully
 */
const useTranslationStore = create<TranslationState>((set, get) => ({
  // Initial state
  language: "en",
  translationsCache: {},
  isTranslating: false,
  isFetchingLanguage: false,
  error: null,
  pendingTranslations: new Set(),

  /**
   * Initialize the translator store
   * Loads cached translations and saved language preference
   */
  initialize: async () => {
    try {
      // Load saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
        set({ language: savedLanguage as LanguageCode });
      }

      // Load cached translations
      const cachedTranslations = await AsyncStorage.getItem(
        TRANSLATIONS_CACHE_KEY
      );
      if (cachedTranslations) {
        set({ translationsCache: JSON.parse(cachedTranslations) });
      }
    } catch (error) {
      console.error("❌ Error initializing translator:", error);
      set({ error: "Failed to initialize translator" });
    }
  },

  /**
   * Set the selected language
   * @param lang - Language code (en, yo, ig, ha)
   */
  setLanguage: async (lang: LanguageCode) => {
    try {
      set({ isFetchingLanguage: true, error: null });
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      set({ language: lang, isFetchingLanguage: false });
    } catch (error) {
      console.error("❌ Error setting language:", error);
      set({ error: "Failed to set language", isFetchingLanguage: false });
    }
  },

  /**
   * Get cached translation if available
   * @param text - Text to translate
   * @param targetLang - Target language code
   * @returns Cached translation or null
   */
  getCachedTranslation: (text: string, targetLang: LanguageCode) => {
    const cacheKey = `${text}|${targetLang}`;
    return get().translationsCache[cacheKey] || null;
  },

  /**
   * Save translation to cache
   * @param text - Original text
   * @param targetLang - Target language code
   * @param translation - Translated text
   */
  saveCachedTranslation: async (
    text: string,
    targetLang: LanguageCode,
    translation: string
  ) => {
    const cacheKey = `${text}|${targetLang}`;
    const updatedCache = {
      ...get().translationsCache,
      [cacheKey]: translation,
    };

    set({ translationsCache: updatedCache });

    try {
      await AsyncStorage.setItem(
        TRANSLATIONS_CACHE_KEY,
        JSON.stringify(updatedCache)
      );
    } catch (error) {
      console.error("❌ Error saving translation to cache:", error);
    }
  },

  /**
   * Translate text using Microsoft Translator API
   * @param text - Text to translate
   * @param targetLang - Target language code (optional, uses current language if not provided)
   * @returns Translated text
   */
  translateText: async (
    text: string,
    targetLang: LanguageCode | null = null
  ) => {
    // If no text provided, return empty string
    if (!text || text.trim() === "") {
      return "";
    }

    // Use current language if no target language specified
    const toLang = targetLang || get().language;

    // If target language is English, return original text
    if (toLang === "en") {
      return text;
    }

    // Check cache first
    const cachedTranslation = get().getCachedTranslation(text, toLang);
    if (cachedTranslation) {
      return cachedTranslation;
    }

    // Check if this translation is already pending
    const cacheKey = `${text}|${toLang}`;
    if (get().pendingTranslations.has(cacheKey)) {
      // Wait for pending translation to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const cached = get().getCachedTranslation(text, toLang);
          if (cached) {
            clearInterval(checkInterval);
            resolve(cached);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn("⚠️ Translation timeout, returning original text");
          resolve(text);
        }, 10000);
      });
    }

    // Add to pending translations
    set((state) => ({
      pendingTranslations: new Set(state.pendingTranslations).add(cacheKey),
      isTranslating: true,
      isFetchingLanguage: true,
    }));

    console.log(
      `🌐 Fetching translation for: "${text.substring(0, 30)}..." to ${SUPPORTED_LANGUAGES[toLang].name}`
    );

    try {
      set({ error: null });

      // Call Microsoft Translator API
      const response = await fetch(
        `${TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${toLang}`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": TRANSLATOR_API_KEY!,
            "Ocp-Apim-Subscription-Region": TRANSLATOR_REGION!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([{ text }]),
        }
      );

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data[0]?.translations[0]?.text || text;

      // Save to cache
      await get().saveCachedTranslation(text, toLang, translatedText);

      // Remove from pending translations
      set((state) => {
        const newPending = new Set(state.pendingTranslations);
        newPending.delete(cacheKey);
        return {
          pendingTranslations: newPending,
          isTranslating: newPending.size > 0,
          isFetchingLanguage: false,
        };
      });

      return translatedText;
    } catch (error) {
      console.error("❌ Translation error:", error);
      set({
        error: "Failed to translate text",
        isTranslating: false,
        isFetchingLanguage: false,
      });

      // Remove from pending translations
      set((state) => {
        const newPending = new Set(state.pendingTranslations);
        newPending.delete(cacheKey);
        return { pendingTranslations: newPending };
      });

      // Return original text on error
      return text;
    }
  },

  /**
   * Translate multiple texts in batch
   * @param texts - Array of texts to translate
   * @param targetLang - Target language code (optional)
   * @returns Array of translated texts
   */
  translateBatch: async (
    texts: string[],
    targetLang: LanguageCode | null = null
  ) => {
    const toLang = targetLang || get().language;

    // If target language is English, return original texts
    if (toLang === "en") {
      return texts;
    }

    const translations = await Promise.all(
      texts.map((text) => get().translateText(text, toLang))
    );

    return translations;
  },

  /**
   * Clear all cached translations
   */
  clearCache: async () => {
    try {
      await AsyncStorage.removeItem(TRANSLATIONS_CACHE_KEY);
      set({ translationsCache: {}, error: null });
      console.log("🗑️ Translation cache cleared");
    } catch (error) {
      console.error("❌ Error clearing translation cache:", error);
      set({ error: "Failed to clear cache" });
    }
  },

  /**
   * Get cache size for debugging
   * @returns Number of cached translations
   */
  getCacheSize: () => {
    return Object.keys(get().translationsCache).length;
  },
}));

export default useTranslationStore;
