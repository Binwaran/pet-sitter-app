"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import L from "leaflet";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

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

// เพิ่ม prop ใหม่: initialPosition, onPositionChange, autoSave
export default function MapSitter({
  addressDetails = {},
  initialPosition = null,
  onPositionChange = null,
  autoSave = false,
}) {
  // State hooks
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState(initialPosition || null);
  const [userInfo, setUserInfo] = useState({ tradeName: "Pet Sitter" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const lastSearchRef = useRef(""); // เพื่อป้องกันการค้นหาซ้ำ

  // เพิ่ม client-side CSS import
  useEffect(() => {
    import("leaflet/dist/leaflet.css");
  }, []);

  // debounce address changes - เพิ่มเวลาให้นานขึ้น
  const debouncedAddress = useDebounce(addressDetails, 1500);

  // Client-side rendering check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ถ้ามีการส่ง initialPosition มาใหม่ ให้อัพเดต position
  useEffect(() => {
    if (initialPosition && initialPosition[0] && initialPosition[1]) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

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

    // แปลงข้อมูลที่อยู่ให้เป็นสตริงสำหรับการค้นหา
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

    // สร้างที่อยู่เต็มรูปแบบสำหรับการ geocode
    return addressDetailStr
      ? `${addressDetailStr} ${subDistrictStr}, ${districtStr}, ${provinceStr} ${postalCodeStr}, Thailand`
      : `${subDistrictStr}, ${districtStr}, ${provinceStr} ${postalCodeStr}, Thailand`;
  }, [debouncedAddress]);

  // Geocode address when it changes
useEffect(() => {
  if (!formattedAddress || formattedAddress === lastSearchRef.current) return;
  
  let isActive = true; // ป้องกัน race condition
  lastSearchRef.current = formattedAddress;
  
  console.log("Searching for address:", formattedAddress);
  
  const searchAddress = async () => {
    try {
      const response = await axios.get("/api/geocode/search", {
        params: { q: formattedAddress },
        timeout: 10000,
      });
      
      // ถ้า component unmount ไปแล้ว ไม่ต้องอัพเดต state
      if (!isActive) return;
      
      console.log("Geocoding response:", response.data);
      
      if (response.data?.[0]) {
        const { lat, lon } = response.data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        if (!isNaN(newLat) && !isNaN(newLng)) {
          const newPosition = [newLat, newLng];
          setPosition(newPosition);
          
          // แจ้ง parent component เกี่ยวกับการเปลี่ยนแปลงพิกัด
          if (onPositionChange) {
            onPositionChange(newLat, newLng);
          }
        }
      }
    } catch (err) {
      if (!isActive) return;
      console.error("Error geocoding address:", err);
      setError("เกิดข้อผิดพลาดในการค้นหาพิกัด");
    }
  };
  
  // ดีเลย์การค้นหาเล็กน้อย
  const timer = setTimeout(searchAddress, 500);
  
  // Cleanup function
  return () => {
    isActive = false;
    clearTimeout(timer);
  };
}, [formattedAddress, user?.id, onPositionChange, autoSave]);

  // Initial data fetch - load only once when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // ดึงข้อมูลเริ่มต้นจาก API
        const response = await axios.get(`/api/pet-sitters/update-profile`, {
          withCredentials: true,
        });

        if (response.data?.data) {
          const data = response.data.data;

          setUserInfo({
            tradeName: data.trade_name || "Pet Sitter",
          });

          // ใช้ initialPosition จาก props ถ้ามี มิฉะนั้นใช้จาก API
          if (!initialPosition && data.lat && data.lng) {
            setPosition([data.lat, data.lng]);

            // แจ้ง parent component เกี่ยวกับพิกัดเริ่มต้น
            if (onPositionChange) {
              onPositionChange(data.lat, data.lng);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("ไม่สามารถดึงข้อมูลเริ่มต้นได้");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user?.id, initialPosition, onPositionChange]);

  // ถ้าไม่ได้ render บน client หรือกำลังโหลดอยู่
  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span>Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={position || DEFAULT_POSITION}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {position && (
        <Marker position={position} icon={petSitterIcon}>
          <Popup>
            <div className="text-center">
              <strong>{userInfo.tradeName}</strong>
              <p className="text-sm">{formattedAddress}</p>
            </div>
          </Popup>
        </Marker>
      )}

      <MapAdjuster position={position} zoom={DEFAULT_ZOOM} />
    </MapContainer>
  );
}
