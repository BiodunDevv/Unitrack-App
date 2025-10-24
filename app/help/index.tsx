import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";
import { useHelpStore } from "../../store/useHelpStore";

export default function HelpPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    faqs,
    categories,
    supportInfo,
    isLoading,
    getAllFAQs,
    getFAQCategories,
    getSupportInfo,
  } = useHelpStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"faq" | "support">("faq");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      getAllFAQs();
      getFAQCategories();
      getSupportInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter((faq) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower) ||
      faq.category.toLowerCase().includes(searchLower) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchLower));
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleContactSupport = async () => {
    const email = "support@unitrack.com";
    const subject = encodeURIComponent("Support Request - UniTrack App");
    const body = encodeURIComponent(
      `Hello Support Team,\n\nName: ${user?.name || ""}\nEmail: ${user?.email || ""}\n\nPlease describe your issue:\n\n`
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Toast.show({
          type: "error",
          text1: "Cannot open email",
          text2: "Please contact support@unitrack.com",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Error opening email",
        text2: "Please contact support@unitrack.com",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: "bg-blue-100",
      attendance: "bg-green-100",
      security: "bg-red-100",
      reports: "bg-purple-100",
      support: "bg-orange-100",
      general: "bg-gray-100",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryTextColor = (category: string) => {
    const colors = {
      technical: "text-blue-800",
      attendance: "text-green-800",
      security: "text-red-800",
      reports: "text-purple-800",
      support: "text-orange-800",
      general: "text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100",
      medium: "bg-yellow-100",
      high: "bg-orange-100",
      urgent: "bg-red-100",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityTextColor = (priority: string) => {
    const colors = {
      low: "text-gray-800",
      medium: "text-yellow-800",
      high: "text-orange-800",
      urgent: "text-red-800",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="bg-white" edges={["top"]} />
      <StatusBar style="dark" />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center mb-3">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3 active:bg-gray-200"
            >
              <Ionicons name="arrow-back" size={20} color="#000000" />
            </Pressable>
            <Text className="text-black text-xl font-bold flex-1">
              Help & Support
            </Text>
          </View>

          {/* Tab Selector */}
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            <Pressable
              onPress={() => setActiveTab("faq")}
              className={`flex-1 py-2 rounded-md ${
                activeTab === "faq" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  activeTab === "faq" ? "text-black" : "text-gray-500"
                }`}
              >
                FAQ
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("support")}
              className={`flex-1 py-2 rounded-md ${
                activeTab === "support" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  activeTab === "support" ? "text-black" : "text-gray-500"
                }`}
              >
                Support Info
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {activeTab === "faq" ? (
            <View className="p-4">
              {/* Stats Cards */}
              <View className="flex-row mb-4 gap-2">
                <View className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                  <Text className="text-2xl font-bold text-black mt-2">
                    {faqs.length}
                  </Text>
                  <Text className="text-xs text-gray-500">Total FAQs</Text>
                </View>
                <View className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <Ionicons name="bookmark-outline" size={20} color="#9CA3AF" />
                  <Text className="text-2xl font-bold text-black mt-2">
                    {categories.length}
                  </Text>
                  <Text className="text-xs text-gray-500">Categories</Text>
                </View>
              </View>

              {/* Search Bar */}
              <View className="bg-white rounded-lg border border-gray-200 mb-3">
                <View className="flex-row items-center px-3 py-2">
                  <Ionicons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-base text-black"
                    placeholder="Search FAQs..."
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

              {/* Category Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <Pressable
                  onPress={() => setSelectedCategory("all")}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    selectedCategory === "all"
                      ? "bg-black"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === "all"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    All ({faqs.length})
                  </Text>
                </Pressable>
                {categories.map((category) => (
                  <Pressable
                    key={category.category}
                    onPress={() => setSelectedCategory(category.category)}
                    className={`mr-2 px-4 py-2 rounded-full ${
                      selectedCategory === category.category
                        ? "bg-black"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedCategory === category.category
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {category.category} ({category.count})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* FAQ List */}
              {isLoading ? (
                <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="text-gray-500 mt-4">Loading FAQs...</Text>
                </View>
              ) : filteredFAQs.length === 0 ? (
                <View className="bg-white rounded-lg p-12 items-center border border-gray-200">
                  <Ionicons
                    name="help-circle-outline"
                    size={48}
                    color="#D1D5DB"
                  />
                  <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                    No FAQs Found
                  </Text>
                  <Text className="text-sm text-gray-500 text-center">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filter"
                      : "No FAQs available at the moment"}
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {filteredFAQs.map((faq) => (
                    <View
                      key={faq._id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <Pressable
                        onPress={() =>
                          setExpandedFAQ(
                            expandedFAQ === faq._id ? null : faq._id
                          )
                        }
                        className="p-4"
                      >
                        <View className="flex-row items-start justify-between mb-2">
                          <View
                            className={`px-2 py-1 rounded ${getCategoryColor(
                              faq.category
                            )}`}
                          >
                            <Text
                              className={`text-xs font-semibold ${getCategoryTextColor(
                                faq.category
                              )}`}
                            >
                              {faq.category}
                            </Text>
                          </View>
                          <Ionicons
                            name={
                              expandedFAQ === faq._id
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={20}
                            color="#9CA3AF"
                          />
                        </View>

                        <Text className="text-base font-semibold text-black mb-2">
                          {faq.question}
                        </Text>

                        {expandedFAQ === faq._id && (
                          <>
                            <Text className="text-sm text-gray-600 mb-3 leading-5">
                              {faq.answer}
                            </Text>

                            {/* Tags */}
                            <View className="flex-row flex-wrap gap-2 mb-3">
                              {faq.tags.map((tag) => (
                                <View
                                  key={tag}
                                  className="bg-gray-100 px-2 py-1 rounded"
                                >
                                  <Text className="text-xs text-gray-700">
                                    {tag}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* Footer */}
                            <View className="pt-3 border-t border-gray-100 flex-row justify-between">
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="eye-outline"
                                  size={14}
                                  color="#9CA3AF"
                                />
                                <Text className="text-xs text-gray-500 ml-1">
                                  {faq.view_count} views
                                </Text>
                              </View>
                              <Text className="text-xs text-gray-500">
                                {new Date(
                                  faq.last_updated
                                ).toLocaleDateString()}
                              </Text>
                            </View>
                          </>
                        )}
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            /* Support Info Tab */
            <View className="p-4">
              {supportInfo && (
                <View className="gap-4">
                  {/* Support Categories */}
                  <View className="bg-white rounded-lg p-4 border border-gray-200">
                    <Text className="text-lg font-bold text-black mb-1">
                      Support Categories
                    </Text>
                    <Text className="text-sm text-gray-500 mb-4">
                      Available support categories for your requests
                    </Text>
                    <View className="gap-3">
                      {Object.entries(supportInfo.categories).map(
                        ([key, value]) => (
                          <View key={key} className="flex-row items-center">
                            <View
                              className={`px-2 py-1 rounded ${getCategoryColor(
                                key
                              )} mr-2`}
                            >
                              <Text
                                className={`text-xs font-semibold ${getCategoryTextColor(
                                  key
                                )}`}
                              >
                                {key}
                              </Text>
                            </View>
                            <Text className="text-sm text-gray-700 flex-1">
                              {value}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>

                  {/* Priority Levels */}
                  <View className="bg-white rounded-lg p-4 border border-gray-200">
                    <Text className="text-lg font-bold text-black mb-1">
                      Priority Levels
                    </Text>
                    <Text className="text-sm text-gray-500 mb-4">
                      Choose the appropriate priority for your request
                    </Text>
                    <View className="gap-3">
                      {Object.entries(supportInfo.priorities).map(
                        ([key, value]) => (
                          <View key={key} className="flex-row items-center">
                            <View
                              className={`px-2 py-1 rounded ${getPriorityColor(
                                key
                              )} mr-2`}
                            >
                              <Text
                                className={`text-xs font-semibold ${getPriorityTextColor(
                                  key
                                )}`}
                              >
                                {key}
                              </Text>
                            </View>
                            <Text className="text-sm text-gray-700 flex-1">
                              {value}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>

                  {/* Support Guidelines */}
                  <View className="bg-white rounded-lg p-4 border border-gray-200">
                    <Text className="text-lg font-bold text-black mb-1">
                      Support Guidelines
                    </Text>
                    <Text className="text-sm text-gray-500 mb-4">
                      Best practices for getting help quickly
                    </Text>
                    <View className="gap-3">
                      {supportInfo.guidelines.map((guideline, index) => (
                        <View key={index} className="flex-row">
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#000000"
                            style={{ marginRight: 8, marginTop: 2 }}
                          />
                          <Text className="text-sm text-gray-700 flex-1">
                            {guideline}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Contact Support Button */}
                  <Pressable
                    onPress={handleContactSupport}
                    className="bg-black rounded-lg p-4 active:bg-gray-800"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-white text-base font-semibold">
                        Contact Support
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          <View className="h-6" />
        </ScrollView>
      </View>
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </View>
  );
}
