'use client';

import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import BookingSteps from '@/components/booking/BookingSteps';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import { PetSelectionList } from '@/components/booking/PetSelectionCard';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const [pets, setPets] = useState([]);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // ตัวอย่าง: ดึง userId จาก localStorage
    const storedUser = localStorage.getItem('user');
    let userId = null;
    if (storedUser) {
      try {
        userId = JSON.parse(storedUser).id;
      } catch {}
    }
    if (!userId) {
      setError('User not found');
      setLoading(false);
      return;
    }
    axios.get(`/api/pets?ownerId=${userId}`)
      .then(res => {
        setPets(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading pets');
        setLoading(false);
      });
  }, []);

  const handlePetSelect = (petId) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const handleNext = () => {
    if (selectedPetIds.length === 0) {
      alert('Please select at least one pet.');
      return;
    }
    localStorage.setItem('selectedPets', JSON.stringify(selectedPetIds));
    router.push('/pet-sitters/booking/information');
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] p-4 md:p-6 lg:p-8 relative">
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
                  pets={pets}
                />
              )}
              <div className="flex justify-between mt-8">
                <button
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  onClick={() => router.push('/')}
                >
                  Back
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                  onClick={handleNext}
                  disabled={selectedPetIds.length === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="lg:sticky lg:top-24 z-10">
              <BookingSummaryCard bookingDetails={{ pet: selectedPetIds.length > 0 ? selectedPetIds.join(', ') : 'No pet selected' }} />
            </div>
          </div>
        </div>
        <img
          src="/assets/GraphicBookingPage.png"
          alt="Booking Graphic"
          className="hidden md:block absolute bottom-0 right-0 w-32 lg:w-48 xl:w-60"
        />
      </div>
    </>
  );
}