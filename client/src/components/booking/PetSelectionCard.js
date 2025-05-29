'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Tag from '../pet-sitters/tag';

const PetSelectionCard = ({ pet, isSelected, onSelect }) => {
  const router = useRouter();

  if (pet.pet_type === 'create-new') {
    return (
      <div
        className="w-full h-40 md:h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={() => router.push('/add-pet')}
      >
        <FontAwesomeIcon icon={faPlus} className="text-gray-500 text-3xl mb-2" />
        <span className="text-gray-600 font-medium">Create New Pet</span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 bg-white p-3 flex flex-col items-center space-y-2
        ${isSelected ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-orange-300'}
      `}
      onClick={() => onSelect(pet.pet_id)}
    >
      {/* Checkbox */}
     <div className="absolute top-2 right-2 p-1  rounded-full z-10 ">
  <input
    type="checkbox"
    checked={isSelected}
    onChange={() => onSelect(pet.pet_id)}
    className="h-5 w-5 text-orange-400 border-gray-100 focus:ring-orange-400 rounded"
  />
</div>


      {/* Image */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden">
        <Image
          src={pet.pet_image_url || '/mock/image1.webp'}
          alt={pet.pet_name || 'Pet image'}
          fill
          className="object-cover"
        />
      </div>

      {/* Name and Tags */}
      <div className="text-center space-y-1">
        <p className="font-semibold text-gray-800 text-base">{pet.pet_name}</p>
        {Array.isArray(pet.pet_type) ? (
          <div className="flex flex-wrap gap-2 justify-center">
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

export const PetSelectionList = ({ pets, selectedPetIds, onSelect }) => {
  if (!pets || pets.length === 0) {
    return <div className="text-gray-500">No pets found.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pets.map((pet) => (
        <div
          key={pet.pet_id}
          className={`border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 ${selectedPetIds.includes(pet.pet_id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
          onClick={() => onSelect(pet.pet_id)}
        >
          <img
            src={pet.image_url || '/assets/placeholder-profile.jpg'}
            alt={pet.name}
            className="w-16 h-16 rounded-full object-cover border border-gray-200"
          />
          <div>
            <div className="font-bold text-lg">{pet.name}</div>
            <div className="text-gray-500 text-sm">{pet.type}</div>
          </div>
          <div className="ml-auto">
            <input
              type="checkbox"
              checked={selectedPetIds.includes(pet.pet_id)}
              readOnly
              className="w-5 h-5 accent-orange-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export { PetSelectionCard as default };
