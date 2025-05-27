import React from "react";

export default function ProfileTab({ sitter }) {
  // แปลงข้อมูล array จาก string ถ้าจำเป็น
  const petTypes = sitter.pet_sitter.pet_type
    ? Array.isArray(sitter.pet_sitter.pet_type)
      ? sitter.pet_sitter.pet_type
      : sitter.pet_sitter.pet_type.split(",").map((t) => t.trim())
    : [];
  const galleryImages = sitter.pet_sitter.gallery_image_url
    ? Array.isArray(sitter.pet_sitter.gallery_image_url)
      ? sitter.pet_sitter.gallery_image_url
      : sitter.pet_sitter.gallery_image_url.split(",").map((t) => t.trim())
    : [];

  return (
    <div className="bg-[#F6F6F9] w-full gap-10">
      <div className="w-full flex flex-col items-center bg-white md:rounded-tr-2xl rounded-br-2xl rounded-bl-2xl gap-10 p-10">
        <div className="w-full mx-auto flex flex-col lg:flex-row gap-10">
          {/* Profile Image */}
          <div className="flex flex-col items-center md:items-center gap-4 w-full h-full md:w-[240px]">
            <div className="w-[200px] md:w-[240px] h-[200px] md:h-[240px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={
                  sitter.users.profile_image_url ||
                  "/assets/sidebar/profile.svg"
                }
                alt={sitter.users.name}
                className="w-full h-full object-cover"
                style={{ borderRadius: "999px" }}
              />
            </div>
          </div>
          {/* Info Card */}
          <div className="flex-1">
            <div className="bg-[#FAFAFB] rounded-lg p-6 flex flex-col gap-10">
              <div className="flex flex-col gap-1">
                <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
                  Full Name
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360]">
                  {sitter.users.name}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
                  Experience
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360]">
                  {sitter.pet_sitter.experience} Years
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
                  Phone
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360]">
                  {sitter.users.phone}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
                  ID Number
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360]">
                  {sitter.pet_sitter.id_number || "-"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
                  Date of Birth
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360]">
                  {sitter.users.birthday}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
                  Introduction
                </div>
                <div className="text-[15px] md:text-[16px] text-[#232360] leading-relaxed">
                  {sitter.pet_sitter.introduction}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Sitter Info */}
        <div className="bg-[#FAFAFB] rounded-lg p-6 flex flex-col gap-10 w-full">
          <div className="flex flex-col gap-1">
            <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px] gap-1">
              Pet sitter name (Trade Name)
            </div>
            <div className="text-[16px] md:text-[18px] text-[#232360]">
              {sitter.pet_sitter.trade_name}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px] gap-1">
              Pet type
            </div>
            <div className="flex gap-2 md:gap-3 flex-wrap">
              {petTypes.map((type) => (
                <span
                  key={type}
                  className={`px-3 md:px-4 py-1 rounded-full border text-[15px] md:text-[16px] font-medium
                  ${
                    type === "Dog"
                      ? "border-[#1CCD83] text-[#1CCD83] bg-[#E7FDF4]"
                      : ""
                  }
                  ${
                    type === "Cat"
                      ? "border-[#FA8AC0] text-[#FA8AC0] bg-[#FFF0F1]"
                      : ""
                  }
                  ${
                    type === "Rabbit"
                      ? "border-[#FF986F] text-[#FF986F] bg-[#FFF5EC]"
                      : ""
                  }
                  ${
                    type === "Bird"
                      ? "border-[#76D0FC] text-[#76D0FC] bg-[#ECFBFF]"
                      : ""
                  }
                  ${
                    type === "Mouse"
                      ? "border-[#F9C846] text-[#F9C846] bg-[#FFF9E3]"
                      : ""
                  }
                  ${
                    type === "Turtle"
                      ? "border-[#A084E8] text-[#A084E8] bg-[#F3F0FF]"
                      : ""
                  }
                  ${
                    type === "Snake"
                      ? "border-[#FF5B5B] text-[#FF5B5B] bg-[#FFECEC]"
                      : ""
                  }
                `}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px] gap-1">
              Services
            </div>
            <div className="text-[15px] md:text-[16px] text-[#232360] leading-relaxed whitespace-pre-line">
              {sitter.pet_sitter.services}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px] gap-1">
              My Place
            </div>
            <div className="text-[15px] md:text-[16px] text-[#232360] leading-relaxed">
              {sitter.pet_sitter.my_place}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[#AEB1C3] font-semibold text-[18px] md:text-[20px] gap-1">
              Image Gallery
            </div>
            <div className="flex gap-4 overflow-x-auto">
              {galleryImages.length > 0 ? (
                galleryImages
                  .slice(0, 10)
                  .map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`gallery-${idx}`}
                      className="w-[246px] h-[185px] object-cover bg-gray-100"
                    />
                  ))
              ) : (
                <span className="text-gray-400">No images</span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-[#FAFAFB] rounded-lg p-6 flex flex-col gap-10 w-full">
          <div className="flex flex-col gap-1">
            <div className="gap-1 text-[#AEB1C3] font-semibold text-[18px] md:text-[20px]">
              Address
            </div>
            <div className="text-[15px] md:text-[16px] text-[#232360] leading-relaxed">
              {[
                sitter.pet_sitter.house_number,
                sitter.pet_sitter.village,
                sitter.pet_sitter.sub_district,
                sitter.pet_sitter.district,
                sitter.pet_sitter.province,
                sitter.pet_sitter.post_code,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
          <div className="w-full h-[180px] md:h-[260px] bg-[#F7F7FA] rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src="/mock/map.png"
              alt="map"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
