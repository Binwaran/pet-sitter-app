'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NavBar from '@/components/NavBar';

export default function BookingThankYouPage() {
  const [booking, setBooking] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // สมมุติว่าข้อมูล booking ถูกเก็บไว้ใน localStorage หลังจองเสร็จ
    const stored = localStorage.getItem('bookingDetails');
    if (stored) {
      setBooking(JSON.parse(stored));
    } else {
      // ถ้าไม่มี booking กลับไปหน้าแรก
      router.push('/');
    }
  }, [router]);

  if (!booking) return null; // รอจนกว่าจะโหลดข้อมูล booking
  const data = booking;



  return (
    <>
    <NavBar/>
    <div className="relative h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* BG Elements */}
      <Image src="/assets/booking8-left.png" alt="bg1" width={288} height={377} className="absolute left-8 top-0 z-0" />
      <Image src="/assets/booking8-bottom.png" alt="bg2" width={311} height={465} className="absolute right-0 bottom-0 z-0" />
      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-lg bg-white">
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
              <div className="text-sm text-gray-800 font-medium">{data.sitter}</div>
            </div>
            <a href="#" className="flex items-center text-orange-500 text-sm font-medium hover:underline">
              <Image src="/assets/icon=map-marker.png" alt="map" width={18} height={18} className="mr-1" style={{ filter: 'invert(48%) sepia(99%) saturate(749%) hue-rotate(359deg) brightness(101%) contrast(101%)' }} />
              View Map
            </a>
          </div>
          <div className="flex items-center gap-6 mb-2">
            <div className="flex flex-col">
              <div className="text-xs text-gray-400 mb-0.5">Date & Time:</div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-800 font-medium">{data.date}</div>
                <span className="mx-2 text-gray-300">|</span>
                <div className="text-sm text-gray-800 font-medium">{data.time}</div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-gray-400 mb-0.5">Duration:</div>
              <div className="text-sm text-gray-800 font-medium">{data.duration}</div>
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
     <div className="flex justify-center gap-4 py-6 ">
          <button className="px-6 py-2 rounded-full bg-[#FFF6F0] text-orange-500 font-semibold hover:bg-orange-100 transition">Booking Detail</button>
          <button className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition" onClick={() => router.push('/')}>Back To Home</button>
        </div>
    </div>
    </>
  );
}
