import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import useTranslationStore, {
  LanguageCode,
  SUPPORTED_LANGUAGES,
} from "../store/useTranslationStore";

/**
 * Beautiful language selector with smooth animations
 * Glassmorphism design with Tailwind styling
 */
export default function LanguageSelector() {
  const { language, setLanguage } = useTranslationStore();
  const [isOpen, setIsOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const currentLanguage = SUPPORTED_LANGUAGES[language];

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleLanguageSelect = async (lang: LanguageCode) => {
    await setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <View className="relative">
      {/* Trigger Button - Glassmorphism Style */}
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        className="flex-row items-center bg-white/20 backdrop-blur-xl rounded-full px-4 py-2.5 border border-white/30 active:bg-white/30"
      >
        <View className="w-6 h-6 rounded-full bg-white/30 items-center justify-center mr-2">
          <Ionicons name="language" size={16} color="#fff" />
        </View>
        <Text className="text-white font-semibold text-sm">
          {currentLanguage.nativeName}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={14}
          color="#fff"
          style={{ marginLeft: 6 }}
        />
      </Pressable>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop - Click outside to close */}
          <Pressable
            onPress={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: -100,
              left: -500,
              right: -500,
              bottom: -500,
              zIndex: 10,
            }}
          />

          {/* Menu with Animation */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
            className="absolute top-full mt-3 right-0 bg-black backdrop-blur-2xl rounded-3xl border border-white/10 z-20 min-w-[200px] shadow-2xl overflow-hidden"
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang], index) => (
              <Pressable
                key={code}
                onPress={() => handleLanguageSelect(code as LanguageCode)}
                className={`px-5 py-4 flex-row items-center justify-between active:bg-white/10 ${
                  language === code ? "bg-white/5" : ""
                } ${index !== Object.keys(SUPPORTED_LANGUAGES).length - 1 ? "border-b border-white/5" : ""}`}
              >
                <View className="flex-1">
                  <Text
                    className={`font-bold text-base ${
                      language === code ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {lang.nativeName}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {lang.name}
                  </Text>
                </View>
                {language === code && (
                  <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center ml-3">
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}
    </View>
  );
}
