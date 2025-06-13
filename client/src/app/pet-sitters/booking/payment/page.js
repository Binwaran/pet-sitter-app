'use client';

import React, { useState, useEffect } from 'react';
import BookingSteps from '@/components/booking/BookingSteps';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import BookingConfirmationModal from '@/components/booking/BookingConfirmationModal';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react'; 
import Image from 'next/image';
import NavBar from '@/components/NavBar';

export default function BookingPaymentPage() {
  const [form, setForm] = useState({
    cardNumber: '',
    cardOwner: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState({});
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentType, setPaymentType] = useState('credit'); // 'credit' or 'cash'
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
    if (paymentType === 'cash') {
      setShowModal(true);
      return;
    }
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert('Please fill in all required fields.');
      return;
    }
    setShowModal(true);
  };

  const handleConfirmBooking = () => {
    setShowModal(false);
    router.push('/pet-sitters/booking/thankyou');
  };

  return (
    <>
    < NavBar/>
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] p-4 md:p-6 lg:p-8 relative">
      <div className="container mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <BookingSteps currentStep={3} />
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">
            {/* Payment Type Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                className={`flex-1 py-3 rounded-full border-2 text-lg font-semibold transition-colors flex items-center justify-center gap-2
                  ${paymentType === 'credit' ? 'bg-[#FFF6F0] border-orange-500 text-orange-500 shadow-[0_2px_8px_0_rgba(255,122,0,0.08)]' : 'bg-white border-[#E4E4E7] text-[#AEB1C3]'}`}
                style={{ minHeight: 56 }}
                onClick={() => setPaymentType('credit')}
              >
                <Image src="/assets/card.png" alt="credit card" width={28} height={28} className="mr-2" />
                Credit Card
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded-full border-2 text-lg font-semibold transition-colors flex items-center justify-center gap-2
                  ${paymentType === 'cash' ? 'bg-[#FFF6F0] border-orange-500 text-orange-500 shadow-[0_2px_8px_0_rgba(255,122,0,0.08)]' : 'bg-white border-[#E4E4E7] text-[#AEB1C3]'}`}
                style={{ minHeight: 56 }}
                onClick={() => setPaymentType('cash')}
              >
                <Image src="/assets/cash.png" alt="cash" width={28} height={28} className="mr-2" />
                Cash
              </button>
            </div>
            {/* Payment Form Fields */}
            {paymentType === 'credit' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Number */}
                <div className="flex flex-col gap-2 relative">
                  <label htmlFor="cardNumber" className="font-medium">Card Number*</label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={form.cardNumber}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="XX-XXXX-XXXX-XXXX"
                  />
                  {errors.cardNumber && (
                    <AlertCircle className="absolute right-3 top-10 text-red-500 w-5 h-5" />
                  )}
                </div>
                {/* Card Owner */}
                <div className="flex flex-col gap-2 relative">
                  <label htmlFor="cardOwner" className="font-medium">Card Owner*</label>
                  <input
                    id="cardOwner"
                    name="cardOwner"
                    type="text"
                    value={form.cardOwner}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.cardOwner ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Full name as shown on card"
                  />
                  {errors.cardOwner && (
                    <AlertCircle className="absolute right-3 top-10 text-red-500 w-5 h-5" />
                  )}
                </div>
                {/* Expiry */}
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
                  {errors.expiry && (
                    <AlertCircle className="absolute right-3 top-10 text-red-500 w-5 h-5" />
                  )}
                </div>
                {/* CVC */}
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
                  {errors.cvc && (
                    <AlertCircle className="absolute right-3 top-10 text-red-500 w-5 h-5" />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[220px] bg-[#F6F6F9] rounded-2xl">
                <Image src="/assets/pawPink.png" alt="cash paw" width={120} height={120} className="mb-6" />
                <div className="text-xl text-[#3A3B46] text-center max-w-xl font-medium leading-relaxed">
                  If you want to pay by cash,<br />
                  you are required to make a cash payment<br />
                  upon arrival at the pet sitter&apos;s location.
                </div>
              </div>
            )}

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
          <BookingConfirmationModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirmBooking}
          />
        </div>
        <div className="w-full lg:w-1/3">
          <div className="lg:sticky lg:top-24 z-10">
            <BookingSummaryCard bookingDetails={bookingDetails} sitterTradeName={bookingDetails?.trade_name} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
