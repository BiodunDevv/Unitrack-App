import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";
import { useSessionStore } from "../../store/useSessionStore";

export default function StartSessionPage() {
  const router = useRouter();
  const { courses, getAllCourses } = useCourseStore();
  const { startAttendanceSession } = useSessionStore();

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseSelector, setShowCourseSelector] = useState(true);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radius, setRadius] = useState(100);
  const [duration, setDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    getAllCourses();
  }, [getAllCourses]);

  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied");
        setIsGettingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      };

      setLocation(newLocation);

      // Get address from coordinates
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: newLocation.lat,
          longitude: newLocation.lng,
        });

        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const addressParts = [
            place.name,
            place.street,
            place.city,
            place.region,
            place.country,
          ].filter(Boolean);
          setAddress(addressParts.join(", "));
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setAddress("Address unavailable");
      }

      setIsGettingLocation(false);
    } catch (error) {
      console.error("Location error:", error);
      setLocationError("Failed to get location. Please try again.");
      setIsGettingLocation(false);
    }
  };

  const handleStartSession = async () => {
    if (!location) {
      Toast.show({
        type: "error",
        text1: "Location Required",
        text2: "Please get your location first",
      });
      return;
    }

    if (!selectedCourse) {
      Toast.show({
        type: "error",
        text1: "Course Required",
        text2: "Please select a course",
      });
      return;
    }

    setIsLoading(true);
    try {
      await startAttendanceSession(selectedCourse._id, {
        lat: location.lat,
        lng: location.lng,
        radius_m: radius,
        duration_minutes: duration,
      });

      Toast.show({
        type: "success",
        text1: "Session Started!",
        text2: "Students can now mark their attendance",
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to start session",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRadiusRecommendation = (radius: number) => {
    if (radius <= 20) return "Tutorial rooms (5-15 students)";
    if (radius <= 50) return "Standard classrooms (20-50 students)";
    if (radius <= 100) return "Large lecture halls (50-200 students)";
    if (radius <= 200) return "Lab complexes (200-500 students)";
    if (radius <= 300) return "Building clusters (500+ students)";
    if (radius <= 500) return "Campus sections";
    return "Entire campus/Field work";
  };

  if (showCourseSelector) {
    return (
      <View className="flex-1">
        <SafeAreaView className="bg-white" edges={["top"]} />
        <StatusBar style="dark" />
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="bg-white px-6 py-4 border-b border-gray-200">
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center mb-3"
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </Pressable>
            <Text className="text-black text-2xl font-bold mb-1">
              Select Course
            </Text>
            <Text className="text-gray-600 text-sm">
              Choose a course to start attendance session
            </Text>
          </View>

          <ScrollView className="flex-1 p-4">
            {courses.length === 0 ? (
              <View className="bg-white rounded-lg p-8 items-center border border-gray-200">
                <Ionicons name="book-outline" size={48} color="#D1D5DB" />
                <Text className="text-black text-lg font-semibold mt-4 mb-2">
                  No courses found
                </Text>
                <Text className="text-gray-600 text-center text-sm">
                  You need to have courses to start a session
                </Text>
              </View>
            ) : (
              courses.map((course) => (
                <Pressable
                  key={course._id}
                  onPress={() => {
                    setSelectedCourse(course);
                    setShowCourseSelector(false);
                  }}
                  className="bg-white rounded-lg p-4 mb-3 border border-gray-200 active:bg-gray-50"
                >
                  <Text className="text-black text-base font-bold mb-1">
                    {course.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-2">
                    {course.course_code} • Level {course.level}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="people" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {course.student_count || 0} students
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
        <SafeAreaView className="bg-black" edges={["bottom"]} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView className="bg-white" edges={["top"]} />
      <StatusBar style="dark" />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Pressable
            onPress={() => setShowCourseSelector(true)}
            className="mb-3"
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="arrow-back" size={20} color="#000000" />
            </View>
          </Pressable>
          <Text className="text-black text-2xl font-bold mb-1">
            Start Attendance Session
          </Text>
          <Text className="text-gray-600 text-sm">
            {selectedCourse?.course_code} - {selectedCourse?.title}
          </Text>
        </View>

        <ScrollView
          className="flex-1 bg-gray-50"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-4">
            {/* Quick Stats */}
            <View className="flex-row mb-4 gap-3">
              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-medium">
                    Radius
                  </Text>
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Ionicons name="scan" size={16} color="#000" />
                  </View>
                </View>
                <Text className="text-black text-2xl font-bold">{radius}m</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Coverage area
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-medium">
                    Duration
                  </Text>
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Ionicons name="timer" size={16} color="#000" />
                  </View>
                </View>
                <Text className="text-black text-2xl font-bold">
                  {duration}min
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Session length
                </Text>
              </View>
            </View>

            {/* Location Section */}
            <View className="bg-white rounded-xl p-5 mb-4 border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-black items-center justify-center mr-3">
                  <Ionicons name="location" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-black text-lg font-bold">
                    Location Settings
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Set your attendance area
                  </Text>
                </View>
              </View>

              {!location && !locationError && (
                <View>
                  <View className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="information-circle"
                        size={20}
                        color="#6B7280"
                      />
                      <Text className="text-gray-700 text-sm font-semibold ml-2">
                        Get Started
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs">
                      We&apos;ll use your current location to set the attendance
                      area. Students must be within the radius to mark
                      attendance.
                    </Text>
                  </View>
                  <Pressable
                    onPress={getLocation}
                    disabled={isGettingLocation}
                    className={`py-3.5 px-4 rounded-lg flex-row items-center justify-center ${
                      isGettingLocation
                        ? "bg-gray-300"
                        : "bg-black active:bg-gray-800"
                    }`}
                  >
                    {isGettingLocation && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Ionicons name="location" size={20} color="#FFFFFF" />
                    <Text className="text-white font-semibold ml-2">
                      {isGettingLocation
                        ? "Getting Location..."
                        : "Get Current Location"}
                    </Text>
                  </Pressable>
                </View>
              )}

              {location && (
                <View>
                  {/* Location Confirmed Badge */}
                  <View className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 rounded-full bg-green-600 items-center justify-center mr-3">
                        <Ionicons name="checkmark" size={18} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-green-800 text-sm font-bold">
                          Location Confirmed
                        </Text>
                        <Text className="text-green-700 text-xs">
                          Ready to start session
                        </Text>
                      </View>
                    </View>
                    <View className="bg-white rounded-lg p-3 mt-2">
                      <View className="flex-row items-center mb-2">
                        <Ionicons
                          name="location-sharp"
                          size={14}
                          color="#6B7280"
                        />
                        <Text className="text-gray-700 text-xs font-mono ml-2">
                          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </Text>
                      </View>
                      {address && (
                        <View className="flex-row items-start">
                          <Ionicons
                            name="navigate"
                            size={14}
                            color="#6B7280"
                            style={{ marginTop: 2 }}
                          />
                          <Text className="text-gray-600 text-xs ml-2 flex-1">
                            {address}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Enhanced Map View with Satellite */}
                  <View className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
                    {/* Map Header */}
                    <View className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-full bg-black items-center justify-center mr-2">
                            <Ionicons name="map" size={16} color="white" />
                          </View>
                          <View>
                            <Text className="text-black text-sm font-bold">
                              Attendance Zone
                            </Text>
                            <Text className="text-gray-500 text-xs">
                              Satellite View
                            </Text>
                          </View>
                        </View>
                        <View className="bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                          <Text className="text-black text-xs font-bold">
                            {radius}m radius
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Map Container with Overlays */}
                    <View className="relative" style={{ height: 400 }}>
                      <MapView
                        provider={PROVIDER_GOOGLE}
                        style={{ flex: 1 }}
                        region={{
                          latitude: location.lat,
                          longitude: location.lng,
                          latitudeDelta:
                            radius > 500 ? 0.02 : radius > 200 ? 0.01 : 0.005,
                          longitudeDelta:
                            radius > 500 ? 0.02 : radius > 200 ? 0.01 : 0.005,
                        }}
                        mapType="satellite"
                        showsUserLocation={false}
                        showsMyLocationButton={false}
                        showsBuildings={true}
                        showsIndoors={true}
                        scrollEnabled={true}
                        zoomEnabled={true}
                        pitchEnabled={false}
                        rotateEnabled={false}
                      >
                        {/* Radius Circle - Draw First */}
                        <Circle
                          center={{
                            latitude: location.lat,
                            longitude: location.lng,
                          }}
                          radius={radius}
                          strokeColor="rgba(255, 255, 255, 0.8)"
                          fillColor="rgba(59, 130, 246, 0.2)"
                          strokeWidth={3}
                        />

                        {/* Center Marker - Highly Visible Dot */}
                        <Marker
                          coordinate={{
                            latitude: location.lat,
                            longitude: location.lng,
                          }}
                          title="Your Location"
                          description={address || "Session center point"}
                          anchor={{ x: 0.5, y: 0.5 }}
                        >
                          <View
                            className="items-center justify-center"
                            style={{ width: 50, height: 50 }}
                          >
                            {/* Large outer glow for visibility */}
                            <View className="absolute w-12 h-12 rounded-full bg-yellow-400 opacity-40" />
                            {/* Bright middle ring */}
                            <View className="absolute w-8 h-8 rounded-full bg-yellow-500 opacity-70" />
                            {/* Highly visible center dot */}
                            <View className="w-5 h-5 rounded-full bg-red-600 border-3 border-white shadow-xl" />
                          </View>
                        </Marker>
                      </MapView>
                    </View>
                  </View>

                  {/* Update Location Button */}
                  <Pressable
                    onPress={getLocation}
                    className="bg-white py-3.5 px-4 rounded-xl flex-row items-center justify-center border border-gray-200 active:bg-gray-50 mb-4"
                  >
                    <Ionicons name="refresh" size={18} color="#000000" />
                    <Text className="text-black text-sm font-bold ml-2">
                      Update Location
                    </Text>
                  </Pressable>
                </View>
              )}

              {locationError && (
                <View className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-full bg-red-600 items-center justify-center mr-3">
                      <Ionicons name="alert-circle" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-red-800 text-sm font-bold">
                        Location Error
                      </Text>
                      <Text className="text-red-600 text-xs">
                        {locationError}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={getLocation}
                    className="bg-black py-3.5 px-4 rounded-xl active:bg-gray-800 mt-4"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="refresh" size={18} color="white" />
                      <Text className="text-white font-bold ml-2">
                        Try Again
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Radius Control */}
            {location && (
              <View className="bg-white rounded-xl p-5 mb-4 border border-gray-200">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-black items-center justify-center mr-3">
                    <Ionicons name="scan" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black text-lg font-bold">
                      Attendance Radius
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      Adjust coverage area
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <Text className="text-black text-sm font-bold">
                      {radius}m
                    </Text>
                  </View>
                </View>

                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={5}
                  maximumValue={1000}
                  step={5}
                  value={radius}
                  onValueChange={setRadius}
                  minimumTrackTintColor="#000000"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#000000"
                />

                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-500 text-xs">5m</Text>
                  <Text className="text-gray-500 text-xs">250m</Text>
                  <Text className="text-gray-500 text-xs">500m</Text>
                  <Text className="text-gray-500 text-xs">1000m</Text>
                </View>

                {/* Quick Presets */}
                <View className="mb-3">
                  <Text className="text-gray-600 text-xs font-medium mb-2">
                    Quick Presets:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[15, 30, 50, 100, 200, 300, 500, 1000].map((preset) => (
                      <Pressable
                        key={preset}
                        onPress={() => setRadius(preset)}
                        className={`px-3 py-2 rounded-lg border ${
                          radius === preset
                            ? "bg-black border-black"
                            : "bg-white border-gray-300 active:bg-gray-50"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            radius === preset ? "text-white" : "text-black"
                          }`}
                        >
                          {preset >= 1000 ? `${preset / 1000}km` : `${preset}m`}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="bg-gray-50 rounded-lg p-3">
                  <Text className="text-gray-600 text-xs">
                    <Text className="font-semibold">Ideal for:</Text>{" "}
                    {getRadiusRecommendation(radius)}
                  </Text>
                </View>
              </View>
            )}

            {/* Duration Section */}
            <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <Text className="text-black text-lg font-bold mb-3">
                Session Duration: {duration} minutes
              </Text>

              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={5}
                maximumValue={180}
                step={5}
                value={duration}
                onValueChange={setDuration}
                minimumTrackTintColor="#000000"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#000000"
              />

              <Text className="text-gray-600 text-xs mt-2">
                Session will automatically end after {duration} minutes
              </Text>
            </View>

            {/* Action Buttons */}
            <View>
              <Pressable
                onPress={handleStartSession}
                disabled={!location || isLoading}
                className={`py-4 px-4 rounded-lg flex-row items-center justify-center mb-2 ${
                  !location || isLoading
                    ? "bg-gray-300"
                    : "bg-black active:bg-gray-800"
                }`}
              >
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                <Text className="text-white text-base font-bold ml-2">
                  {isLoading
                    ? "Starting Session..."
                    : "Start Attendance Session"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                disabled={isLoading}
                className="bg-white border border-gray-300 py-4 px-4 rounded-lg active:bg-gray-50"
              >
                <Text className="text-black text-base font-semibold text-center">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </View>
  );
}
