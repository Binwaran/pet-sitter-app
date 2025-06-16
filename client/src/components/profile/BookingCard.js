"use client";
import Image from "next/image";
import Edit from "/public/assets/icon-edit.svg";
import { useRouter } from "next/navigation";

// เพิ่ม STATUS_MAP สำหรับกำหนดสีและข้อความตามสถานะ
const STATUS_MAP = {
  "waiting for confirm": {
    text: "Waiting for confirm",
    color: "text-[#FA8AC0]",
    dot: "bg-[#FA8AC0]",
    border: "border-[#DCDFED]", // เพิ่มสีขอบ
  },
  "waiting for service": {
    text: "Waiting for service",
    color: "text-[#F9C846]",
    dot: "bg-[#F9C846]",
    border: "border-[#DCDFED]", // เพิ่มสีขอบ
  },
  "in service": {
    text: "In service",
    color: "text-[#76D0FC]",
    dot: "bg-[#76D0FC]",
    border: "border-[#76D0FC]", // สีขอบ #76D0FC
  },
  success: {
    text: "Success",
    color: "text-[#1CCD83]",
    dot: "bg-[#1CCD83]",
    border: "border-[#DCDFED]", // เพิ่มสีขอบ
  },
  cancelled: {
    text: "Cancelled",
    color: "text-[#EA1010]",
    dot: "bg-[#EA1010]",
    border: "border-[#DCDFED]", // เพิ่มสีขอบ
  },
};

export default function BookingCard({ booking, onClick, onReview }) {
  const router = useRouter();

  const handleSendMessage = () => {
    const sitterId = booking.sitter_id || booking?.sitter_user_id;
    if (sitterId) {
      router.push(`/messages/${sitterId}`);
    } else {
    }
  };

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
    successTime = "12:00",
    reviewed = false,
  } = booking;

  // ดึงข้อมูลสถานะจาก STATUS_MAP หรือใช้ค่าเริ่มต้น
  const statusInfo = STATUS_MAP[status?.toLowerCase()] || {
    text: status || "Unknown",
    color: "text-gray-500",
    dot: "bg-gray-500",
    border: "border-[#DCDFED]", // ค่าเริ่มต้นของขอบ
  };

  const renderFooter = () => {
    if (status?.toLowerCase() === "waiting for confirm") {
      return (
        <div className="bg-[#F6F6F9] p-4 gap-2 flex flex-col md:flex-row justify-between items-start md:items-center rounded-lg">
          <span className="text-[#7B7E8F] text-sm leading-6 font-medium w-full md:w-auto">
            Waiting Pet Sitter for confirm booking
          </span>
          <div className="flex flex-row gap-4">
            <button
              className="flex items-center justify-center gap-2 bg-[#FF7037] py-3 px-6 rounded-full hover:bg-[#FF986F] cursor-pointer min-w-30"
              onClick={(e) => {
                e.stopPropagation(); // 👈 กันไม่ให้ไปกระตุ้น onClick การ์ด
                handleSendMessage();
              }}
            >
              <span className="font-bold leading-[150%] text-center text-white">
                Send Message
              </span>
            </button>
            <button className="flex items-center justify-center rounded-full gap-2 px-3 py-3 bg-[#FFF1EC] cursor-pointer">
              <Image
                width={24}
                height={24}
                alt="phone"
                src="/assets/icon-phone.svg"
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>
      );
    }

    if (status?.toLowerCase() === "in service") {
      return (
        <div className="bg-[#F6F6F9] p-4 gap-2 flex flex-col md:flex-row justify-between items-start md:items-center rounded-lg">
          <span className="text-[#7B7E8F] text-sm leading-6 font-medium w-full md:w-auto">
            Your pet is already in Pet Sitter care!
          </span>
          <div className="flex flex-row items-center gap-4">
            <button
              className="flex items-center justify-center gap-2 bg-[#FF7037] py-3 px-6 rounded-full hover:bg-[#FF986F] cursor-pointer min-w-30"
              onClick={(e) => {
                e.stopPropagation();
                handleSendMessage();
              }}
            >
              <span className="font-bold leading-[150%] text-center text-white">
                Send Message
              </span>
            </button>
            <button className="flex items-center justify-center rounded-full gap-2 px-3 py-3 bg-[#FFF1EC] cursor-pointer">
              <Image
                width={24}
                height={24}
                alt="phone"
                src="/assets/icon-phone.svg"
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>
      );
    }

    if (status?.toLowerCase() === "success") {
      return (
        <div className="bg-[#E7FDF4] p-4 gap-2 flex flex-col md:flex-row justify-between items-start md:items-center rounded-lg">
          <div className="flex flex-col text-[#1CCD83] text-sm leading-6 w-full">
            <span>Success date:</span>
            <div>
              {successDate} | {successTime ? `${successTime} AM` : ""}
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <button className="flex items-center justify-center gap-1 cursor-pointer px-0.5 py-1">
              <span className="text-[#FF7037] font-bold leading-[150%] hover:text-[#FF986F]">
                Report
              </span>
            </button>
            {reviewed ? (
              <button className="flex items-center gap-2 bg-[#FFF1EC] py-3 px-6 rounded-full cursor-pointer min-w-30">
                <span className="font-bold leading-[150%] text-center text-[#FF7037] hover:text-[#FF986F]">
                  Your Review
                </span>
              </button>
            ) : (
              <button
                className="flex items-center justify-center gap-2 bg-[#FF7037] py-3 px-6 rounded-full hover:bg-[#FF986F] cursor-pointer min-w-30"
                onClick={(e) => {
                  e.stopPropagation();
                  onReview?.(booking);
                }}
              >
                <span className="font-bold leading-[150%] text-center text-white">
                  Review
                </span>
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
      className={`border-1 ${
        statusInfo.border
      } rounded-2xl bg-white flex flex-col gap-4 p-4 overflow-hidden transition hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={() => onClick?.(booking.booking_id)}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between item-center pb-4 gap-2 border-b border-[#DCDFED]">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={image}
              alt="Pet sitter"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover self-start"
            />
            <div className="flex flex-col w-full">
              <div className="font-bold text-lg">{title}</div>
              <div className="font-medium text-sm">By {sitter_name}</div>
            </div>
          </div>
          <div>
            <div className="font-medium text-sm text-[#AEB1C3]">
              {statusDate?.label || "Transaction date"}: {statusDate?.value}
            </div>
            <div className={`font-medium flex items-center gap-1.5`}>
              <span
                className={`inline-block w-2 h-2 rounded-full ${statusInfo.dot}`}
              ></span>
              <span className={`${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center md:gap-8 gap-4">
          <div className="flex flex-col md:w-full">
            <span className="text-[#7B7E8F] font-medium text-sm leading-6">
              Date & Time:
            </span>
            <div className="flex flex-row gap-2 leading-7 items-center">
              <div className="font-medium">{date}</div>
              <span>|</span>
              <div className="font-medium">{time}</div>
              <div className="flex flex-row gap-1 px-0.5 py-1 cursor-pointer">
                <Image
                  src={Edit}
                  alt="Edit"
                  width={16}
                  height={16}
                  className="inline-block"
                />
                <span className="text-[#FF7037] font-bold leading-[150%]">
                  Change
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-9 bg-[#DCDFED]"></div>

          <div className="flex flex-col md:flex-row items-center md:gap-8 gap-4 md:w-full">
            <div className="flex flex-col md:w-full">
              <span className="text-[#7B7E8F] font-medium text-sm leading-6">
                Duration:
              </span>
              <div className="text-[#3A3B46] leading-7 font-medium">
                {duration}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-9 bg-[#DCDFED]"></div>

            <div className="flex flex-col md:w-full">
              <span className="text-[#7B7E8F] font-medium text-sm leading-6">
                Pet:
              </span>
              <div className="text-[#3A3B46] leading-7 font-medium">{pet}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      {renderFooter()}
    </div>
  );
}
