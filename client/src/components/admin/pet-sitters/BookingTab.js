import React, { useState, useEffect, useCallback, memo, useMemo } from "react";

// แยก constants สำหรับสถานะการจองเพื่อลดการซ้ำซ้อน
const STATUS_CONFIG = {
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

// แยก constants สำหรับประเภทสัตว์เลี้ยงเพื่อลดการซ้ำซ้อน
const PET_TYPE_STYLES = {
  Dog: "border-[#1CCD83] text-[#1CCD83] bg-[#E7FDF4]",
  Cat: "border-[#FA8AC0] text-[#FA8AC0] bg-[#FFF0F1]",
  Rabbit: "border-[#FF986F] text-[#FF986F] bg-[#FFF5EC]",
  Bird: "border-[#76D0FC] text-[#76D0FC] bg-[#ECFBFF]",
  Mouse: "border-[#F9C846] text-[#F9C846] bg-[#FFF9E3]",
  Turtle: "border-[#A084E8] text-[#A084E8] bg-[#F3F0FF]",
  Snake: "border-[#FF5B5B] text-[#FF5B5B] bg-[#FFECEC]",
  default: "border-[#AEB1C3] text-gray-600 bg-gray-100",
};

// Component แสดงสถานะการจอง
const StatusBadge = memo(({ status }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.default;

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
});

StatusBadge.displayName = "StatusBadge";

// Component แสดงประเภทสัตว์เลี้ยง
const PetTypeTag = memo(({ type }) => {
  const style = PET_TYPE_STYLES[type] || PET_TYPE_STYLES.default;

  return (
    <span className={`px-2 py-1 text-sm border rounded-full ${style}`}>
      {type || "Unknown"}
    </span>
  );
});

PetTypeTag.displayName = "PetTypeTag";

// Component สำหรับข้อมูลในรายละเอียด
const DetailField = memo(({ label, value }) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-xl font-bold text-[#AEB1C3]">{label}</h3>
    <p className="text-black font-medium">{value}</p>
  </div>
));

DetailField.displayName = "DetailField";

// Component แสดงข้อมูลสัตว์เลี้ยง
const PetCard = memo(({ pet = {} }) => (
  <div className="text-center border border-[#DCDFED] p-6 gap-4 rounded-2xl bg-white w-[207px] h-[240px] flex flex-col items-center">
    <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200">
      {pet?.image ? (
        <img
          src={pet.image}
          alt={pet?.name || "Pet"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/client/public/assets/profile/profileimg.svg"; // เปลี่ยนเป็น path ที่ถูกต้อง
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm text-gray-500">No Image</span>
        </div>
      )}
    </div>
    <div className="flex flex-col items-center gap-2">
      <p className="font-bold text-black text-xl">
        {pet?.name || "Unknown Pet"}
      </p>
      <PetTypeTag type={pet?.type} />
    </div>
  </div>
));

PetCard.displayName = "PetCard";

// Component Modal แสดงรายละเอียดการจอง
const BookingDetailModal = memo(({ booking, onClose }) => {
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
          <DetailField
            label="Pet Owner Name"
            value={booking.owner_name || "N/A"}
          />
          <DetailField label="Pet(s)" value={booking.pet_count || "N/A"} />

          {/* Pet Detail */}
          {Array.isArray(booking.pets) && booking.pets.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">Pet Detail</h3>
              <div className="flex flex-wrap gap-4">
                {booking.pets.map((pet, index) => (
                  <PetCard key={pet.id || index} pet={pet} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#AEB1C3]">Pet Detail</h3>
              <p className="text-black font-medium">No pet details available</p>
            </div>
          )}

          <DetailField
            label="Duration"
            value={`${booking.duration || "0"} hours`}
          />
          <DetailField
            label="Booking Date"
            value={booking.booked_date || "N/A"}
          />
          <DetailField
            label="Total Paid"
            value={`${parseFloat(booking.total_price || 0).toFixed(2)} THB`}
          />
          <DetailField
            label="Transaction Date"
            value={booking.transaction_date || "N/A"}
          />
          <DetailField
            label="Transaction No."
            value={booking.transaction_no || "N/A"}
          />
          <DetailField
            label="Additional Message"
            value={booking.message || "No additional message"}
          />
        </div>
      </div>
    </div>
  );
});

BookingDetailModal.displayName = "BookingDetailModal";

export default function BookingTab({ bookings, bookingsLoading }) {
  // State hooks
  const [viewedBookings, setViewedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // เพิ่ม state สำหรับการเรียงลำดับ
  const [sortConfig, setSortConfig] = useState({
    key: "default", // เริ่มต้นใช้การเรียงลำดับเดิมตามที่ API ส่งมา
    direction: "desc",
  });

  // ฟังก์ชันจัดการการเรียงลำดับ
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      // ถ้าคลิกที่คอลัมน์เดิม
      if (prev.key === key) {
        // ถ้าเป็น desc อยู่แล้ว เปลี่ยนเป็น asc
        if (prev.direction === "desc") {
          return { key, direction: "asc" };
        }
        // ถ้าเป็น asc อยู่แล้ว เปลี่ยนกลับไปเป็น default (ยกเลิกการเรียง)
        else {
          return { key: "default", direction: "desc" };
        }
      }
      // ถ้าคลิกที่คอลัมน์ใหม่ เริ่มด้วย desc
      else {
        return { key, direction: "desc" };
      }
    });
  }, []);

  // 2. ปรับฟังก์ชัน sortedBookings ให้รองรับการเรียงลำดับทุกคอลัมน์
  const sortedBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    if (sortConfig.key === "default") return bookings;

    const sortableItems = [...bookings];

    return sortableItems.sort((a, b) => {
      // ตัวแปรสำหรับเก็บค่าที่จะนำมาเปรียบเทียบ
      let valueA, valueB;

      // ดึงค่าตามคอลัมน์ที่ต้องการเรียง
      switch (sortConfig.key) {
        case "owner_name":
          valueA = (a.owner_name || "").toLowerCase();
          valueB = (b.owner_name || "").toLowerCase();
          break;

        case "pet_count":
          valueA = parseInt(a.pet_count || 0);
          valueB = parseInt(b.pet_count || 0);
          break;

        case "duration":
          valueA = parseInt(a.duration || 0);
          valueB = parseInt(b.duration || 0);
          break;

        case "booked_date":
          // กรณีวันที่ ใช้โค้ดเดิม
          const startTimeA = a.start_time
            ? new Date(a.start_time)
            : new Date(0);
          const startTimeB = b.start_time
            ? new Date(b.start_time)
            : new Date(0);

          const startComparison =
            sortConfig.direction === "asc"
              ? startTimeA - startTimeB
              : startTimeB - startTimeA;

          // ถ้า start_time เท่ากัน ให้เรียงตาม end_time
          if (startComparison === 0) {
            const endTimeA = a.end_time ? new Date(a.end_time) : new Date(0);
            const endTimeB = b.end_time ? new Date(b.end_time) : new Date(0);

            return sortConfig.direction === "asc"
              ? endTimeA - endTimeB
              : endTimeB - endTimeA;
          }

          return startComparison;

        case "status":
          valueA = (a.status || "").toLowerCase();
          valueB = (b.status || "").toLowerCase();
          break;

        default:
          return 0; // ไม่มีการเรียงลำดับ
      }

      // เรียงลำดับตาม valueA และ valueB ยกเว้นกรณี booked_date
      // (ที่ได้ return ไปแล้วข้างบน)
      if (sortConfig.key !== "booked_date") {
        if (valueA < valueB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      }
    });
  }, [bookings, sortConfig]);

  // โหลดข้อมูลการดูจาก localStorage เมื่อ component ถูกโหลด
  useEffect(() => {
    try {
      const storedViewedBookings = JSON.parse(
        localStorage.getItem("viewedBookings") || "[]"
      );
      setViewedBookings(storedViewedBookings);
    } catch (e) {
      localStorage.removeItem("viewedBookings");
    }
  }, []);

  // ตรวจสอบว่า booking ได้ถูกดูแล้วหรือไม่
  const isBookingViewed = useCallback(
    (bookingId) => viewedBookings.includes(bookingId),
    [viewedBookings]
  );

  // บันทึกข้อมูลว่า booking ได้ถูกดูแล้ว และเปิด modal
  const openBookingDetail = useCallback(
    (booking) => {
      if (!isBookingViewed(booking.id)) {
        const newViewedBookings = [...viewedBookings, booking.id];
        setViewedBookings(newViewedBookings);
        localStorage.setItem(
          "viewedBookings",
          JSON.stringify(newViewedBookings)
        );
      }
      setSelectedBooking(booking);
      setIsModalOpen(true);
    },
    [viewedBookings, isBookingViewed]
  );

  // ปิด modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="bg-white rounded-r-2xl rounded-bl-2xl overflow-hidden w-full p-10">
        <div className="bg-white rounded-2xl overflow-x-auto w-full">
          <table className="min-w-[600px] w-full h-full">
            <thead>
              <tr className="bg-black text-white rounded-t-2xl">
                <th
                  className="py-3 px-4 sm:px-6 text-left rounded-tl-2xl font-medium whitespace-nowrap cursor-pointer hover:text-[#FF7037] transition-colors"
                  onClick={() => handleSort("owner_name")}
                >
                  Pet Owner Name
                  {sortConfig.key === "owner_name" && (
                    <span className="ml-1 inline-block">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="py-3 px-4 sm:px-6 text-left font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                  onClick={() => handleSort("pet_count")}
                >
                  Pet(s)
                  {sortConfig.key === "pet_count" && (
                    <span className="ml-1 inline-block">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="py-3 px-4 sm:px-6 text-left font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                  onClick={() => handleSort("duration")}
                >
                  Duration
                  {sortConfig.key === "duration" && (
                    <span className="ml-1 inline-block">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="py-3 px-4 sm:px-6 text-left font-medium whitespace-nowrap cursor-pointer hover:text-[#FF7037] transition-colors"
                  onClick={() => handleSort("booked_date")}
                >
                  Booked Date
                  {sortConfig.key === "booked_date" && (
                    <span className="ml-1 inline-block">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="py-3 px-4 sm:px-6 text-left rounded-tr-2xl font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {sortConfig.key === "status" && (
                    <span className="ml-1 inline-block">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
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
              ) : sortedBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    No booking history found.
                  </td>
                </tr>
              ) : (
                sortedBookings.map((booking) => (
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
