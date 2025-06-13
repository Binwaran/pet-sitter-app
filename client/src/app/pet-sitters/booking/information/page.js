'use client';

import React, { useEffect, useState } from 'react';
import BookingSteps from '@/components/booking/BookingSteps';
import { useRouter } from 'next/navigation';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import { AlertCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { generateTransactionNo } from '@/utils/generateTransactionNo';

export default function BookingInformationPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [selectedPets, setSelectedPets] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Load selected pets from localStorage
    const pets = JSON.parse(localStorage.getItem('bookingPets') || '[]');
    setSelectedPets(pets);
  }, []);

  useEffect(() => {
    // โหลด bookingDetails จาก localStorage (หลัง BookingModal จะมีข้อมูลครบ)
    const stored = localStorage.getItem('bookingDetails');
    if (stored) setBookingDetails(JSON.parse(stored));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // โหลดข้อมูลการจองที่มีอยู่แล้ว (เช่น ข้อมูล sitter, วันที่, เวลา, ยอดรวม)
    const existingBookingDetails = JSON.parse(localStorage.getItem('bookingDetails') || '{}');

    // สร้างหมายเลข transaction ที่นี่ก่อนบันทึก
    const currentTransactionNo = existingBookingDetails.transactionNo || generateTransactionNo(); 

    // สร้าง Transaction Date ปัจจุบัน
    const transactionDate = new Date().toLocaleDateString('en-GB', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    // --- เรียก API คำนวณราคา ---
    let total = 0;
    try {
      if (selectedPets.length > 0 && existingBookingDetails.date && existingBookingDetails.duration) {
        const startDate = existingBookingDetails.date;
        const daysMatch = existingBookingDetails.duration.match(/(\d+)/);
        const numDays = daysMatch ? parseInt(daysMatch[1], 10) : 1;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + numDays - 1);
        // รวมราคาทุกตัวจากข้อมูลใน state
        for (const pet of selectedPets) {
          if (!pet.type || !pet.weight) continue; // ข้ามถ้าไม่มีข้อมูลจำเป็น
          const res = await fetch('/api/calculate-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: pet.type?.toLowerCase() || pet.type,
              weight: pet.weight,
              startDate,
              endDate: endDate.toISOString().slice(0, 10),
              specialDayFlags: []
            })
          });
          const data = await res.json();
          if (data.totalPrice) total += data.totalPrice;
        }
      }
    } catch (err) {
      total = 0;
    }

    const bookingDetails = {
      ...existingBookingDetails, 
      ...form,
      pets: selectedPets,
      transactionNo: currentTransactionNo, 
      transactionDate: transactionDate, 
      total,
    };
    localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    localStorage.removeItem('bookingPets');
    router.push('/pet-sitters/booking/payment');
  };

  return (
    <>
    <NavBar />
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] p-4 md:p-6 lg:p-8 relative">
      <div className="container mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <BookingSteps currentStep={2} />
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Information</h2>
            <div className="flex flex-col gap-2 relative w-full">
              <label htmlFor="name" className="font-medium">Your Name*</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Full name"
              />
              {errors.name && <AlertCircle className="absolute right-3 top-10 text-red-500 w-5 h-5" />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="email" className="font-medium">Email*</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="youremail@company.com"
                />
                {errors.email && <AlertCircle className="absolute right-3 top-10 text-red-500 w-5 h-5" />}
              </div>
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="phone" className="font-medium">Phone*</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="xxx-xxx-xxxx"
                />
                {errors.phone && <AlertCircle className="absolute right-3 top-10 text-red-500 w-5 h-5" />}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-medium">Additional Message (To pet sitter)</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Type your message here..."
              />
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                onClick={() => router.back()}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </form>
        </div>
        <div className="w-full lg:w-1/3">
          <div className="lg:sticky lg:top-24 z-10">
            <BookingSummaryCard bookingDetails={bookingDetails || { ...form, pets: selectedPets }} />
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