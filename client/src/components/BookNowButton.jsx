"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BookingModal from "./BookingModal";

export default function BookNowButton({ sitterId }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);

  const handleClick = () => {
    if (loading) return;
    if (user) {
      setShowBooking(true);
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-[#FF7037] px-2 py-1.5 md:py-3 md:px-6 rounded-full hover:bg-[#FF986F] active:scale-95 transition-transform duration-100 cursor-pointer whitespace-nowrap"
      >
        <p className="text-white text-sm lg:text-base font-bold">Book Now</p>
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
