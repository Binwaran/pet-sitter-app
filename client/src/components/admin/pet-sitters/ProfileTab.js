import React, { useEffect, useRef, useMemo, memo } from "react";
import dynamic from "next/dynamic";

// สร้าง component ย่อยเพื่อแสดงข้อมูลแต่ละ field
const InfoField = memo(({ label, value, hasChanged, children }) => (
  <div className="flex flex-col gap-1">
    <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
      {label}
      {hasChanged && (
        <span className="text-amber-500 text-xs bg-amber-100 px-2 py-0.5 rounded-full ml-2">
          New
        </span>
      )}
    </div>
    <div
      className={`text-[15px] md:text-[16px] leading-relaxed ${
        hasChanged
          ? "bg-amber-50 rounded border-l-4 border-amber-400 p-2 -m-0"
          : ""
      }`}
    >
      {children || value}
    </div>
  </div>
));

InfoField.displayName = "InfoField";

// สร้าง component สำหรับ Pet Type Tag
const PetTypeTag = memo(({ type }) => {
  // ย้ายการตั้งค่าสีไปอยู่ใน object
  const typeStyles = {
    Dog: "border-[#1CCD83] text-[#1CCD83] bg-[#E7FDF4]",
    Cat: "border-[#FA8AC0] text-[#FA8AC0] bg-[#FFF0F1]",
    Rabbit: "border-[#FF986F] text-[#FF986F] bg-[#FFF5EC]",
    Bird: "border-[#76D0FC] text-[#76D0FC] bg-[#ECFBFF]",
    Mouse: "border-[#F9C846] text-[#F9C846] bg-[#FFF9E3]",
    Turtle: "border-[#A084E8] text-[#A084E8] bg-[#F3F0FF]",
    Snake: "border-[#FF5B5B] text-[#FF5B5B] bg-[#FFECEC]",
    default: "border-gray-400 text-gray-500 bg-gray-100",
  };

  const style = typeStyles[type] || typeStyles.default;

  return (
    <span
      className={`px-4 py-1 rounded-full border text-[15px] md:text-[16px] font-medium ${style}`}
    >
      {type}
    </span>
  );
});

PetTypeTag.displayName = "PetTypeTag";

// Dynamic import MapSitter component
export const MapSitterWithNoSSR = dynamic(
  () => import("@/components/profile/MapSitter"),
  {
    ssr: false,
    loading: () => <LoadingSpinner text="Loading map..." />,
  }
);

// Loading spinner component
const LoadingSpinner = memo(({ text = "Loading..." }) => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="text-center">
      <div className="inline-block w-8 h-8 border-4 border-[#FF7C43] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  </div>
));

LoadingSpinner.displayName = "LoadingSpinner";

// รายชื่อ field ที่จะตรวจสอบการเปลี่ยนแปลง
const ADDRESS_FIELDS = [
  "address_detail",
  "village",
  "sub_district",
  "district",
  "province",
  "post_code",
];

// แยก field พิกัดออกมาต่างหาก
const LOCATION_FIELDS = [
  "lat", // พิกัดละติจูด
  "lng", // พิกัดลองจิจูด
];

const PROFILE_FIELDS = [
  "full_name",
  "experience",
  "phone_number",
  "introduction",
  "trade_name",
  "services",
  "my_place",
];
const SPECIAL_FIELDS = ["pet_type", "gallery_image_url", "profile_image_url"];

// User data fields ที่อยู่ในตาราง users
const USER_FIELDS = ["full_name", "email", "phone_number", "profile_image_url"];

// Validate URL helper function
const isValidImageUrl = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
};

const ProfileTab = memo(({ sitter }) => {
  const pendingData = sitter.pet_sitter.pending_data || {};
  const isPending = sitter.pet_sitter.status === "waiting for approval";
  const galleryRef = useRef(null);

  // ตรวจสอบว่า pending_data มีโครงสร้างใหม่หรือไม่
  const hasNewStructure = useMemo(() => {
    return isPending && (pendingData.user_data || pendingData.pet_sitter_data);
  }, [isPending, pendingData]);

  // Debug log
  useEffect(() => {
    if (isPending) {
      console.log("Pending data structure:", pendingData);
      console.log("Using new structure:", hasNewStructure);
    }
  }, [isPending, pendingData, hasNewStructure]);

  // Handle gallery scroll touch events
  useEffect(() => {
    const galleryElement = galleryRef.current;
    if (galleryElement) {
      // Use passive listeners for better scroll performance
      galleryElement.addEventListener("touchstart", () => {}, {
        passive: true,
      });
      galleryElement.addEventListener("touchmove", () => {}, { passive: true });

      return () => {
        galleryElement.removeEventListener("touchstart", () => {});
        galleryElement.removeEventListener("touchmove", () => {});
      };
    }
  }, []);

  // ฟังก์ชันแปลงชื่อฟิลด์ฝั่ง frontend เป็นชื่อฟิลด์ในฐานข้อมูล
  const mapFieldToDbName = useMemo(() => {
    return (fieldName) => {
      const mapping = {
        full_name: "name",
        phone_number: "phone",
      };
      return mapping[fieldName] || fieldName;
    };
  }, []);

  // ฟังก์ชันสำหรับดึงค่าปัจจุบันของฟิลด์
  const getCurrentValue = useMemo(() => {
    return (fieldName) => {
      // ตรวจสอบว่าฟิลด์อยู่ใน users หรือ pet_sitter
      if (USER_FIELDS.includes(fieldName)) {
        // ข้อมูลจาก users table
        switch (fieldName) {
          case "full_name":
            return sitter.users.name;
          case "phone_number":
            return sitter.users.phone;
          default:
            return sitter.users[fieldName];
        }
      } else {
        // ข้อมูลจาก pet_sitter table
        return sitter.pet_sitter[fieldName];
      }
    };
  }, [sitter]);

  // ฟังก์ชันสำหรับดึงค่าจาก pending_data ตามโครงสร้างใหม่
  const getPendingValue = useMemo(() => {
    return (fieldName) => {
      if (!isPending || !pendingData) return undefined;

      if (hasNewStructure) {
        // โครงสร้างใหม่ (แบบแยก user_data และ pet_sitter_data)
        if (USER_FIELDS.includes(fieldName)) {
          // ฟิลด์อยู่ใน user_data
          const dbFieldName = mapFieldToDbName(fieldName);
          return pendingData.user_data?.[dbFieldName];
        } else {
          // ฟิลด์อยู่ใน pet_sitter_data
          return pendingData.pet_sitter_data?.[fieldName];
        }
      } else {
        // โครงสร้างเดิม (แบบ flat)
        return pendingData[fieldName];
      }
    };
  }, [isPending, pendingData, hasNewStructure, mapFieldToDbName]);

  // ฟังก์ชันตรวจสอบว่าฟิลด์มีการเปลี่ยนแปลงหรือไม่
  const hasFieldChanged = useMemo(() => {
    return (fieldName) => {
      if (!isPending) return false;

      const pendingValue = getPendingValue(fieldName);
      if (pendingValue === undefined) return false;

      const currentValue = getCurrentValue(fieldName);

      // กรณีพิเศษสำหรับรูปภาพ
      if (fieldName === "profile_image_url") {
        return pendingValue !== null && pendingValue !== currentValue;
      }

      // สำหรับฟิลด์อื่นๆ
      return String(pendingValue || "") !== String(currentValue || "");
    };
  }, [isPending, getPendingValue, getCurrentValue]);

  // ฟังก์ชันเพื่อแสดงค่าที่เหมาะสม (ค่าที่รอการอนุมัติหรือค่าปัจจุบัน)
  const getDisplayValue = useMemo(() => {
    return (fieldName, defaultValue = "") => {
      const pendingValue = getPendingValue(fieldName);

      // ถ้ามีค่าใน pending_data ให้ใช้ค่านั้น
      if (pendingValue !== undefined) {
        return pendingValue;
      }

      // ถ้าไม่มีค่าใน pending_data ให้ใช้ค่าปัจจุบัน
      return getCurrentValue(fieldName) || defaultValue;
    };
  }, [getPendingValue, getCurrentValue]);

  // แปลงข้อมูล array จาก string ถ้าจำเป็น
  const petTypes = useMemo(() => {
    const types = getDisplayValue("pet_type");
    return types
      ? Array.isArray(types)
        ? types
        : types.split(",").map((t) => t.trim())
      : [];
  }, [getDisplayValue]);

  const galleryImages = useMemo(() => {
    const images = getDisplayValue("gallery_image_url");
    return images
      ? Array.isArray(images)
        ? images
        : images.split(",").map((img) => img.trim())
      : [];
  }, [getDisplayValue]);

  // ตรวจสอบว่ามีการเปลี่ยนแปลงในกลุ่มของฟิลด์ที่อยู่หรือไม่
  const hasAddressChanged = useMemo(
    () => ADDRESS_FIELDS.some((field) => hasFieldChanged(field)),
    [hasFieldChanged]
  );

  // ตรวจสอบว่ามีการเปลี่ยนแปลงในกลุ่มของพิกัดหรือไม่
  const hasLocationChanged = useMemo(
    () => LOCATION_FIELDS.some((field) => hasFieldChanged(field)),
    [hasFieldChanged]
  );

  // ฟังก์ชันสำหรับสร้างที่อยู่เต็มรูปแบบ
  const fullAddress = useMemo(() => {
    const address = {};
    // รวม field ทั้งหมดที่เกี่ยวข้องกับที่อยู่
    [...ADDRESS_FIELDS].forEach((field) => {
      address[field] = getDisplayValue(field);
    });

    const buildingDetails = address.address_detail;

    const locationDetails = [
      address.sub_district,
      address.district,
      address.province,
      address.post_code,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      buildingDetails +
      (buildingDetails && locationDetails ? "\n" : "") +
      locationDetails
    );
  }, [getDisplayValue]);

  // สรุปการเปลี่ยนแปลงทั้งหมด
  const changeSummary = useMemo(() => {
    if (!isPending) return [];

    const changedFields = [];

    // ตรวจสอบฟิลด์ทั่วไป
    [...PROFILE_FIELDS, ...ADDRESS_FIELDS].forEach((field) => {
      if (hasFieldChanged(field)) {
        changedFields.push(field.replace(/_/g, " "));
      }
    });

    // ตรวจสอบฟิลด์พิกัด
    LOCATION_FIELDS.forEach((field) => {
      if (hasFieldChanged(field)) {
        changedFields.push(field === "lat" ? "latitude" : "longitude");
      }
    });

    // ตรวจสอบฟิลด์พิเศษ
    if (hasFieldChanged("pet_type")) changedFields.push("pet type");
    if (hasFieldChanged("gallery_image_url"))
      changedFields.push("gallery images");
    if (hasFieldChanged("profile_image_url"))
      changedFields.push("profile image");

    return changedFields;
  }, [isPending, hasFieldChanged]);

  // สร้าง Map component ตามข้อมูลที่อยู่และพิกัดของแต่ละ pet sitter
  const mapComponent = useMemo(() => {
    const province = getDisplayValue("province");
    const district = getDisplayValue("district");
    const subDistrict = getDisplayValue("sub_district");
    const postCode = getDisplayValue("post_code");
    const addressDetail = getDisplayValue("address_detail");

    // ดึงพิกัดจาก pending data หรือ ค่าปัจจุบัน (ใช้ชื่อ column ที่ถูกต้อง: lat, lng)
    let latitude = getDisplayValue("lat");
    let longitude = getDisplayValue("lng");

    // Fallback ถ้าไม่มีพิกัดใน pending data ให้ใช้พิกัดปัจจุบัน
    if (!latitude) {
      latitude = sitter.pet_sitter.lat;
    }

    if (!longitude) {
      longitude = sitter.pet_sitter.lng;
    }

    console.log(
      `Rendering map for pet sitter ID ${sitter.pet_sitter.id} at coordinates:`,
      { latitude, longitude }
    );

    // สร้าง initialPosition ถ้ามีพิกัด
    const initialPosition =
      latitude && longitude
        ? [parseFloat(latitude), parseFloat(longitude)]
        : null;

    if (province && district) {
      return (
        <MapSitterWithNoSSR
          addressDetails={{
            province,
            district,
            subDistrict,
            postalCode: postCode,
            addressDetail,
          }}
          initialPosition={initialPosition}
          allowManualPin={false} // ไม่อนุญาตให้ปักหมุดใหม่
          key={`map-${sitter.pet_sitter.id}-${latitude}-${longitude}`} // เพิ่ม coordinates ใน key เพื่อให้ re-render เมื่อพิกัดเปลี่ยน
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">
          Please select province and district first
        </p>
      </div>
    );
  }, [
    getDisplayValue,
    sitter.pet_sitter.id,
    sitter.pet_sitter.lat,
    sitter.pet_sitter.lng,
  ]);

  return (
    <div className="bg-[#F6F6F9] w-full gap-10">
      <div className="w-full flex flex-col items-center bg-white md:rounded-tr-2xl rounded-br-2xl rounded-bl-2xl gap-5 md:gap-10 p-5 md:p-10">
        {/* Changes Summary */}
        {changeSummary.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 w-full">
            <h3 className="font-medium text-amber-800">Changes Summary:</h3>
            <ul className="list-disc pl-5">
              {changeSummary.map((field) => (
                <li key={field} className="text-amber-700">
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profile Section */}
        <div className="w-full mx-auto flex flex-col lg:flex-row gap-10">
          {/* Profile Image */}
          <div className="flex flex-col items-center md:items-center gap-4 w-full h-full md:w-[240px]">
            <div
              className={`w-[200px] md:w-[240px] h-[200px] md:h-[240px] rounded-full relative bg-gray-100 flex items-center justify-center ${
                hasFieldChanged("profile_image_url")
                  ? "border-4 border-amber-400"
                  : ""
              }`}
            >
              <img
                src={
                  getDisplayValue("profile_image_url") ||
                  sitter.users.profile_image_url ||
                  "/assets/sidebar/profile.svg"
                }
                alt={sitter.users.name}
                className="w-full h-full object-cover overflow-hidden"
                style={{ borderRadius: "999px" }}
              />
              {hasFieldChanged("profile_image_url") && (
                <div className="absolute -top-5 -right-8">
                  <span className="bg-amber-400 text-white text-xs px-2 py-1 rounded-full">
                    New Image
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="flex-1">
            <div className="bg-[#FAFAFB] rounded-lg p-6 flex flex-col gap-10">
              <InfoField
                label="Full Name"
                value={getDisplayValue("full_name") || sitter.users.name}
                hasChanged={hasFieldChanged("full_name")}
              />

              <InfoField
                label="Experience"
                value={`${getDisplayValue("experience")} Years`}
                hasChanged={hasFieldChanged("experience")}
              />

              <InfoField
                label="Phone"
                value={getDisplayValue("phone_number") || sitter.users.phone}
                hasChanged={hasFieldChanged("phone_number")}
              />

              <InfoField label="Date of Birth" value={sitter.users.birthday} />

              <InfoField
                label="Introduction"
                value={getDisplayValue("introduction")}
                hasChanged={hasFieldChanged("introduction")}
              />
            </div>
          </div>
        </div>

        {/* Pet Sitter Info */}
        <div className="bg-[#FAFAFB] rounded-lg p-6 flex flex-col gap-10 w-full">
          <InfoField
            label="Pet sitter name (Trade Name)"
            value={getDisplayValue("trade_name")}
            hasChanged={hasFieldChanged("trade_name")}
          />

          <InfoField label="Pet type" hasChanged={hasFieldChanged("pet_type")}>
            <div className="flex gap-2 flex-wrap">
              {petTypes.length > 0 ? (
                petTypes.map((type) => <PetTypeTag key={type} type={type} />)
              ) : (
                <span className="text-gray-400">No types specified</span>
              )}
            </div>
          </InfoField>

          <InfoField
            label="Services"
            value={getDisplayValue("services")}
            hasChanged={hasFieldChanged("services")}
          />

          <InfoField
            label="My Place"
            value={getDisplayValue("my_place")}
            hasChanged={hasFieldChanged("my_place")}
          />

          <InfoField
            label="Image Gallery"
            hasChanged={hasFieldChanged("gallery_image_url")}
          >
            <div
              ref={galleryRef}
              className="w-full h-full flex gap-4 overflow-x-auto"
            >
              {galleryImages.length > 0 ? (
                galleryImages
                  .filter(isValidImageUrl)
                  .slice(0, 10)
                  .map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`gallery-${idx}`}
                      onError={(e) => {
                        e.target.src = "/assets/placeholder-image.png";
                      }}
                      className="w-[246px] h-[185px] object-cover bg-gray-100"
                    />
                  ))
              ) : (
                <span className="text-gray-400">No images</span>
              )}
            </div>
          </InfoField>
        </div>

        {/* Address Section */}
        <div className="bg-[#FAFAFB] rounded-lg p-6 flex flex-col gap-10 w-full">
          <InfoField label="Address" hasChanged={hasAddressChanged}>
            <div className="whitespace-pre-line">{fullAddress}</div>
          </InfoField>

          <div className="bg-gray-300 rounded-lg overflow-hidden relative w-full h-[400px]">
            {mapComponent}
          </div>

          {/* แสดงพิกัดถ้ามี */}
          <InfoField label="Coordinates" hasChanged={hasLocationChanged}>
            {(() => {
              // พิกัดจาก pending data
              const pendingLat = getPendingValue("lat");
              const pendingLng = getPendingValue("lng");

              // พิกัดปัจจุบัน
              const currentLat = sitter.pet_sitter.lat;
              const currentLng = sitter.pet_sitter.lng;

              // พิกัดที่จะแสดง (pending ถ้ามี หรือไม่ก็ current)
              const displayLat = getDisplayValue("lat");
              const displayLng = getDisplayValue("lng");

              const hasBothCoordinates = displayLat && displayLng;
              const hasCoordinatesChanged =
                hasFieldChanged("lat") || hasFieldChanged("lng");

              return (
                <div>
                  {hasBothCoordinates ? (
                    <div className="font-mono">
                      {parseFloat(displayLat).toFixed(6)},{" "}
                      {parseFloat(displayLng).toFixed(6)}
                      {hasCoordinatesChanged && currentLat && currentLng && (
                        <div className="mt-2 text-sm text-gray-500">
                          <span className="block">Original coordinates:</span>
                          {parseFloat(currentLat).toFixed(6)},{" "}
                          {parseFloat(currentLng).toFixed(6)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      No coordinates available
                    </span>
                  )}
                </div>
              );
            })()}
          </InfoField>
        </div>
      </div>
    </div>
  );
});

ProfileTab.displayName = "ProfileTab";

export default ProfileTab;
