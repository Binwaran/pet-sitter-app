'use client';

import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import BookingSteps from '@/components/booking/BookingSteps';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import { PetSelectionList } from '@/components/booking/PetSelectionCard';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Footer from '@/components/Footer';

export default function BookingPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPetIds, setSelectedPetIds] = useState([]);

  const handlePetSelect = (petId) => {
    setSelectedPetIds((prevSelected) =>
      prevSelected.includes(petId)
        ? prevSelected.filter((id) => id !== petId)
        : [...prevSelected, petId]
    );
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.id) {
      setLoading(false);
      setError('กรุณาเข้าสู่ระบบ');
      return;
    }

    setLoading(true);
    setError(null);

    axios.get(`/api/pets?ownerId=${user.id}`)
      .then((res) => {
        setPets(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Error loading pets');
        setLoading(false);
      });
  }, [user, authLoading]);

  const updatedBookingDetails = {
    pet: selectedPetIds.length > 0 ? selectedPetIds.join(', ') : 'No pet selected',
    pets: pets.filter((pet) => selectedPetIds.includes(pet.pet_id)),
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] p-4 md:p-6 lg:p-8 relative">
        <div className="container mx-auto flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 ">
              <BookingSteps currentStep={1} />
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Choose your pet</h2>
              <div className="w-full mt-2">
                {loading ? (
                  <div className="text-gray-500">Loading pets...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : (
                  <PetSelectionList
                    pets={pets}
                    selectedPetIds={selectedPetIds}
                    onSelect={handlePetSelect}
                    cardClassName="w-48 h-56 bg-white border-2 rounded-2xl flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-200 shadow-sm"
                    selectedCardClassName="border-orange-500 shadow-md"
                    unselectedCardClassName="border-gray-200 hover:border-orange-300"
                    disabledCardClassName="opacity-50 pointer-events-none"
                  />
                )}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-[#FFF6F0] hover:bg-gray-100 transition-colors font-medium"
                  onClick={() => console.log('Go Back')}
                >
                  Back
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                  onClick={() => {
                    if (selectedPetIds.length > 0) {
                      // Save selected pets and ids to localStorage
                      localStorage.setItem('selectedPetIds', JSON.stringify(selectedPetIds));
                      const selectedPets = pets.filter((pet) => selectedPetIds.includes(pet.pet_id));
                      localStorage.setItem('bookingPets', JSON.stringify(selectedPets));
                      window.location.href = '/pet-sitters/booking/information';
                    }
                  }}
                  disabled={selectedPetIds.length === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="lg:sticky lg:top-8 z-10">
              <BookingSummaryCard bookingDetails={updatedBookingDetails} />
            </div>
          </div>
        </div>
        <img
          src="/assets/GraphicBookingPage.png"
          alt="Booking Graphic"
          className="hidden md:block absolute bottom-0 right-0 w-32 lg:w-48 xl:w-60 pointer-events-none"
        />
      </div>

      <Footer />
    </>
  );
}
