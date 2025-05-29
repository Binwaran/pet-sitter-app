'use client';

import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import BookingSteps from '@/components/booking/BookingSteps';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import { PetSelectionList } from '@/components/booking/PetSelectionCard';
import axios from 'axios';


export default function BookingPage() {
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [userId, setUserId] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePetSelect = (petId) => {
    setSelectedPetIds((prevSelected) => {
      if (prevSelected.includes(petId)) {
        return prevSelected.filter((id) => id !== petId);
      } else {
        return [...prevSelected, petId];
      }
    });
  };

  useEffect(() => {
    // ตัวอย่าง: สมมติ userId มาจาก localStorage หรือ context จริงควรใช้ AuthContext
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserId(userObj.id);
      } catch {
        setUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    axios.get(`/api/pets?ownerId=${userId}`)
      .then(res => {
        setPets(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Error loading pets');
        setLoading(false);
      });
  }, [userId]);

  const updatedBookingDetails = {
    pet: selectedPetIds.length > 0 ? selectedPetIds.join(', ') : 'No pet selected',
    pets: pets.filter(pet => selectedPetIds.includes(pet.pet_id)),
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] p-4 md:p-6 lg:p-8">
        <div className="container mx-auto flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <BookingSteps currentStep={1} />
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Choose your pet</h2>
              {loading ? (
                <div className="text-gray-500">Loading pets...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <PetSelectionList
                  selectedPetIds={selectedPetIds}
                  onSelect={handlePetSelect}
                  userId={userId}
                  pets={pets}
                />
              )}
              <div className="flex justify-between mt-8">
                <button
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  onClick={() => console.log('Go Back')}
                >
                  Back
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                  onClick={() => console.log('Go Next')}
                  disabled={selectedPetIds.length === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="lg:sticky lg:top-8">
              <BookingSummaryCard bookingDetails={updatedBookingDetails} />
            </div>
          </div>
        </div>
       <div>
                  <img
          src="/assets/GraphicBookingPage.png"
          alt="Booking Graphic"
          className="hidden md:block absolute bottom-0 right-0 w-32 lg:w-48 xl:w-60"
        />

      </div>
      </div>
    </>
  );
}