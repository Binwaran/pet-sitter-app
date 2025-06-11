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
      // เช็คว่าพิกัดที่ได้อยู่ห่างจากจุดกลางปัจจุบันเกิน threshold หรือไม่
      const center = map.getCenter();
      const currentPos = [center.lat, center.lng];
      const distance = getDistance(position, currentPos);

      // ถ้าพิกัดใหม่ห่างจากพิกัดปัจจุบันเกิน 10 เมตร หรือถูกซูมที่ระดับต่างกัน ให้ปรับมุมมองแผนที่
      if (distance > 10 || map.getZoom() !== (zoom || DEFAULT_ZOOM)) {
        // flyTo ให้มีการเคลื่อนไหวแบบ smooth animation
        map.flyTo(position, zoom || map.getZoom(), {
          animate: true,
          duration: 1, // 1 วินาที
        });
      }
    }
  }, [position, zoom, map]);

  return null;
}

// Helper function to calculate distance between two coordinates in meters
function getDistance(coord1, coord2) {
  if (!coord1 || !coord2) return 0;

  // Haversine formula
  const R = 6371e3; // metres
  const φ1 = (coord1[0] * Math.PI) / 180; // φ, λ in radians
  const φ2 = (coord2[0] * Math.PI) / 180;
  const Δφ = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const Δλ = ((coord2[1] - coord1[1]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
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
  allowManualPin = true, // สามารถกำหนดพิกัดด้วยการคลิกบนแผนที่
}) {
  // State hooks
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState(initialPosition || null);
  const [userInfo, setUserInfo] = useState({ tradeName: "Pet Sitter" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggable, setDraggable] = useState(true);
  const [showConfirmManualPin, setShowConfirmManualPin] = useState(false);
  const { user } = useAuth();
  const lastSearchRef = useRef("");
  const mapRef = useRef(null);

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

  // Format address for API - ปรับปรุงให้แม่นยำมากขึ้น
  const formattedAddress = useMemo(() => {
    if (!debouncedAddress || Object.keys(debouncedAddress).length === 0) {
      return null;
    }

    const { province, district, subDistrict, postalCode, addressDetail } =
      debouncedAddress;

    if (!province || !district) {
      return null;
    }

    // แปลงข้อมูลที่อยู่ให้เป็นสตริงสำหรับการค้นหาและตัดข้อความว่างเปล่า
    const provinceStr =
      typeof province === "object"
        ? province.label?.trim()
        : String(province || "").trim();
    const districtStr =
      typeof district === "object"
        ? district.label?.trim()
        : String(district || "").trim();
    const subDistrictStr =
      typeof subDistrict === "object"
        ? subDistrict.label?.trim()
        : String(subDistrict || "").trim();
    const postalCodeStr = String(postalCode || "").trim();
    const addressDetailStr = String(addressDetail || "").trim();

    // ใช้รูปแบบที่เฉพาะเจาะจงสำหรับประเทศไทย
    if (addressDetailStr) {
      return `${addressDetailStr}, ${subDistrictStr}, ${districtStr}, ${provinceStr} ${postalCodeStr}, Thailand`;
    } else {
      return `${subDistrictStr}, ${districtStr}, ${provinceStr} ${postalCodeStr}, Thailand`;
    }
  }, [debouncedAddress]);

  // เพิ่ม function สำหรับปักหมุดด้วยการคลิก
  const handleMapClick = useCallback(
    (e) => {
      if (!allowManualPin) return;

      const { lat, lng } = e.latlng;
      const newLat = parseFloat(lat);
      const newLng = parseFloat(lng);

      if (!isNaN(newLat) && !isNaN(newLng)) {
        setPosition([newLat, newLng]);

        // แสดงข้อความยืนยันว่าต้องการปักหมุดที่นี่จริงหรือไม่
        setShowConfirmManualPin(true);

        // หลังจากแสดงข้อความ 3 วินาที ให้ซ่อนข้อความ
        setTimeout(() => {
          setShowConfirmManualPin(false);
        }, 3000);

        if (onPositionChange) {
          onPositionChange(newLat, newLng);
        }
      }
    },
    [allowManualPin, onPositionChange]
  );

  // สำหรับการอัพเดตพิกัดเมื่อลากหมุด
  const handleMarkerDrag = useCallback(
    (e) => {
      if (!allowManualPin) return;

      // แก้ไขจาก e.latlng เป็น e.target._latlng
      const { lat, lng } = e.target._latlng;
      const newLat = parseFloat(lat);
      const newLng = parseFloat(lng);

      if (!isNaN(newLat) && !isNaN(newLng)) {
        setPosition([newLat, newLng]);

        // แสดงข้อความยืนยันว่าปรับตำแหน่งแล้ว
        setShowConfirmManualPin(true);

        // หลังจากแสดงข้อความ 3 วินาที ให้ซ่อนข้อความ
        setTimeout(() => {
          setShowConfirmManualPin(false);
        }, 3000);

        if (onPositionChange) {
          onPositionChange(newLat, newLng);
        }
      }
    },
    [allowManualPin, onPositionChange]
  );

  // เพิ่ม component สำหรับให้สามารถคลิกบนแผนที่ได้
  const MapEvents = () => {
    const map = useMap();
    mapRef.current = map;

    useEffect(() => {
      if (allowManualPin) {
        map.on("click", handleMapClick);
      }

      return () => {
        if (allowManualPin) {
          map.off("click", handleMapClick);
        }
      };
    }, [map]);

    return null;
  };

  // Function สำหรับแปลงพิกัดเป็นที่อยู่ (Reverse Geocoding)
  const reverseGeocodePosition = useCallback(async (lat, lng) => {
    try {
      const response = await axios.get("/api/geocode/reverse", {
        params: { lat, lng },
        timeout: 10000,
      });

      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
    } catch (err) {
      console.error("Error reverse geocoding:", err);
    }

    return null;
  }, []);

  // Geocode address when it changes
  useEffect(() => {
    if (!formattedAddress || formattedAddress === lastSearchRef.current) return;

    let isActive = true; // ป้องกัน race condition
    lastSearchRef.current = formattedAddress;

    setLoading(true);
    console.log("Searching for address:", formattedAddress);

    // ทำให้การค้นหาแม่นยำขึ้นโดยให้น้ำหนักกับส่วนต่างๆ ของที่อยู่
    const searchAddress = async () => {
      try {
        // ใช้ค่า timeout ที่นานขึ้นเพื่อรองรับการค้นหาที่ซับซ้อน
        const response = await axios.get("/api/geocode/search", {
          params: { q: formattedAddress },
          timeout: 20000,
        });

        // ถ้า component unmount ไปแล้ว ไม่ต้องอัพเดต state
        if (!isActive) return;

        setLoading(false);

        if (response.data && response.data.length > 0) {
          // เลือกผลลัพธ์ที่ดีที่สุดจากการค้นหา
          const bestResult = response.data[0];
          const newLat = parseFloat(bestResult.lat);
          const newLng = parseFloat(bestResult.lon);

          if (!isNaN(newLat) && !isNaN(newLng)) {
            const newPosition = [newLat, newLng];
            setPosition(newPosition);
            setError(null);

            // แจ้ง parent component เกี่ยวกับการเปลี่ยนแปลงพิกัด
            if (onPositionChange) {
              onPositionChange(newLat, newLng);
            }
          }
        } else {
          // ถ้าไม่พบผลลัพธ์ที่เข้าเกณฑ์
          setError("ไม่พบที่อยู่ที่ระบุ โปรดปรับการค้นหาหรือปักหมุดด้วยตนเอง");

          // คงตำแหน่งเดิมไว้ถ้ามี
          if (!position && initialPosition) {
            setPosition(initialPosition);
          }
        }
      } catch (err) {
        if (!isActive) return;

        console.error("Error geocoding address:", err);
        setError("เกิดข้อผิดพลาดในการค้นหาพิกัด");
        setLoading(false);
      }
    };

    // ดีเลย์การค้นหาเล็กน้อย เพื่อรองรับการพิมพ์ต่อเนื่อง
    const timer = setTimeout(searchAddress, 500);

    // Cleanup function
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [formattedAddress, onPositionChange, position, initialPosition]);

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
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-70 flex items-center justify-center z-[1001]">
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-4 border-[#FF7C43] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm">กำลังโหลดแผนที่...</p>
          </div>
        </div>
      )}

      {/* ข้อความแนะนำการใช้งานแผนที่ */}
      {allowManualPin && (
        <div className="absolute bottom-5 right-4 z-[1000]">
          <div className="bg-white p-2 rounded shadow-md border border-orange-400 text-center max-w-[200px]">
            <p className="text-xs font-medium">
              คลิกบนแผนที่เพื่อปรับตำแหน่งหมุด
            </p>
            <p className="text-xs text-gray-500">
              หรือลากหมุดไปยังตำแหน่งที่ต้องการ
            </p>
          </div>
        </div>
      )}

      {/* ย้าย confirmation message มาไว้ข้างนอก MapContainer */}
      {showConfirmManualPin && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-white p-3 rounded shadow-lg border-2 border-orange-500 text-center">
            <p className="text-sm font-medium">ปักหมุดที่ตำแหน่งนี้แล้ว</p>
          </div>
        </div>
      )}

      <MapContainer
        center={position || DEFAULT_POSITION}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <Marker
            position={position}
            icon={petSitterIcon}
            draggable={allowManualPin}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>{userInfo.tradeName}</strong>
                <p className="text-sm">{formattedAddress}</p>
              </div>
            </Popup>
          </Marker>
        )}

        <MapAdjuster position={position} zoom={DEFAULT_ZOOM} />
        <MapEvents />
      </MapContainer>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-700 p-2 text-center text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
MapSitter.displayName = "MapSitter"; // ตั้งชื่อให้กับ component เพื่อช่วยในการ debug
