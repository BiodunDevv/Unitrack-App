import { useEffect, useState } from "react";
import useTranslationStore from "../store/useTranslationStore";

/**
 * Custom hook for easy translation in components
 * Usage: const t = useTranslation();
 * Then: <Text>{t("Hello World")}</Text>
 */
export function useTranslation() {
  const { translateText, language } = useTranslationStore();

  const t = async (text: string) => {
    return await translateText(text);
  };

  return { t, language };
}

/**
 * Hook for translating text with automatic re-rendering when language changes
 * Usage: const translatedText = useTranslatedText("Hello World");
 */
export function useTranslatedText(text: string): string {
  const { translateText, language } = useTranslationStore();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const translate = async () => {
      const result = await translateText(text);
      setTranslatedText(result);
    };

    translate();
  }, [text, language, translateText]);

  return translatedText;
}

/**
 * Hook for translating multiple texts
 * Usage: const [text1, text2] = useTranslatedTexts(["Hello", "World"]);
 */
export function useTranslatedTexts(texts: string[]): string[] {
  const { translateBatch, language } = useTranslationStore();
  const [translatedTexts, setTranslatedTexts] = useState(texts);

  useEffect(() => {
    const translate = async () => {
      const results = await translateBatch(texts);
      setTranslatedTexts(results);
    };

    translate();
  }, [texts.join(","), language]);

  return translatedTexts;
}
