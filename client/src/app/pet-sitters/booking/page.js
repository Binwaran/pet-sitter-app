'use client';

import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import BookingSteps from '@/components/booking/BookingSteps';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import { PetSelectionList } from '@/components/booking/PetSelectionCard';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { supabase } from '@/utils/supabase';

export default function BookingPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [sitter, setSitter] = useState(null);
  const [total, setTotal] = useState(0);

  const handlePetSelect = (petId) => {
    setSelectedPetIds((prevSelected) =>
      prevSelected.includes(petId)
        ? prevSelected.filter((id) => id !== petId)
        : [...prevSelected, petId]
    );
  };

  // ดึงข้อมูล pet_sitter (สมมติ sitter_id มาจาก user หรือ env)
  const sitterId = user?.sitter_id || process.env.NEXT_PUBLIC_DEFAULT_SITTER_ID;
  useEffect(() => {
    if (sitterId) {
      supabase
        .from('pet_sitter')
        .select('trade_name')
        .eq('user_id', sitterId)
        .single()
        .then(({ data }) => setSitter(data));
    }
  }, [sitterId]);

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

  // คำนวณราคาเบื้องต้นหลังเลือกการ์ดสัตว์เลี้ยง
  useEffect(() => {
    const calcPrice = async () => {
      let sum = 0;
      const selectedPets = pets.filter((pet) => selectedPetIds.includes(pet.pet_id));
      for (const pet of selectedPets) {
        if (!pet.type || !pet.weight) continue;
        const res = await fetch('/api/calculate-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: pet.type?.toLowerCase() || pet.type,
            weight: pet.weight,
            startDate: new Date().toISOString().slice(0, 10), // สมมติวันเริ่มต้นวันนี้
            endDate: new Date().toISOString().slice(0, 10),
            specialDayFlags: []
          })
        });
        const data = await res.json();
        if (data.totalPrice) sum += data.totalPrice;
      }
      setTotal(sum);
    };
    if (selectedPetIds.length > 0) {
      calcPrice();
    } else {
      setTotal(0);
    }
  }, [selectedPetIds, pets]);

  // สมมติวันและเวลาเลือกได้จาก step ถัดไป หรือใช้วันนี้เป็นค่าเริ่มต้น
  const today = new Date();
  const date = today.toISOString().slice(0, 10); // yyyy-mm-dd
  const time = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // base bookingDetails ที่จะอัปเดต
  const baseBookingDetails = {
    sitterName: sitter?.trade_name || 'Pet Sitter',
    date,
    time,
    total,
  };

  // state เก็บ bookingDetails ที่ใช้แสดง summary
  const [bookingDetails, setBookingDetails] = useState(null);

  // โหลด bookingDetails จาก localStorage ตอนแรก
  useEffect(() => {
    const stored = localStorage.getItem('bookingDetails');
    if (stored) setBookingDetails(JSON.parse(stored));
  }, []);

  // อัปเดต bookingDetails และเซฟลง localStorage เมื่อ selectedPetIds, pets, total หรือ sitter เปลี่ยน
  useEffect(() => {
    const selectedPets = pets.filter(pet => selectedPetIds.includes(pet.pet_id));

    const newBookingDetails = {
      ...baseBookingDetails,
      pets: selectedPets,
      pet: selectedPets.map(p => p.pet_name || p.name || '').join(', '),
    };

    setBookingDetails(newBookingDetails);
    localStorage.setItem('bookingDetails', JSON.stringify(newBookingDetails));
  }, [selectedPetIds, pets, total, sitter]);

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
              <h2 className="text-xl  mb-2 my-2 text-gray-800">Choose your pet</h2>
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
                      // bookingDetails ก็เซฟแล้วจาก useEffect
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
             <BookingSummaryCard bookingDetails={bookingDetails || baseBookingDetails} />
            </div>
          </div>
        </div>
        <img
          src="/assets/GraphicBookingPage.png"
          alt="Booking Graphic"
          className="hidden md:block absolute bottom-0 right-0 w-32 lg:w-48 xl:w-60 pointer-events-none"
        />
      </div>
    </>
  );
}
