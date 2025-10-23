import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const tabWidth = SCREEN_WIDTH / state.routes.length;

  // Animated value for sliding indicator
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [state.index, tabWidth, slideAnim]);

  const getIconName = (
    routeName: string,
    focused: boolean
  ): {
    type: "ionicons" | "material";
    name: string;
  } => {
    const icons: Record<
      string,
      { type: "ionicons" | "material"; focused: string; unfocused: string }
    > = {
      index: {
        type: "ionicons",
        focused: "home",
        unfocused: "home-outline",
      },
      Courses: {
        type: "ionicons",
        focused: "book",
        unfocused: "book-outline",
      },
      Sessions: {
        type: "material",
        focused: "calendar-clock",
        unfocused: "calendar-clock-outline",
      },
      ShareStudents: {
        type: "ionicons",
        focused: "share-social",
        unfocused: "share-social-outline",
      },
      Profile: {
        type: "ionicons",
        focused: "person",
        unfocused: "person-outline",
      },
    };

    const icon = icons[routeName] || icons.index;
    return {
      type: icon.type,
      name: focused ? icon.focused : icon.unfocused,
    };
  };

  const getLabel = (routeName: string): string => {
    const labels: Record<string, string> = {
      index: "Dashboard",
      Courses: "Courses",
      Sessions: "Sessions",
      ShareStudents: "Share",
      Profile: "Profile",
    };
    return labels[routeName] || routeName;
  };

  return (
    <SafeAreaView edges={["bottom"]} className="bg-black">
      <View
        className="bg-white border-t border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* Animated Sliding Indicator */}
        <Animated.View
          className="absolute top-0 bg-black rounded-full"
          style={{
            height: 3,
            width: tabWidth * 0.35,
            marginLeft: tabWidth * 0.325,
            transform: [{ translateX: slideAnim }],
          }}
        />

        {/* Tab Buttons */}
        <View className="flex-row items-center justify-around pt-2 pb-1">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const icon = getIconName(route.name, isFocused);
            const label = getLabel(route.name);

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                className="flex-1 items-center justify-center py-1"
              >
                <View
                  className={`items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
                    isFocused ? "bg-gray-100" : ""
                  }`}
                >
                  {/* Icon */}
                  <View className="mb-0.5">
                    {icon.type === "ionicons" ? (
                      <Ionicons
                        name={icon.name as any}
                        size={22}
                        color={isFocused ? "#000000" : "#6B7280"}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={icon.name as any}
                        size={22}
                        color={isFocused ? "#000000" : "#6B7280"}
                      />
                    )}
                  </View>

                  {/* Label */}
                  <Text
                    className={`text-[10px] font-semibold ${
                      isFocused ? "text-black" : "text-gray-500"
                    }`}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
