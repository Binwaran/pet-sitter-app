"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { fetchSitters } from "@/services/sitterService";
import SitterCard from "./pet-sitters/SitterCard";

// Icon สำหรับหมุดทั่วไป
const defaultIcon = L.icon({
  iconUrl: "/mock/pin.png",
  iconRetinaUrl: "/mock/pin.png",
  iconSize: [88, 88],
  iconAnchor: [44, 88],
});

// Icon สำหรับหมุดที่ถูกเลือก (สีส้ม)
const selectedIcon = L.icon({
  iconUrl: "/mock/pinCur.png",
  iconRetinaUrl: "/mock/pinCur.png",
  iconSize: [88, 88],
  iconAnchor: [44, 88],
});

function Locate() {
  const map = useMap();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        map.setView([latitude, longitude], 12);
      },
      (error) => {}
    );
  }, [map]);

  return userLocation ? (
    <Marker position={userLocation} icon={selectedIcon}>
      <Popup>คุณอยู่ที่นี่</Popup>
    </Marker>
  ) : null;
}

export default function PetSitterMap() {
  const [isClient, setIsClient] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState(null);
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const fetchSittersData = async () => {
      try {
        setLoading(true);
        const data = await fetchSitters();
        // Ensure each sitter has users property for SitterCard compatibility
        const sittersWithUser = data.map((sitter) => ({
          ...sitter,
          users: sitter.users || {
            profile_image_url: '/assets/placeholder-profile.jpg',
            name: 'ไม่ระบุชื่อ'
          }
        }));
        // กรองเฉพาะ sitter ที่มี lat/lng เป็น number เท่านั้น
        const filteredSitters = sittersWithUser.filter(sitter => typeof sitter.lat === 'number' && typeof sitter.lng === 'number');
        setSitters(filteredSitters);
        // ตั้ง selectedSitter ให้เป็นตัวแรกที่มี lat/lng ถ้ายังไม่มี
        if (!selectedSitter && filteredSitters.length > 0) {
          setSelectedSitter(filteredSitters[0]);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSittersData();
  }, []);

  useEffect(() => {
    if (
      selectedSitter &&
      swiperRef.current &&
      Array.isArray(sitters) &&
      sitters.length > 0
    ) {
      const index = sitters.findIndex(
        (sitter) => sitter.id === selectedSitter.id
      );
      if (index !== -1 && index !== swiperRef.current.activeIndex) {
        swiperRef.current.slideTo(index);
      }
    }
  }, [selectedSitter, sitters]);

  if (!isClient) return null;
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading sitters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
<>                 
    <div className="flex flex-col items-center min-h-screen px-4 md:px-20  gap-5 bg-gray-50">
      <div className="relative w-full max-w-[1280px] h-[580px] mx-auto border border-gray-300 rounded-md overflow-hidden">
        <MapContainer
          center={[13.7563, 100.5018]}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Locate />
          {Array.isArray(sitters) && sitters.map((loc, index) => (
            (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') ? (
              <Marker
                key={loc.id || loc.user_id || index}
                position={[loc.lat, loc.lng]}
                icon={selectedSitter?.id === loc.id ? selectedIcon : defaultIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedSitter(loc);
                    if (mapRef.current) {
                      mapRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
                    }
                  },
                }}
              >
                <Popup offset={[0, -50]}>{loc?.name || loc?.trade_name || 'ไม่ระบุชื่อร้าน'}</Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>

          <div className="absolute bottom-0 left-0 w-full z-10 py-0">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                swiper.on("slideChange", () => {
                  if (sitters.length > 0) {
                    const currentSitter = sitters[swiper.activeIndex];
                    setSelectedSitter(currentSitter);
                  }
                });
              }}
              modules={[]}
              pagination={false}
              breakpoints={{
                0: {
                  slidesPerView: 1.2,
                  centeredSlides: true,
                  spaceBetween: 15,
                },
                640: {
                  slidesPerView: 1.5,
                  centeredSlides: true,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 1.5,
                  centeredSlides: true,
                  spaceBetween: 20,
                },
              }}
            >
              {Array.isArray(sitters) &&
                sitters.map((sitter, index) => (
                  <SwiperSlide
                    key={sitter?.id || sitter?.user_id || `sitter-${index}`}
                  >
                    <SitterCard
                      sitter={sitter}
                      onClick={() => setSelectedSitter(sitter)}
                      isSelected={selectedSitter?.id === sitter.id}
                      className={`w-full max-w-[250px] h-[200px] md:max-w-[320px] md:h-[220px] flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer
    ${selectedSitter?.id === sitter.id ? "border-2 border-orange-500" : ""}
  `}
                    />
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}
