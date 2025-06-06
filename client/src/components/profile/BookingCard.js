import Image from "next/image";

export default function BookingCard({ booking, onClick }) {
  const {
    pet_name,
    service_name,
    price,
    status,
    statusDate,
    booking_id,
    image = "/assets/pet-sitter.jpg",
    title = service_name || "Service",
    sitter_name = "John Doe",
    date = "1 Jan 2025",
    time = "09:00 - 12:00",
    duration = "3 hours",
    pet = pet_name || "My Pet",
    successDate = statusDate?.value,
    reviewed = false,
  } = booking;

  const renderFooter = () => {
    if (status === "Waiting for confirm") {
      return (
        <div className="bg-gray-100 px-4 py-3 mx-4 mb-4 flex justify-between items-center rounded-md">
          <span className="text-gray-500 text-sm">
            Waiting Pet Sitter for confirm booking
          </span>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#FF7037] text-white px-4 py-2 text-sm rounded-full hover:bg-orange-600 cursor-pointer">
              Send Message
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-orange-200 text-orange-500 hover:text-orange-600 cursor-pointer">
              <Image alt="Phone" src="/assets/icon-phone.svg" className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    if (status === "In service") {
      return (
        <div className="bg-gray-100 px-4 py-4 mx-4 mb-4 flex justify-between items-center rounded-md">
          <span className="text-gray-600 text-sm">
            Your pet is already in Pet Sitter care!
          </span>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2 text-sm rounded-full hover:bg-orange-600 cursor-pointer">
              Send Message
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-orange-200 text-orange-500 hover:text-orange-600 cursor-pointer">
              <Image alt="phone" src="/assets/icon-phone.svg" className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    if (status === "Success") {
      return (
        <div className="bg-green-100 px-4 py-4 mx-4 mb-4 flex justify-between items-center rounded-md">
          <span className="text-green-500 text-sm">
            Success date: {successDate}
          </span>
          <div className="flex gap-3">
            <button className="text-sm text-orange-600 hover:text-orange-800 cursor-pointer px-3">
              Report
            </button>
            {reviewed ? (
              <button className="text-sm text-orange-600 underline hover:text-orange-800 cursor-pointer">
                Your Review
              </button>
            ) : (
              <button className="flex items-center gap-2 bg-[#FF6B00] text-white px-8 py-2.5 text-sm rounded-full hover:bg-orange-600 cursor-pointer">
                Review
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`border border-gray-200 rounded-xl bg-white mb-6 overflow-hidden transition hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={() => onClick?.(booking.booking_id)} // ✅ ส่งเฉพาะ booking_id
    >
      {/* Header */}
      <div className="flex justify-between items-start p-4">
        <div className="flex gap-4 items-center">
          <Image
            src={image}
            alt="Pet sitter"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-lg">{title}</div>
            <div className="text-sm text-gray-500">By {sitter_name}</div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>
            {statusDate?.label || "Transaction date"}: {statusDate?.value}
          </div>
          <div
            className={`font-medium ${
              status === "Success"
                ? "text-green-600"
                : status === "In service"
                ? "text-blue-500"
                : "text-orange-500"
            }`}
          >
            {status === "Waiting" ? "Waiting for confirm" : status}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mx-4"></div>

      {/* Booking Info */}
      <div className="grid grid-cols-4 gap-4 text-sm p-4">
        <div className="col-span-2 flex flex-col">
          <span className="text-gray-500 font-medium mb-1">Date & Time:</span>
          <div>
            {date} | {time}
            <span className="text-orange-500 ml-2 cursor-pointer">Change</span>
          </div>
        </div>

        <div className="flex flex-col border-l border-gray-300 pl-4">
          <span className="text-gray-500 font-medium mb-1">Duration:</span>
          <div>{duration}</div>
        </div>

        <div className="flex flex-col border-l border-gray-300 pl-4">
          <span className="text-gray-500 font-medium mb-1">Pet:</span>
          <div>{pet}</div>
        </div>
      </div>

      {/* Footer */}
      {renderFooter()}
    </div>
  );
}
