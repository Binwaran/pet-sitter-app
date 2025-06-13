'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BookingModal from './BookingModal';

export default function BookNowButton({ sitterId }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);

  const handleClick = () => {
    if (loading) return;
    if (user) {
      setShowBooking(true);
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="ml-4 bg-orange-600 text-white text-sm sm:text-base font-medium py-2 px-4 rounded-full hover:bg-orange-200 hover:text-orange-600 transition cursor-pointer"
      >
        Book Now
      </button>

      {showBooking && (
        <BookingModal
          sitterId={sitterId}
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
        />
      )}
    </>
  );
}
