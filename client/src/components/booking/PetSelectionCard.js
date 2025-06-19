// 'use client'; // มีอยู่แล้วในไฟล์เดิม

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Tag from "../pet-sitters/tag";
import { useAuth } from "@/context/AuthContext";

const PetSelectionCard = ({ pet, isSelected, onSelect }) => {
  const router = useRouter();
  const { user } = useAuth();

  if (!pet) {
    return (
      <div className="w-full h-40 bg-red-100 text-red-700 rounded-xl flex items-center justify-center">
        Error: Missing pet data
      </div>
    );
  }

  if (pet.pet_type === "create-new") {
    return (
      <div
        className="w-60 h-64 bg-orange-50 border-2 border-orange-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors shadow-none"
        onClick={() => router.push('/pet-owners/edit-pet/new')}
      >
        <FontAwesomeIcon
          icon={faPlus}
          className="text-orange-400 text-5xl mb-3"
        />
        <span className="text-orange-500 font-semibold text-xl">
          Create New Pet
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-60 h-64 bg-white border-2 rounded-2xl flex flex-col items-center justify-between p-6 cursor-pointer transition-all duration-200 shadow-sm relative
        ${
          isSelected
            ? "border-orange-500 shadow-md"
            : "border-gray-200 hover:border-orange-300"
        }`}
      onClick={() => onSelect(pet.pet_id)}
    >
      <div className="absolute top-3 right-3 p-1 rounded-full z-10">
        {/* Custom Checkbox */}
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors duration-150
            ${
              isSelected
                ? "bg-orange-500 border-orange-500"
                : "bg-white border-gray-300"
            }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pet.pet_id);
          }}
          role="checkbox"
          aria-checked={isSelected}
          tabIndex={0}
        >
          {isSelected && (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </span>
      </div>
      <div className="relative w-28 h-28 mb-2">
        <Image
          src={pet.pet_image_url || "/mock/image1.webp"}
          alt={pet.pet_name || "Pet image"}
          className="rounded-full object-cover border-2 border-gray-200"
          fill={true}
          sizes="112px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="w-full flex flex-col items-center">
        <p className="font-bold text-gray-800 text-lg mb-1 truncate w-full text-center">
          {pet.pet_name}
        </p>
        {Array.isArray(pet.pet_type) ? (
          <div className="flex gap-2 justify-center items-center mt-1">
            {pet.pet_type.map((type) => (
              <Tag key={type} type={type} />
            ))}
          </div>
        ) : (
          <Tag type={pet.pet_type} className="mx-auto" />
        )}
      </div>
    </div>
  );
};

const PetSelectionList = ({ pets = [], onSelect, selectedPetIds }) => {
  if (!Array.isArray(pets) || pets.length === 0)
    return <div>No pets found.</div>;

  const filteredPets = pets.filter(
    (pet) =>
      pet &&
      typeof pet === "object" &&
      (typeof pet.pet_id === "string" || typeof pet.pet_id === "number") &&
      pet.pet_id !== "create-new"
  );

  // แถวแรก: การ์ดสัตว์เลี้ยง (สูงสุด 3 ตัว)
  const firstRow = filteredPets.slice(0, 3);
  // แถวสอง: การ์ด Create New Pet + ที่เหลือ (ถ้ามี)
  const secondRow = [
    ...filteredPets.slice(3),
    { pet_id: "create-new", pet_type: "create-new" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {firstRow.map((pet) => (
          <div key={pet.pet_id} className="flex flex-col items-center">
            <PetSelectionCard
              pet={pet}
              isSelected={selectedPetIds.includes(pet.pet_id)}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secondRow.map((pet, idx) => (
          <div key={pet.pet_id || idx} className="flex flex-col items-center">
            <PetSelectionCard
              pet={pet}
              isSelected={selectedPetIds.includes(pet.pet_id)}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { PetSelectionCard as default, PetSelectionList };
