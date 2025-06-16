'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NavBar from '@/components/NavBar';
import {generateTransactionNo} from '@/utils/generateTransactionNo';
import { supabase } from '@/utils/supabase';
import MyplaceSection from '@/components/pet-sitters/MyPlaceSection';

export default function BookingThankYouPage() {
  const [booking, setBooking] = useState(null);
  const [sitter, setSitter] = useState(null);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const router = useRouter();

  // Fetch and update total price if bookingDetails is present
  useEffect(() => {
    const stored = localStorage.getItem('bookingDetails');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.transactionNo) {
        parsed.transactionNo = generateTransactionNo();
        localStorage.setItem('bookingDetails', JSON.stringify(parsed));
      }
      setBooking(parsed);
      // Fetch sitter trade_name if needed
      if (parsed.sitter_id) {
        supabase
          .from('pet_sitter')
          .select('*')
          .eq('user_id', parsed.sitter_id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching sitter info:", error);
              setSitter(null);
            } else {
              setSitter(data);
            }
          });
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!booking) return null;

  const data = booking;
  const sitterName = data.sitterTradeName || sitter?.trade_name || 'Pet Sitter';
  const durationHour = data.duration_hour || data.duration || '-';
  function formatTimeHM(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  const timeRange = data.start_time && data.end_time
    ? `${formatTimeHM(data.start_time)} - ${formatTimeHM(data.end_time)}`
    : data.time || '-';

  return (
    <>
      <NavBar/>
      {/* Container หลักที่ครอบทั้งหน้าจอ และมี Background Elements อยู่ด้านหลังสุด */}
      <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        {/* BG Elements - ตอนนี้จะแสดงผลทั้งบน Mobile และ Desktop */}
        <Image src="/assets/booking8-left.png" alt="bg1" width={288} height={377} className="absolute left-8 top-0 z-0" /> {/* Removed hidden md:block */}
        <Image src="/assets/booking8-bottom.png" alt="bg2" width={311} height={465} className="absolute right-0 bottom-0 z-0" /> {/* Removed hidden md:block */}

        {/* Main Card - ให้มี z-index สูงกว่า BG Elements */}
        <div className="relative z-10 w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-lg bg-white mb-6">
          <div className="bg-black text-white text-center py-7 px-6">
            <h1 className="text-3xl font-bold mb-2">Thank You For Booking</h1>
            <p className="text-base font-normal opacity-80">We will send your booking information to Pet Sitter.</p>
          </div>
          <div className="p-8 pb-4">
            <div className="text-xs text-gray-400 mb-2">
              Transaction Date: {data.transactionDate} <br/>
              Transaction No. : {data.transactionNo}
            </div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-gray-400">Pet Sitter:</div>
                <div className="text-sm text-gray-800 font-medium">{sitterName}</div>
              </div>
              <button
                onClick={() => setShowMapPopup(true)}
                className="flex items-center text-orange-500 text-sm font-medium hover:underline cursor-pointer"
              >
                <Image
                  src="/assets/icon=map-marker.png"
                  alt="map"
                  width={18}
                  height={18}
                  className="mr-1"
                  style={{
                    filter:
                      "invert(48%) sepia(99%) saturate(749%) hue-rotate(359deg) brightness(101%) contrast(101%)",
                  }}
                />
                View Map
              </button>
              {showMapPopup && sitter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
                    <button
                      onClick={() => setShowMapPopup(false)}
                      className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                      aria-label="Close"
                    >
                      ×
                    </button>

                    <MyplaceSection sitter={sitter} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-6 mb-2">
              <div className="flex flex-col">
                <div className="text-xs text-gray-400 mb-0.5">Date & Time:</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-800 font-medium">{data.date}</div>
                  <span className="mx-2 text-gray-300">|</span>
                  <div className="text-sm text-gray-800 font-medium">{timeRange}</div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xs text-gray-400 mb-0.5">Duration:</div>
                <div className="text-sm text-gray-800 font-medium">{durationHour} Hours</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-gray-400">Pet:</div>
              <div className="text-sm text-gray-800 font-medium">
                {Array.isArray(data.pets)
                  ? data.pets.map(p => p.pet_name).join(', ')
                  : data.pets}
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{parseFloat(data.total).toLocaleString(undefined, { minimumFractionDigits: 2 })} THB</span>
            </div>
          </div>
        </div>
       {/* Buttons for Mobile and Desktop View - ให้มี z-index สูงกว่า BG Elements */}
       <div className="relative z-10 flex flex-col sm:flex-row w-full max-w-sm gap-4 px-4 sm:px-0">
            <button
              className="flex-1 py-3 rounded-[99px] bg-white border border-orange-500 text-orange-500 font-semibold hover:bg-orange-50 transition hover:text-white hover:bg-orange-500 text-lg"
              onClick={() => console.log("Booking Detail clicked")}
            >
              Booking Detail
            </button>
            <button
              className="flex-1 py-3 rounded-[99px] bg-orange-500 text-white font-semibold hover:bg-orange-600 transition text-lg"
              onClick={() => {
                localStorage.removeItem('bookingDetails');
                localStorage.removeItem('bookingPets');
                localStorage.removeItem('selectedPetIds');
                router.push('/');
              }}
            >
              Back To Home
            </button>
          </div>
      </div>
    </>
  );
}