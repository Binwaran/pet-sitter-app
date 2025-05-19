"use client";

import { memo, useState, useCallback } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";

// Pet Type Styles
const PET_TYPE_STYLES = {
  Dog: "border-[#1CCD83] text-[#1CCD83] bg-[#E7FDF4]",
  Cat: "border-[#FA8AC0] text-[#FA8AC0] bg-[#FFF0F1]",
  Rabbit: "border-[#FF986F] text-[#FF986F] bg-[#FFF5EC]",
  Bird: "border-[#76D0FC] text-[#76D0FC] bg-[#ECFBFF]",
  Mouse: "border-[#F9C846] text-[#F9C846] bg-[#FFF9E3]",
  Turtle: "border-[#A084E8] text-[#A084E8] bg-[#F3F0FF]",
  Snake: "border-[#FF5B5B] text-[#FF5B5B] bg-[#FFECEC]",
  default: "border-[#AEB1C3] text-gray-600 bg-gray-100",
};

// Component แสดงประเภทสัตว์เลี้ยง
const PetTypeTag = memo(({ type }) => {
  const style = PET_TYPE_STYLES[type] || PET_TYPE_STYLES.default;

  return (
    <span
      className={`px-4 py-1 flex items-center justify-center gap-2.5 leading-[150%] border rounded-full font-medium ${style}`}
    >
      {type || "Unknown"}
    </span>
  );
});

PetTypeTag.displayName = "PetTypeTag";

// Component สำหรับข้อมูลในรายละเอียด
const DetailField = memo(({ label, value }) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-lg font-semibold text-[#AEB1C3]">{label}</h3>
    <p className="text-black font-medium">{value || "N/A"}</p>
  </div>
));

DetailField.displayName = "DetailField";

// Component Modal แสดงรายละเอียดสัตว์เลี้ยง
const PetDetailModal = memo(({ pet, onClose }) => {
  if (!pet) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#00000066]">
      <div className="bg-white rounded-2xl md:max-w-[600px] w-3/4 lg:w-full relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 md:px-10 py-6 border-b border-gray-200">
          <h2 className="text-lg md:text-2xl font-bold text-black">
            {pet.name || "Pet Details"}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-4xl w-6 h-6 text-[#3A3B46] hover:text-gray-400"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 md:gap-6 px-6 md:px-10 py-6 overflow-y-auto flex-1">
          {/* Pet Image */}
          <div className="flex justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-gray-200">
              {pet.profile_image_url ? (
                <Image
                  src={pet.profile_image_url}
                  alt={pet.name || "Pet"}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">
                  🐾
                </div>
              )}
            </div>
          </div>

          {/* Pet Type */}
          <div className="flex justify-center">
            <PetTypeTag type={pet.species} />
          </div>

          {/* Pet Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <DetailField label="Name" value={pet.name} />
            <DetailField label="Species" value={pet.species} />
            <DetailField label="Breed" value={pet.breed} />
            <DetailField label="Gender" value={pet.gender} />
            <DetailField
              label="Age"
              value={pet.age ? `${pet.age} years` : "N/A"}
            />
            <DetailField
              label="Weight"
              value={pet.weight ? `${pet.weight} kg` : "N/A"}
            />
            <DetailField
              label="Registered"
              value={formatDate(pet.created_at)}
            />
            <DetailField
              label="Last Updated"
              value={formatDate(pet.updated_at)}
            />
          </div>

          {/* Medical Info */}
          {pet.medical_info && (
            <div>
              <DetailField label="Medical Information" />
              <div className="bg-[#F6F6F9] rounded-lg p-4 mt-2">
                <p className="text-black leading-relaxed">{pet.medical_info}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {pet.description && (
            <div>
              <DetailField label="Description" />
              <div className="bg-[#F6F6F9] rounded-lg p-4 mt-2">
                <p className="text-black leading-relaxed">{pet.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PetDetailModal.displayName = "PetDetailModal";

// Component แสดงการ์ดสัตว์เลี้ยง
const PetCard = memo(({ pet, onClick }) => (
  <div
    className="border border-[#DCDFED] rounded-2xl p-6 gap-4 min-w-62 flex flex-col justify-center items-center bg-white hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onClick(pet)}
  >
    {/* Pet Image */}
    <div className="w-26 h-26 rounded-full flex-shrink-0 bg-gray-100 flex items-center justify-center">
      {pet.profile_image_url ? (
        <Image
          src={pet.profile_image_url}
          alt={pet.name || "Pet"}
          width={104}
          height={104}
          className="w-full h-full object-cover overflow-hidden rounded-full"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
          🐾
        </div>
      )}
    </div>

    {/* Pet Info */}
    <h3 className="font-bold text-xl text-[#3A3B46] leading-7 text-center">
      {pet.name || "Unknown"}
    </h3>
    <PetTypeTag type={pet.species} />
  </div>
));

PetCard.displayName = "PetCard";

const PetsTab = memo(({ owner }) => {
  const [selectedPet, setSelectedPet] = useState(null);
  const pets = owner?.pets || [];

  const handlePetClick = useCallback((pet) => {
    setSelectedPet(pet);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPet(null);
  }, []);

  return (
    <>
      {/* Pet Detail Modal */}
      {selectedPet && (
        <PetDetailModal pet={selectedPet} onClose={handleCloseModal} />
      )}

      <div className="bg-white rounded-b-2xl md:rounded-2xl md:rounded-tl-none overflow-hidden">
        <div className="p-6 md:p-10 h-full">

          {pets.length > 0 ? (
            <div className="flex flex-wrap gap-4 justify-center items-center md:justify-start">
              {pets.map((pet, index) => (
                <PetCard
                  key={pet.id || index}
                  pet={pet}
                  onClick={handlePetClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-xl font-semibold text-[#7B7E8F] mb-2">
                No Pets Registered
              </h3>
              <p className="text-[#AEB1C3]">
                This pet owner hasn't registered any pets yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

PetsTab.displayName = "PetsTab";

export default PetsTab;
