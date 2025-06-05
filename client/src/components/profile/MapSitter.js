"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useAuth } from "@/context/AuthContext"; // เพิ่มการใช้ useAuth

// คงค่าไว้ที่ constants
const DEFAULT_POSITION = [13.7563, 100.5018]; // กรุงเทพฯ
const DEFAULT_ZOOM = 15;

// Icon สำหรับหมุด
const petSitterIcon = L.icon({
  iconUrl: "/mock/pinCur.png",
  iconSize: [60, 60],
  iconAnchor: [30, 60],
});

// Component สำหรับปรับตำแหน่งแผนที่ไปยังพิกัดที่ให้มา
function MapAdjuster({ position, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, zoom || map.getZoom());
    }
  }, [position, zoom, map]);

  return null;
}

// Hook สำหรับ debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function MapSitter({ addressDetails = {} }) {
  // State hooks
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState(null);
  const [userInfo, setUserInfo] = useState({ tradeName: "Pet Sitter" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // ใช้ user จาก context แทน localStorage

  // debounce address changes
  const debouncedAddress = useDebounce(addressDetails, 500);

  // Client-side rendering check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format address for API
  const formattedAddress = useMemo(() => {
    if (!debouncedAddress || Object.keys(debouncedAddress).length === 0) {
      return null;
    }

    const { province, district, subDistrict, postalCode, addressDetail } =
      debouncedAddress;

    if (!province || !district) {
      return null;
    }

    const provinceStr =
      typeof province === "object" ? province.label : String(province || "");
    const districtStr =
      typeof district === "object" ? district.label : String(district || "");
    const subDistrictStr =
      typeof subDistrict === "object"
        ? subDistrict.label
        : String(subDistrict || "");
    const postalCodeStr = String(postalCode || "");
    const addressDetailStr = String(addressDetail || "");

    // Create complete address string with addressDetail at beginning for better geocoding results
    return addressDetailStr
      ? `${addressDetailStr} ${subDistrictStr}, ${districtStr}, ${provinceStr} ${postalCodeStr}, Thailand`
      : `${subDistrictStr}, ${districtStr}, ${provinceStr} ${postalCodeStr}, Thailand`;
  }, [debouncedAddress]);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // เปลี่ยนเป็นการใช้ cookie ผ่าน withCredentials
      const response = await axios.get(`/api/pet-sitters/update-profile`, {
        withCredentials: true, // ส่ง cookies ไปกับ request
      });

      if (response.data?.data) {
        const data = response.data.data;
        setUserInfo({
          tradeName: data.trade_name || "Pet Sitter",
        });

        if (data.lat && data.lng) {
          setPosition([data.lat, data.lng]);
        }
      }
    } catch (err) {
      console.error("Error fetching user location:", err);
      setError("ไม่สามารถดึงข้อมูลพิกัดได้");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Update coordinates in database
  const updateCoordinates = useCallback(
    async (lat, lng, address) => {
      if (!user?.id) return;

      // Validate coordinates before sending request
      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        console.error("Invalid coordinates:", { lat, lng });
        return;
      }

      try {
        // Format coordinates to ensure correct precision
        const formattedLat = parseFloat(parseFloat(lat).toFixed(6));
        const formattedLng = parseFloat(parseFloat(lng).toFixed(6));

        // Format address to prevent undefined or null values
        const safeAddress = typeof address === "string" ? address : "";

        // First check if user role is sitter
        console.log("Preparing to update coordinates for sitter:", user.id);

        // Try with a different endpoint structure or format
        await axios.post(
          "/api/pet-sitters/update-coordinates",
          {
            // Add user_id explicitly in case the server needs it
            user_id: user.id,
            lat: formattedLat,
            lng: formattedLng,
            // Make sure address is properly formatted
            address: safeAddress.substring(0, 500), // Limit length in case it's too long
          },
          {
            withCredentials: true,
            timeout: 20000, // Increase timeout for slow connections
          }
        );

        console.log("Coordinates updated successfully");
      } catch (err) {
        console.error("Error updating coordinates:", err);

        // More detailed error logging
        if (err.response) {
          console.error("Server response:", {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers,
          });

          // Different handling based on status code
          if (err.response.status === 401) {
            console.error("Authentication issue - please log in again");
            setError("Session expired. Please log in again.");
          } else if (err.response.status === 405) {
            console.error(
              "Method not allowed - server expects a different HTTP method"
            );
          } else if (err.response.status === 500) {
            console.error("Server error - check server logs for details");
            // Continue without showing error to user (non-critical failure)
          }
        } else if (err.request) {
          console.error("No response received from server");
        }

        // Don't throw error for coordinate updates - they're non-critical
      }
    },
    [user?.id]
  );

  // Geocode address when it changes
  useEffect(() => {
    async function geocodeAddress() {
      if (!formattedAddress) return;

      try {
        console.log("Searching for address:", formattedAddress);

        const response = await axios.get("/api/geocode/search", {
          params: { q: formattedAddress },
          timeout: 10000,
        });

        // Log the raw geocoding response for debugging
        console.log("Geocoding response:", response.data);

        if (response.data?.[0]) {
          const { lat, lon } = response.data[0];
          const newLat = parseFloat(lat);
          const newLng = parseFloat(lon);

          if (!isNaN(newLat) && !isNaN(newLng)) {
            setPosition([newLat, newLng]);

            // Skip coordinate updates if we've had errors with them
            // This makes the UI work even if the server-side saving is broken
            if (!error) {
              // Add a longer delay to ensure server is ready
              setTimeout(() => {
                updateCoordinates(newLat, newLng, formattedAddress);
              }, 1000);
            }
          } else {
            console.error("Invalid geocoding result:", response.data[0]);
          }
        } else {
          console.warn(
            "No geocoding results found for address:",
            formattedAddress
          );
        }
      } catch (err) {
        console.error("Error geocoding address:", err);
      }
    }

    geocodeAddress();
  }, [formattedAddress, updateCoordinates, error]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (!isClient) return null;

  return (
    <div className="w-full h-full">
      {loading ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#FF7C43] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <p className="mt-2 text-sm">Please try again</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full overflow-hidden">
          <MapContainer
            center={position || DEFAULT_POSITION}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapAdjuster
              position={position || DEFAULT_POSITION}
              zoom={DEFAULT_ZOOM}
            />

            {position && (
              <Marker position={position} icon={petSitterIcon}>
                <Popup>{userInfo.tradeName}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
