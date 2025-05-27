import React, { useState, useEffect } from "react";

export default function BookingTab({ bookings, bookingsLoading }) {
  // State เพื่อเก็บ ID ของ bookings ที่ได้ดูแล้ว
  const [viewedBookings, setViewedBookings] = useState([]);
  // เพิ่ม state สำหรับ modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // โหลดข้อมูลการดูจาก localStorage เมื่อ component ถูกโหลด
  useEffect(() => {
    const storedViewedBookings = localStorage.getItem("viewedBookings");
    if (storedViewedBookings) {
      setViewedBookings(JSON.parse(storedViewedBookings));
    }
  }, []);

  // ตรวจสอบว่า booking ได้ถูกดูแล้วหรือไม่
  const isBookingViewed = (bookingId) => {
    return viewedBookings.includes(bookingId);
  };

  // บันทึกข้อมูลว่า booking ได้ถูกดูแล้ว
  const markAsViewed = (bookingId) => {
    const newViewedBookings = [...viewedBookings, bookingId];
    setViewedBookings(newViewedBookings);
    localStorage.setItem("viewedBookings", JSON.stringify(newViewedBookings));
  };

  // เปิด modal แสดงรายละเอียด
  const openBookingDetail = (booking) => {
    markAsViewed(booking.id);
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // ปิด modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Component สำหรับแสดงสถานะการจอง
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      "waiting for confirm": {
        color: "text-[#FA8AC0]",
        dot: "bg-[#FA8AC0]",
        text: "Waiting for confirm",
      },
      "in service": {
        color: "text-[#76D0FC]",
        dot: "bg-[#76D0FC]",
        text: "In service",
      },
      "waiting for service": {
        color: "text-[#F9C846]",
        dot: "bg-[#F9C846]",
        text: "Waiting for service",
      },
      success: {
        color: "text-[#1CCD83]",
        dot: "bg-[#1CCD83]",
        text: "Success",
      },
      cancelled: {
        color: "text-[#EA1010]",
        dot: "bg-[#EA1010]",
        text: "Cancelled",
      },
      default: {
        color: "text-[#7B7E8F]",
        dot: "bg-gray-400",
        text: "Unknown",
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.default;

    return (
      <span
        className={`flex items-center gap-2 font-medium whitespace-nowrap ${config.color}`}
      >
        <span
          className={`inline-block w-[6px] h-[6px] rounded-full ${config.dot}`}
        />
        {config.text}
      </span>
    );
  };

  // Component สำหรับ Modal แสดงรายละเอียดการจอง
  const BookingDetailModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#00000066]">
        <div className="bg-white rounded-2xl md:max-w-[800px] w-3/4 lg:w-full relative flex flex-col h-3/4 md:h-auto md:max-h-[800px]">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 md:px-10 py-6 border-b border-gray-200">
            <h2 className="text-lg md:text-2xl font-bold text-black">
              {booking.owner_name || "N/A"}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center text-4xl w-6 h-6 text-[#3A3B46] hover:text-gray-400"
            >
              &times;
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex flex-col gap-4 md:gap-6 px-6 md:px-10 py-6 overflow-y-auto flex-1">
            {/* Pet Owner Name */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">
                Pet Owner Name
              </h3>
              <p className="text-black font-medium">{booking.owner_name || "N/A"}</p>
            </div>

            {/* Pet(s) Count */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">Pet(s)</h3>
              <p className="text-black font-medium">{booking.pet_count || "N/A"}</p>
            </div>

            {/* Pet Detail */}
            {booking.pets && booking.pets.length > 0 && (
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-[#AEB1C3]">Pet Detail</h3>
                <div className="flex flex-wrap gap-4">
                  {booking.pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="text-center border border-[#DCDFED] p-6 gap-4 rounded-2xl bg-white w-[207px] h-[240px] flex flex-col items-center"
                    >
                      <div className="w-26 h-26 rounded-full overflow-hidden border-gray-200">
                        {pet.image ? (
                          <img
                            src={pet.image}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm text-gray-500">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-bold text-black text-xl">
                          {pet.name}
                        </p>
                        <span
                          className={`rounded-full border px-3 md:px-4 py-1 text-[15px] md:text-[16px] font-medium
                          ${
                            pet.type === "Dog"
                              ? "border-[#1CCD83] text-[#1CCD83] bg-[#E7FDF4]"
                              : ""
                          }
                          ${
                            pet.type === "Cat"
                              ? "border-[#FA8AC0] text-[#FA8AC0] bg-[#FFF0F1]"
                              : ""
                          }
                          ${
                            pet.type === "Rabbit"
                              ? "border-[#FF986F] text-[#FF986F] bg-[#FFF5EC]"
                              : ""
                          }
                          ${
                            pet.type === "Bird"
                              ? "border-[#76D0FC] text-[#76D0FC] bg-[#ECFBFF]"
                              : ""
                          }
                          ${
                            pet.type === "Mouse"
                              ? "border-[#F9C846] text-[#F9C846] bg-[#FFF9E3]"
                              : ""
                          }
                          ${
                            pet.type === "Turtle"
                              ? "border-[#A084E8] text-[#A084E8] bg-[#F3F0FF]"
                              : ""
                          }
                          ${
                            pet.type === "Snake"
                              ? "border-[#FF5B5B] text-[#FF5B5B] bg-[#FFECEC]"
                              : ""
                          }
                          ${
                            ![
                              "Dog",
                              "Cat",
                              "Rabbit",
                              "Bird",
                              "Mouse",
                              "Turtle",
                              "Snake",
                            ].includes(pet.type)
                              ? "border-[#AEB1C3] text-gray-600 bg-gray-100 border"
                              : ""
                          }
                        `}
                        >
                          {pet.type || "Pet"}
                        </span>
                      </div>
                    </div>
                  )) || "N/A"}
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">Duration</h3>
              <p className="text-black font-medium">
                {booking.duration || "0"} hours
              </p>
            </div>

            {/* Booking Date */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">Booking Date</h3>
              <p className="text-black font-medium">{booking.booked_date || "N/A"}</p>
            </div>

            {/* Total Paid */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">Total Paid</h3>
              <p className="text-black font-medium">
                {parseFloat(booking.total_price).toFixed(2) || "N/A"} THB
              </p>
            </div>

            {/* Transaction Date */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">
                Transaction Date
              </h3>
              <p className="text-black font-medium">
                {booking.transaction_date || "N/A"}
              </p>
            </div>

            {/* Transaction No. */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">
                Transaction No.
              </h3>
              <p className="text-black font-medium">
                {booking.transaction_no || "N/A"}
              </p>
            </div>

            {/* Additional Message */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">
                Additional Message
              </h3>
              <p className="text-black font-medium">
                {booking.message || "No additional message"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="bg-white rounded-r-2xl rounded-bl-2xl overflow-hidden w-full p-10">
        <div className="bg-white rounded-2xl overflow-x-auto w-full">
          <table className="min-w-[600px] w-full h-full">
            <thead>
              <tr className="bg-black text-white rounded-t-2xl">
                <th className="py-3 px-4 sm:px-6 text-left rounded-tl-2xl font-medium whitespace-nowrap">
                  Pet Owner Name
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-medium">
                  Pet(s)
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-medium">
                  Duration
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-medium whitespace-nowrap">
                  Booked Date
                </th>
                <th className="py-3 px-4 sm:px-6 text-left rounded-tr-2xl font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bookingsLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    No booking history found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="cursor-pointer border-b border-[#DCDFED] last:border-0 hover:bg-gray-50 transition"
                    onClick={() => openBookingDetail(booking)}
                  >
                    <td className="font-medium py-4 px-6 h-[76px]">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {!isBookingViewed(booking.id) && (
                          <span className="inline-block w-[8px] h-[8px] rounded-full bg-[#FF7037]" />
                        )}
                        <span>{booking.owner_name}</span>
                      </div>
                    </td>
                    <td className="font-medium py-4 px-6 h-[76px]">
                      {booking.pet_count || 0}
                    </td>
                    <td className="font-medium py-4 px-6 h-[76px] whitespace-nowrap">
                      {booking.duration || "0"} hours
                    </td>
                    <td className="font-medium py-4 px-6 h-[76px] whitespace-nowrap">
                      {booking.booked_date}
                    </td>
                    <td className="font-medium py-4 px-6 h-[76px]">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BookingDetailModal booking={selectedBooking} onClose={closeModal} />
      )}
    </div>
  );
}
