'use client';

import React, { useState, useEffect } from 'react';
import BookingSteps from '@/components/booking/BookingSteps';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import { useRouter } from 'next/navigation';

export default function BookingPaymentPage() {
  const [form, setForm] = useState({
    cardNumber: '',
    cardOwner: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState({});
  const [bookingDetails, setBookingDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('bookingDetails');
    if (stored) {
      setBookingDetails(JSON.parse(stored));
    } else {
      router.push('/pet-sitters/booking');
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!form.cardOwner.trim()) newErrors.cardOwner = 'Card owner is required';
    if (!form.expiry.trim()) newErrors.expiry = 'Expiry date is required';
    if (!form.cvc.trim()) newErrors.cvc = 'CVC/CVV is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert('Please fill in all required fields.');
      return;
    }
    alert('Booking confirmed!');
    localStorage.removeItem('bookingDetails');
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] p-4 md:p-6 lg:p-8 relative">
      <div className="container mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <BookingSteps currentStep={3} />
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Credit Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="cardNumber" className="font-medium">Card Number*</label>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  value={form.cardNumber}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                />
                {errors.cardNumber && <span className="text-red-500 text-sm mt-1">{errors.cardNumber}</span>}
              </div>
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="cardOwner" className="font-medium">Card Owner Name*</label>
                <input
                  id="cardOwner"
                  name="cardOwner"
                  type="text"
                  value={form.cardOwner}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.cardOwner ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Full name as shown on card"
                />
                {errors.cardOwner && <span className="text-red-500 text-sm mt-1">{errors.cardOwner}</span>}
              </div>
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="expiry" className="font-medium">Expiry Date*</label>
                <input
                  id="expiry"
                  name="expiry"
                  type="text"
                  value={form.expiry}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="MM/YY"
                />
                {errors.expiry && <span className="text-red-500 text-sm mt-1">{errors.expiry}</span>}
              </div>
              <div className="flex flex-col gap-2 relative">
                <label htmlFor="cvc" className="font-medium">CVC/CVV*</label>
                <input
                  id="cvc"
                  name="cvc"
                  type="text"
                  value={form.cvc}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="xxx"
                />
                {errors.cvc && <span className="text-red-500 text-sm mt-1">{errors.cvc}</span>}
              </div>
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
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
        <div className="w-full lg:w-1/3">
          <div className="lg:sticky lg:top-24 z-10">
            <BookingSummaryCard bookingDetails={bookingDetails} />
          </div>
        </div>
      </div>
      <img
        src="/assets/GraphicBookingPage.png"
        alt="Booking Graphic"
        className="hidden md:block absolute bottom-0 right-0 w-32 lg:w-48 xl:w-60"
      />
    </div>
  );
}